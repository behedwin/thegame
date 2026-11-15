// Settings dialog: sound, volume, vibration, tips, opt-in notifications, help, stats, save export/import and wipe.
import { T } from '../content/texts';
import type { GameState, Settings } from '../core';
import { exportSave, importSave } from '../save/format';
import { h, showDialog } from './dialogs';
import { sfx, toast } from './feedback';
import { showHelp } from './help';
import { notificationsSupported, requestNotifyPermission } from './notifications';
import { showStats } from './stats';

export interface SettingsHost {
  state: () => GameState;
  /** Apply a settings patch; with `save` the app persists and re-renders. */
  apply: (patch: Partial<Settings>, save: boolean) => void;
  wipe: () => void;
  /** Replace the game with an imported state: the app persists it and reloads. */
  load: (state: GameState) => void;
}

type Flag = 'sound' | 'vibration' | 'tips' | 'notifyOfflineCap' | 'notifySeason';

export function openSettings(host: SettingsHost): void {
  const button = (text: string, testId: string, cls = 'btn wide') => h('button', { class: cls, text, testId });
  /** A toggle; `allow` may veto turning it on (notifications ask the OS for permission first). */
  const toggle = (label: string, key: Flag, testId = `toggle-${key}`, allow?: () => Promise<boolean>) => {
    const b = h('button', { class: 'toggle', text: label, testId, attrs: { 'aria-pressed': String(host.state().settings[key]) } });
    b.addEventListener('click', () => {
      const on = !host.state().settings[key];
      void (on && allow ? allow() : Promise.resolve(true)).then((ok) => {
        if (!ok) return toast(T.settings.notifyDenied);
        host.apply({ [key]: on }, true);
        b.setAttribute('aria-pressed', String(on));
      });
    });
    return b;
  };
  // Notifications: off by default and only in the app.
  const notify = notificationsSupported()
    ? [
        toggle(T.settings.notifyOfflineCap, 'notifyOfflineCap', 'notifyOfflineCap', requestNotifyPermission),
        toggle(T.settings.notifySeason, 'notifySeason', 'notifySeason', requestNotifyPermission),
        h('p', { class: 'muted', text: T.settings.notifyNote }),
      ]
    : [];
  const slider = h('input', {
    testId: 'volume',
    attrs: { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(host.state().settings.volume * 100)), 'aria-label': T.settings.volume, style: 'width:100%' },
  });
  slider.addEventListener('input', () => host.apply({ volume: Number(slider.value) / 100 }, false));
  slider.addEventListener('change', () => (sfx.buy(), host.apply({}, true)));
  const [help, stats, wipe] = [button(T.help.open, 'open-help'), button(T.stats.open, 'open-stats'), button(T.settings.wipe, 'wipe', 'btn danger wide')];
  help.addEventListener('click', showHelp);
  stats.addEventListener('click', () => showStats(host.state()));
  // Export and import share one text field. Import validates first and then needs a second press.
  const field = h('textarea', { class: 'save-text', testId: 'save-text', attrs: { rows: '3', placeholder: T.settings.saveText, 'aria-label': T.settings.saveText } });
  const [exp, imp] = [button(T.settings.export, 'export-save'), button(T.settings.import, 'import-save')];
  exp.addEventListener('click', () => {
    field.value = exportSave(host.state());
    field.select();
    void navigator.clipboard?.writeText(field.value).then(() => toast(T.settings.copied), () => undefined);
  });
  imp.addEventListener('click', () => {
    let next: GameState;
    try {
      next = importSave(field.value, Date.now());
    } catch {
      return toast(T.settings.importError);
    }
    if (imp.dataset.armed) return host.load(next);
    imp.dataset.armed = '1';
    imp.textContent = T.settings.importConfirm;
  });
  let armed = false;
  wipe.addEventListener('click', () => {
    if (armed) return host.wipe();
    armed = true;
    wipe.textContent = T.settings.wipeConfirm;
  });
  showDialog(
    T.settings.title,
    [toggle(T.settings.sound, 'sound'), h('label', { class: 'muted', text: T.settings.volume }, slider), toggle(T.settings.vibration, 'vibration'), toggle(T.settings.tips, 'tips'), ...notify, help, stats, exp, field, imp, wipe, h('p', { class: 'muted', text: T.settings.about })],
    [{ label: T.settings.close, primary: true }],
    'settings-dialog',
  );
}
