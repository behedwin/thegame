// Help page ("Så spelar du") from the settings dialog: one collapsible section per src/content/help/ file.
import { HELP } from '../content/registry';
import { T } from '../content/texts';
import { closeTopDialog, h, showDialog } from './dialogs';

/** Starts the intro tour (031). Set by the app. */
export const helpHooks = { replay: () => {} };

export function showHelp(): void {
  const sections = HELP.map((s, i) => h('details', { testId: `help-${s.id}`, attrs: i === 0 ? { open: '' } : {} }, h('summary', { text: s.title }), ...s.body.map((p) => h('p', { text: p }))));
  const replay = h('button', { class: 'btn wide', testId: 'help-replay', text: T.help.replay });
  replay.addEventListener('click', () => {
    while (closeTopDialog());
    helpHooks.replay();
  });
  showDialog(T.help.title, [replay, h('div', { class: 'help', testId: 'help-list' }, ...sections)], [{ label: T.help.close, primary: true }], 'help-dialog');
}
