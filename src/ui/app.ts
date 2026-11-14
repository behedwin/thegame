// App shell: owns the game state, runs the loop, wires DOM events. Wall clock and
// Math.random live here and are injected into the pure core.
import { AUTOMATIONS } from '../content/registry';
import { BALANCE } from '../content/balance';
import { CUSTOMERS, systemName } from '../content/registry';
import { T } from '../content/texts';
import {
  activeBuffs,
  applyOffline,
  automationKps,
  buy,
  buyMerit,
  canPrestige,
  claimEvent,
  click,
  createInitialState,
  customersSigned,
  getAutomation,
  getEvent,
  kpPerClick,
  kpPerSecond,
  level,
  milestonesReached,
  pendingMerits,
  prestige,
  rollEvent,
  runKpForMerits,
  setSettings,
  spawnEvent,
  tick,
  touch,
  type GameState,
} from '../core';
import { buyMany, BULK_MODES, resolveBulk, type BulkMode } from '../core/bulk';
import { loadGame, saveGame, wipeGame } from '../save/storage';
import { h, showDialog } from './dialogs';
import { configureFeedback, floatText, haptic, sfx, toast } from './feedback';
import { fmt, fmtDuration } from './format';
import { NetworkView } from './network';
import { ShopList } from './shop';

const GEAR =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';
const SYNC =
  '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M12 4V1L8 5l4 4V6a6 6 0 0 1 5.7 7.9l1.5 1.5A8 8 0 0 0 12 4zm0 14a6 6 0 0 1-5.7-7.9L4.8 8.6A8 8 0 0 0 12 20v3l4-4-4-4z"/></svg>';

type Tab = 'automations' | 'upgrades' | 'prestige';
const AUTOSAVE_MS = 10_000;

export async function startApp(root: HTMLElement): Promise<void> {
  const loaded = await loadGame(Date.now());
  let state: GameState = loaded.state ?? createInitialState(Date.now());
  let wiping = false;
  let tab: Tab = 'automations';
  let bulk: BulkMode = 1;

  // ---------- DOM ----------
  const kpEl = h('span', { class: 'kp-value', testId: 'kp-value', text: '0' });
  const kpsEl = h('span', { testId: 'kps' });
  const kpcEl = h('span', {});
  const buffEl = h('div', { class: 'buff', attrs: { hidden: '' } });
  const settingsBtn = h('button', { class: 'icon-btn', testId: 'settings', attrs: { 'aria-label': T.settings.title } });
  settingsBtn.innerHTML = GEAR;

  const net = new NetworkView();
  const hub = h('button', { class: 'hub', testId: 'hub', attrs: { 'aria-label': T.hubAria } });
  hub.innerHTML = `${SYNC}<span>${T.hubLabel}</span>`;
  const floatLayer = h('div', { class: 'float-layer' });
  const eventSlot = h('div', { class: 'event-slot' });
  const hero = h(
    'section',
    { class: 'hero' },
    net.svg,
    h('div', { class: 'side-labels' }, h('span', { text: T.sourceSystems }), h('span', { text: T.targetSystems })),
    hub,
    floatLayer,
    eventSlot,
  );
  const customersEl = h('div', { class: 'customers', testId: 'customers' });

  const tabButtons = {
    automations: h('button', { class: 'tab', text: T.tabs.automations, testId: 'tab-automations' }),
    upgrades: h('button', { class: 'tab', text: T.tabs.upgrades, testId: 'tab-upgrades' }),
    prestige: h('button', { class: 'tab', text: T.tabs.prestige, testId: 'tab-prestige' }),
  };
  const panel = h('section', { class: 'panel' });
  const lists = {
    automations: new ShopList(h('div', { class: 'list' }), 'automations', (id, btn) => doBuy(id, btn)),
    upgrades: new ShopList(h('div', { class: 'list' }), 'upgrades', (id, btn) => doBuy(id, btn)),
    merits: new ShopList(h('div', { class: 'list' }), 'merits', (id) => doBuyMerit(id)),
  };
  const bulkLabel = (m: BulkMode) => (m === 1 ? T.bulk.one : m === 10 ? T.bulk.ten : T.bulk.max);
  const bulkButtons = BULK_MODES.map((m) => {
    const b = h('button', { class: 'bulk-opt', text: bulkLabel(m), testId: `bulk-${m}`, attrs: { 'aria-pressed': String(m === bulk) } });
    b.addEventListener('click', () => {
      bulk = m;
      lists.automations.bulk = m;
      lists.upgrades.bulk = m;
      for (const [i, o] of bulkButtons.entries()) o.setAttribute('aria-pressed', String(BULK_MODES[i] === m));
      render();
    });
    return b;
  });
  const bulkBar = h('div', { class: 'bulk', attrs: { role: 'group', 'aria-label': T.bulk.aria } }, ...bulkButtons);
  const prestigeInfo = h('div', { class: 'prestige-info' });
  const prestigeBtn = h('button', { class: 'btn primary wide', testId: 'prestige' });
  const prestigeView = h(
    'div',
    {},
    h('div', { class: 'prestige-card' }, h('h3', { text: T.prestige.title }), h('p', { text: T.prestige.intro }), prestigeInfo, prestigeBtn),
    h('h3', { class: 'list-title', text: T.prestige.shopTitle }),
    lists.merits.host,
  );

  root.replaceChildren(
    h(
      'div',
      { class: 'app' },
      h('header', { class: 'top' }, h('div', { class: 'brand', text: T.title }), settingsBtn),
      h(
        'section',
        { class: 'stats' },
        h('div', { class: 'kp' }, kpEl, h('span', { class: 'unit', text: ` ${T.currency}` })),
        h('div', { class: 'rates' }, kpsEl, h('span', { class: 'dot', text: '·' }), kpcEl),
        buffEl,
      ),
      hero,
      customersEl,
      h('nav', { class: 'tabs' }, tabButtons.automations, tabButtons.upgrades, tabButtons.prestige),
      panel,
    ),
  );

  // ---------- Actions ----------
  let saveQueued = false;
  function persist(): void {
    if (wiping || saveQueued) return;
    saveQueued = true;
    queueMicrotask(() => {
      saveQueued = false;
      state = touch(state, Date.now());
      void saveGame(state);
    });
  }

  function syncFeedbackSettings(): void {
    configureFeedback(state.settings.sound, state.settings.vibration);
  }

  function doClick(x: number, y: number): void {
    const gained = kpPerClick(state);
    state = click(state);
    const rect = hero.getBoundingClientRect();
    floatText(floatLayer, x - rect.left, y - rect.top, `+${fmt(gained)}`);
    hub.classList.remove('pop');
    void hub.offsetWidth; // restart the CSS animation
    hub.classList.add('pop');
    net.pulse();
    sfx.click();
    haptic('light');
    renderTop();
  }

  function doBuy(id: string, btn: HTMLElement): void {
    const before = state;
    state = bulk === 1 ? buy(state, id) : buyMany(state, id, resolveBulk(state, id, bulk));
    if (state === before) return;
    sfx.buy();
    haptic('medium');
    const card = btn.closest('.card');
    card?.classList.add('flash');
    setTimeout(() => card?.classList.remove('flash'), 300);
    const def = getAutomation(id);
    if (def && milestonesReached(level(state.automations, id)) > milestonesReached(level(before.automations, id))) {
      toast(T.toastMilestone(def.name, level(state.automations, id)), 'good');
      sfx.fanfare();
    }
    persist();
    render();
  }

  function doBuyMerit(id: string): void {
    const before = state;
    state = buyMerit(state, id);
    if (state === before) return;
    sfx.buy();
    haptic('medium');
    persist();
    render();
  }

  function doPrestige(): void {
    if (!canPrestige(state)) return;
    const gained = pendingMerits(state);
    showDialog(T.prestige.title, [T.prestige.confirm], [
      { label: T.cancel },
      {
        label: T.prestige.confirmYes,
        primary: true,
        testId: 'confirm-prestige',
        onClick: () => {
          state = prestige(state);
          lastCustomers = customersSigned(state);
          toast(T.prestige.done(fmt(gained)), 'good');
          sfx.fanfare();
          haptic('medium');
          persist();
          render();
        },
      },
    ]);
  }

  function openSettings(): void {
    let armed = false;
    const toggle = (label: string, key: 'sound' | 'vibration') => {
      const b = h('button', { class: 'toggle', text: label, attrs: { 'aria-pressed': String(state.settings[key]) } });
      b.addEventListener('click', () => {
        state = setSettings(state, { [key]: !state.settings[key] });
        b.setAttribute('aria-pressed', String(state.settings[key]));
        syncFeedbackSettings();
        persist();
      });
      return b;
    };
    const wipe = h('button', { class: 'btn danger wide', text: T.settings.wipe });
    wipe.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        wipe.textContent = T.settings.wipeConfirm;
        return;
      }
      wiping = true;
      void wipeGame().then(() => location.reload());
    });
    showDialog(
      T.settings.title,
      [toggle(T.settings.sound, 'sound'), toggle(T.settings.vibration, 'vibration'), wipe, h('p', { class: 'muted', text: T.settings.about })],
      [{ label: T.settings.close, primary: true }],
      'settings-dialog',
    );
  }

  function showWelcome(earned: GameState['kp'], awayMs: number, creditedMs: number): void {
    const owned = AUTOMATIONS.filter((a) => level(state.automations, a.id) > 0);
    const pickFrom = owned[Math.floor(Math.random() * owned.length)];
    const system = systemName(pickFrom ? (Math.random() < 0.5 ? pickFrom.from : pickFrom.to) : 'skolmjuk');
    showDialog(
      T.welcomeTitle,
      [
        h('p', { class: 'big-line', text: T.welcomeBody(system, fmt(earned)) }),
        h('p', { class: 'muted', text: T.welcomeAway(fmtDuration(awayMs), awayMs > creditedMs, fmtDuration(creditedMs)) }),
      ],
      [{ label: T.welcomeOk, primary: true, testId: 'welcome-ok' }],
      'welcome-dialog',
    );
    sfx.fanfare();
  }

  function resume(nowMs: number): void {
    const r = applyOffline(state, nowMs);
    state = r.state;
    if (r.creditedMs >= BALANCE.offline.dialogMinMs && r.earned.gt(0)) showWelcome(r.earned, r.awayMs, r.creditedMs);
  }

  // ---------- Rendering ----------
  let eventEl: HTMLElement | null = null;
  let lastCustomers = customersSigned(state);

  function renderTop(): void {
    kpEl.textContent = fmt(state.kp);
    kpsEl.textContent = `${fmt(kpPerSecond(state))} ${T.perSecond}`;
    kpcEl.textContent = `${fmt(kpPerClick(state))} ${T.perClick}`;
  }

  function renderEvent(): void {
    const active = state.activeEvent;
    if (!active && eventEl) {
      eventEl.remove();
      eventEl = null;
    }
    if (active && !eventEl) {
      const def = getEvent(active.id);
      if (!def) return;
      const remaining = Math.max(0, active.expiresAtMs - state.timeMs);
      const timer = h('div', { class: 'event-timer' });
      timer.style.animationDuration = `${remaining}ms`;
      eventEl = h(
        'button',
        { class: 'event-card', testId: 'event' },
        h('strong', { text: def.title }),
        h('span', { text: T.eventTap }),
        timer,
      );
      eventEl.addEventListener('click', () => {
        const res = claimEvent(state);
        state = res.state;
        if (res.event) {
          toast(res.event.claimText, 'event');
          sfx.event();
          haptic('medium');
          persist();
        }
        renderEvent();
      });
      eventSlot.append(eventEl);
      sfx.event();
    }
  }

  function prestigeUnlocked(): boolean {
    return state.prestiges > 0 || state.runEarned.gte(runKpForMerits(1).mul(0.25));
  }

  function render(): void {
    renderTop();
    const buffs = activeBuffs(state);
    if (buffs.length) {
      const b = buffs[0]!;
      buffEl.textContent = T.buffActive(b.mult, Math.ceil((b.untilMs - state.timeMs) / 1000));
      buffEl.hidden = false;
    } else buffEl.hidden = true;

    const signed = customersSigned(state);
    if (signed > lastCustomers) {
      toast(T.toastCustomer(CUSTOMERS[signed - 1]!.name), 'good');
      sfx.fanfare();
    }
    lastCustomers = signed;
    customersEl.textContent = signed ? `${T.customers(signed)} · ${CUSTOMERS[signed - 1]!.name}` : T.noCustomers;

    const counts: Record<string, number> = {};
    const kpsLog: Record<string, number> = {};
    for (const a of AUTOMATIONS) {
      counts[a.id] = level(state.automations, a.id);
      const k = automationKps(state, a);
      kpsLog[a.id] = k.gt(0) ? Math.max(0, k.log10() + 1) : 0;
    }
    net.update(counts, kpsLog);
    renderEvent();

    const showPrestige = prestigeUnlocked();
    tabButtons.prestige.hidden = !showPrestige;
    if (!showPrestige && tab === 'prestige') tab = 'automations';
    for (const [k, b] of Object.entries(tabButtons)) b.classList.toggle('active', k === tab);

    const wanted = tab === 'automations' ? lists.automations.host : tab === 'upgrades' ? lists.upgrades.host : prestigeView;
    if (panel.lastElementChild !== wanted) {
      if (tab === 'prestige') panel.replaceChildren(wanted);
      else panel.replaceChildren(bulkBar, wanted);
    }
    if (tab === 'automations') lists.automations.render(state);
    else if (tab === 'upgrades') lists.upgrades.render(state);
    else {
      const pending = pendingMerits(state);
      const next = runKpForMerits(pending.toNumber() + 1);
      prestigeInfo.replaceChildren(
        h('p', { class: 'merits-owned', text: T.prestige.merits(fmt(state.merits)) }),
        h('p', { text: T.prestige.pending(fmt(pending)) }),
        h('p', { class: 'muted', text: T.prestige.next(fmt(next)) }),
      );
      prestigeBtn.textContent = T.prestige.button(fmt(pending));
      prestigeBtn.disabled = !canPrestige(state);
      lists.merits.render(state);
    }
  }

  // ---------- Events ----------
  hub.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    doClick(e.clientX, e.clientY);
  });
  hub.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const r = hub.getBoundingClientRect();
      doClick(r.left + r.width / 2, r.top);
    }
  });
  hub.addEventListener('animationend', () => hub.classList.remove('pop'));
  settingsBtn.addEventListener('click', openSettings);
  for (const [k, b] of Object.entries(tabButtons)) {
    b.addEventListener('click', () => {
      tab = k as Tab;
      render();
    });
  }
  prestigeBtn.addEventListener('click', doPrestige);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      state = touch(state, Date.now());
      if (!wiping) void saveGame(state);
    } else {
      resume(Date.now());
      last = performance.now();
      render();
    }
  });
  window.addEventListener('pagehide', () => {
    state = touch(state, Date.now());
    if (!wiping) void saveGame(state);
  });

  // ---------- Loop ----------
  let last = performance.now();
  let rollAcc = 0;
  let renderAcc = 0;
  let saveAcc = 0;
  function frame(now: number): void {
    const dt = Math.min(1000, Math.max(0, now - last));
    last = now;
    state = tick(state, dt);
    rollAcc += dt;
    while (rollAcc >= BALANCE.events.rollIntervalMs) {
      rollAcc -= BALANCE.events.rollIntervalMs;
      const ev = rollEvent(state, Math.random);
      if (ev) state = spawnEvent(state, ev);
    }
    net.frame(dt / 1000);
    renderAcc += dt;
    if (renderAcc >= 100) {
      renderAcc = 0;
      render();
    }
    saveAcc += dt;
    if (saveAcc >= AUTOSAVE_MS) {
      saveAcc = 0;
      persist();
    }
    requestAnimationFrame(frame);
  }

  syncFeedbackSettings();
  if (loaded.error) toast(T.saveError);
  if (loaded.state) resume(Date.now());
  render();
  requestAnimationFrame(frame);
}
