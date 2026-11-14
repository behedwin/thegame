// App shell: owns the game state, runs the loop, wires DOM events. Wall clock and
// Math.random live here and are injected into the pure core.
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BALANCE } from '../content/balance';
import { AUTOMATIONS, CUSTOMERS, systemName } from '../content/registry';
import { T } from '../content/texts';
import {
  activeBuffs,
  answerTicket,
  activeSeason,
  applyOffline,
  buy,
  type CalendarDay,
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
  milestoneName,
  milestonesReached,
  newAchievements,
  networkFlow,
  nextYearSpeedupPct,
  pendingMerits,
  prestige,
  prestigeUnlocked,
  receiveTicket,
  refillInboxOffline,
  rollEvent,
  runKpForMerits,
  setCalendar,
  setSettings,
  type Settings,
  spawnEvent,
  tick,
  touch,
  type GameState,
} from '../core';
import { buyMany, BULK_MODES, resolveBulk, type BulkMode } from '../core/bulk';
import { loadGame, saveGame, wipeGame } from '../save/storage';
import { closeTopDialog, h, showDialog } from './dialogs';
import { configureFeedback, floatText, haptic, setBackground, sfx, toast } from './feedback';
import { burst, countUp, motionOk, reducedMotion, ripple, shownValue } from './fx';
import { confetti, effectsFor, flashClass, stamp, yearTransition } from './celebrate';
import { fmt, fmtDuration } from './format';
import { isActivateKey } from './a11y';
import { AchievementList } from './achievements';
import { showCustomers } from './customers';
import { bindHold } from './hold';
import { NetworkView } from './network';
import { cancelNotifications, scheduleNotifications } from './notifications';
import { openSettings } from './settings';
import { ShopList } from './shop';
import { renderInboxButton, showTicket } from './inbox';
import { markTipSeen, nextTip, settleTips, TipBar } from './onboarding';

const GEAR =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';
const SYNC =
  '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M12 4V1L8 5l4 4V6a6 6 0 0 1 5.7 7.9l1.5 1.5A8 8 0 0 0 12 4zm0 14a6 6 0 0 1-5.7-7.9L4.8 8.6A8 8 0 0 0 12 20v3l4-4-4-4z"/></svg>';

/** Today's local calendar day, injected into the pure core for seasons. */
function today(): CalendarDay {
  const d = new Date();
  return { month: d.getMonth() + 1, day: d.getDate() };
}

const TABS = ['automations', 'upgrades', 'prestige', 'achievements'] as const;
type Tab = (typeof TABS)[number];
const AUTOSAVE_MS = 10_000;
/** Hold-to-sync repeat interval: about 8 clicks per second (see hold.ts). */
const HOLD_REPEAT_MS = 125;

export async function startApp(root: HTMLElement): Promise<void> {
  const loaded = await loadGame(Date.now());
  let state: GameState = setCalendar(loaded.state ?? createInitialState(Date.now()), today());
  let wiping = false;
  let tab: Tab = 'automations';
  let bulk: BulkMode = 1;

  // ---------- DOM ----------
  const kpEl = h('span', { class: 'kp-value', testId: 'kp-value', text: '0' });
  const kpsEl = h('span', { testId: 'kps' });
  const kpcEl = h('span', {});
  const buffEl = h('div', { class: 'buff', attrs: { hidden: '' } });
  const seasonEl = h('div', { class: 'buff season', testId: 'season', attrs: { hidden: '', role: 'status', 'aria-label': T.season.aria } });
  const settingsBtn = h('button', { class: 'icon-btn', testId: 'settings', attrs: { 'aria-label': T.settings.title } });
  settingsBtn.innerHTML = GEAR;
  const inboxBtn = h('button', { class: 'inbox-btn', testId: 'inbox', attrs: { hidden: '' } });

  const net = new NetworkView();
  const hub = h('button', { class: 'hub', testId: 'hub', attrs: { 'aria-label': T.hubAria } });
  hub.innerHTML = `${SYNC}<span>${T.hubLabel}</span>`;
  const floatLayer = h('div', { class: 'float-layer', attrs: { 'aria-hidden': 'true' } });
  const eventSlot = h('div', { class: 'event-slot' });
  const hero = h(
    'section',
    { class: 'hero' },
    net.svg,
    h('div', { class: 'side-labels' }, h('span', { text: T.sourceSystems }), h('span', { text: T.targetSystems })),
    net.tip,
    hub,
    floatLayer,
    eventSlot,
  );
  const tips = new TipBar(
    (id) => {
      state = markTipSeen(state, id);
      persist();
      render();
    },
    () => applySettings({ tips: false }, true),
  );
  const customersEl = h('div', {
    class: 'customers',
    testId: 'customers',
    attrs: { role: 'button', tabindex: '0', 'aria-label': T.customerList.open },
  });

  const tabButtons = {} as Record<Tab, HTMLElement>;
  for (const t of TABS) tabButtons[t] = h('button', { class: 'tab', attrs: { role: 'tab' }, text: T.tabs[t], testId: `tab-${t}` });
  const achievementList = new AchievementList();
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
  const tabViews: Record<Tab, { host: HTMLElement; bulk: boolean; render: () => void }> = {
    automations: { host: lists.automations.host, bulk: true, render: () => lists.automations.render(state) },
    upgrades: { host: lists.upgrades.host, bulk: true, render: () => lists.upgrades.render(state) },
    prestige: { host: prestigeView, bulk: false, render: () => renderPrestige() },
    achievements: { host: achievementList.host, bulk: false, render: () => achievementList.render(state) },
  };

  root.replaceChildren(
    h(
      'div',
      { class: 'app' },
      h('header', { class: 'top' }, h('div', { class: 'brand', text: T.title }), inboxBtn, settingsBtn),
      h(
        'section',
        { class: 'stats' },
        h('div', { class: 'kp' }, kpEl, h('span', { class: 'unit', text: ` ${T.currency}` })),
        h('div', { class: 'rates' }, kpsEl, h('span', { class: 'dot', text: '·' }), kpcEl),
        buffEl,
        seasonEl,
      ),
      hero,
      tips.host,
      customersEl,
      h('nav', { class: 'tabs', attrs: { role: 'tablist', 'aria-label': T.a11y.tabsAria } }, ...Object.values(tabButtons)),
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
    configureFeedback(state.settings.sound, state.settings.vibration, state.settings.volume);
  }

  function doClick(x: number, y: number): void {
    const gained = kpPerClick(state);
    state = click(state);
    const rect = hero.getBoundingClientRect();
    const [lx, ly] = [x - rect.left, y - rect.top];
    floatText(floatLayer, lx, ly, `+${fmt(gained)}`);
    flashClass(hub, 'pop', 300);
    ripple(hub, floatLayer);
    burst(floatLayer, lx, ly);
    if (motionOk()) net.pulse();
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
    const card = btn.closest<HTMLElement>('.card');
    flashClass(card, 'flash', 300);
    const fx = effectsFor(bulk === 1 ? 'buy' : 'bulkBuy', reducedMotion());
    const [r, l] = [btn.getBoundingClientRect(), card?.getBoundingClientRect() ?? btn.getBoundingClientRect()];
    if (card && fx.some((e) => e.endsWith('urst'))) burst(card, r.left - l.left + r.width / 2, r.top - l.top + r.height / 2, { count: fx.includes('bigBurst') ? 12 : 7 });
    const def = getAutomation(id);
    if (def && milestonesReached(level(state.automations, id)) > milestonesReached(level(before.automations, id))) {
      const count = level(state.automations, id);
      toast(T.toastMilestone(def.name, count, milestoneName(def, count)), 'good');
      sfx.milestone();
      flashClass(card, 'sheen', 900);
      if (card) stamp(card, T.celebrate.double);
      if (effectsFor('milestone', reducedMotion()).includes('confetti')) confetti(r.left + r.width / 2, r.top);
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
          sfx.fanfare();
          haptic('medium');
          persist();
          render();
          yearTransition(T.prestige.title, gained, () => toast(T.prestige.done(fmt(gained)), 'good'));
        },
      },
    ]);
  }

  function openInbox(): void {
    const shown = showTicket(state, (id, choice) => {
      const r = answerTicket(state, id, choice);
      if (!r.choice) return;
      state = r.state;
      toast(r.choice.outcome, 'event');
      sfx.buy();
      haptic('medium');
      persist();
      render();
    });
    if (!shown) toast(T.inbox.empty);
  }

  function applySettings(patch: Partial<Settings>, save: boolean): void {
    state = setSettings(state, patch);
    syncFeedbackSettings();
    if (save) (persist(), render());
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
        ...(state.inbox.length ? [h('p', { testId: 'welcome-tickets', text: T.welcomeTickets(state.inbox.length) })] : []),
      ],
      [{ label: T.welcomeOk, primary: true, testId: 'welcome-ok' }],
      'welcome-dialog',
    );
    sfx.fanfare();
  }

  function resume(nowMs: number): void {
    const r = applyOffline(state, nowMs);
    state = refillInboxOffline(r.state, r.awayMs, Math.random);
    if (r.creditedMs >= BALANCE.offline.dialogMinMs && r.earned.gt(0)) showWelcome(r.earned, r.awayMs, r.creditedMs);
  }

  // ---------- Rendering ----------
  let eventEl: HTMLElement | null = null;
  let lastCustomers = customersSigned(state);

  function renderTop(): void {
    countUp(kpEl, shownValue(kpEl) ?? state.kp, state.kp, 300);
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
        { class: 'event-card', testId: 'event', attrs: { 'aria-label': `${def.title}. ${T.eventTap}` } },
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

  function announceAchievements(before: GameState): void {
    const fresh = newAchievements(before, state);
    if (!fresh.length) return;
    // Loading an old save can unlock many at once: one summary toast instead of a flood.
    if (fresh.length > 3) toast(T.achievements.toastMany(fresh.length), 'good');
    else for (const a of fresh) toast(T.achievements.toast(a.name), 'good');
    sfx.fanfare();
    persist();
  }

  function renderSeason(): void {
    state = setCalendar(state, today());
    const season = activeSeason(state);
    if (season) {
      seasonEl.textContent = T.season.banner(season);
      seasonEl.dataset.season = season.id;
    }
    seasonEl.hidden = !season;
  }

  function render(): void {
    renderSeason();
    renderTop();
    renderInboxButton(inboxBtn, state);
    const buffs = activeBuffs(state);
    if (buffs.length) {
      const b = buffs[0]!;
      buffEl.textContent = T.buffActive(b.mult, Math.ceil((b.untilMs - state.timeMs) / 1000));
      buffEl.hidden = false;
    } else buffEl.hidden = true;

    const signed = customersSigned(state);
    const who = signed ? `${T.customers(signed)} · ${CUSTOMERS[signed - 1]!.name}` : T.noCustomers;
    if (customersEl.firstChild?.nodeValue !== who) customersEl.textContent = who; // keeps a running stamp
    if (signed > lastCustomers) {
      toast(T.toastCustomer(CUSTOMERS[signed - 1]!.name), 'good');
      sfx.customer();
      stamp(customersEl, T.celebrate.signed);
      if (effectsFor('customer', reducedMotion()).includes('shake')) flashClass(customersEl, 'shake', 500);
    }
    lastCustomers = signed;

    const tierUp = net.update(networkFlow(state));
    if (tierUp !== null) toast(T.hubTierUp(T.hubTiers[tierUp]!), 'good');
    renderEvent();
    renderTips();

    const showPrestige = prestigeUnlocked(state);
    tabButtons.prestige.hidden = !showPrestige;
    if (!showPrestige && tab === 'prestige') tab = 'automations';
    tabButtons.achievements.hidden = state.achievements.length === 0;
    if (tabButtons.achievements.hidden && tab === 'achievements') tab = 'automations';
    for (const [k, b] of Object.entries(tabButtons)) {
      b.classList.toggle('active', k === tab);
      b.setAttribute('aria-selected', String(k === tab));
    }

    // Shop tabs get the bulk bar above their list; the others show only their view.
    const view = tabViews[tab];
    if (panel.lastElementChild !== view.host) {
      if (view.bulk) panel.replaceChildren(bulkBar, view.host);
      else panel.replaceChildren(view.host);
    }
    view.render();
  }

  function renderTips(): void {
    const settled = settleTips(state, tips.shown);
    if (settled !== state) {
      state = settled;
      persist();
    }
    tips.render(nextTip(state));
  }

  function renderPrestige(): void {
    const pending = pendingMerits(state);
    const next = runKpForMerits(pending.toNumber() + 1);
    const speedup = nextYearSpeedupPct(state);
    prestigeInfo.replaceChildren(
      h('p', { class: 'merits-owned', text: T.prestige.merits(fmt(state.merits)) }),
      h('p', { text: T.prestige.pending(fmt(pending)) }),
      ...(speedup > 0 ? [h('p', { class: 'prestige-preview', testId: 'prestige-preview', text: T.prestige.preview(String(speedup)) })] : []),
      h('p', { class: 'muted', text: T.prestige.next(fmt(next)) }),
    );
    prestigeBtn.textContent = T.prestige.button(fmt(pending));
    prestigeBtn.disabled = !canPrestige(state);
    lists.merits.render(state);
  }

  // ---------- Events ----------
  const stopHold = bindHold(hub, doClick, HOLD_REPEAT_MS);
  hub.addEventListener('animationend', () => hub.classList.remove('pop'));
  settingsBtn.addEventListener('click', () =>
    openSettings({ state: () => state, apply: applySettings, wipe: () => ((wiping = true), void wipeGame().then(() => location.reload())) }),
  );
  inboxBtn.addEventListener('click', openInbox);
  for (const t of TABS) tabButtons[t].addEventListener('click', () => ((tab = t), render()));
  prestigeBtn.addEventListener('click', doPrestige);
  customersEl.addEventListener('click', () => showCustomers(state));
  customersEl.addEventListener('keydown', (e) => {
    if (!isActivateKey(e)) return;
    e.preventDefault();
    showCustomers(state);
  });

  // Back: close the top dialog, otherwise save and minimize (never quit, so nothing is lost).
  function handleBack(): void {
    if (closeTopDialog()) return;
    if (!Capacitor.isNativePlatform()) return;
    persist();
    void App.minimizeApp().catch(() => undefined); // not supported: ignore
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') handleBack();
  });
  if (Capacitor.isNativePlatform()) {
    void App.addListener('backButton', handleBack).catch(() => undefined); // plugin missing: keep default
  }

  /** The player leaves (app hidden or page closed): save and plan opt-in notifications. */
  function leave(): void {
    const now = Date.now();
    state = touch(state, now);
    if (wiping) return;
    void saveGame(state);
    void scheduleNotifications(state, now);
  }

  document.addEventListener('visibilitychange', () => {
    setBackground(document.visibilityState === 'hidden');
    if (document.visibilityState === 'hidden') {
      stopHold();
      leave();
    } else {
      void cancelNotifications();
      resume(Date.now());
      last = performance.now();
      render();
    }
  });
  window.addEventListener('pagehide', leave);

  // ---------- Loop ----------
  let last = performance.now();
  let rollAcc = 0;
  let renderAcc = 0;
  let saveAcc = 0;
  function frame(now: number): void {
    const dt = Math.min(1000, Math.max(0, now - last));
    last = now;
    const before = state;
    state = tick(state, dt);
    announceAchievements(before);
    rollAcc += dt;
    while (rollAcc >= BALANCE.events.rollIntervalMs) {
      rollAcc -= BALANCE.events.rollIntervalMs;
      const ev = rollEvent(state, Math.random);
      if (ev) state = spawnEvent(state, ev);
      state = receiveTicket(state, Math.random);
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
  void cancelNotifications();
  if (loaded.error) toast(T.saveError);
  if (loaded.state) resume(Date.now());
  render();
  requestAnimationFrame(frame);
}
