// App shell: owns the game state, runs the loop, wires DOM events. Wall clock and
// Math.random live here and are injected into the pure core.
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BALANCE } from '../content/balance';
import { T } from '../content/texts';
import {
  answerTicket, applyMorningChoice, applyOffline, buy, type CalendarDay, buyMerit, chooseFocus, claimEvent, click, createInitialState,
  getAutomation, kpPerClick, level, milestoneName, milestonesReached, newAchievements, networkFlow, prestige, prestigeUnlocked,
  brokenStreak, receiveTicket, refillInboxOffline, rollEvent, setCalendar, setSettings, type Settings, spawnEvent, tick, touch, type GameState,
} from '../core';
import { buyMany, BULK_MODES, resolveBulk, type BulkMode } from '../core/bulk';
import { loadGame, saveGame, wipeGame } from '../save/storage';
import { closeTopDialog, h, showDialog } from './dialogs';
import { configureFeedback, floatText, haptic, setBackground, sfx, toast } from './feedback';
import { burst, motionOk, reducedMotion, ripple } from './fx';
import { HeroSize } from './hero';
import { confetti, effectsFor, flashClass, stamp, yearTransition } from './celebrate';
import { fmt, setNotation } from './format';
import { AchievementList } from './achievements';
import { CustomerRow } from './customers';
import { EventCard } from './event-card';
import { bindHold } from './hold';
import { Hud } from './hud';
import { NetworkView, hubTierProgress, nextHubTierKps } from './network';
import { cancelNotifications, scheduleNotifications } from './notifications';
import { PrestigeView } from './prestige';
import { openSettings } from './settings';
import { ShopList } from './shop';
import { seenTrophies, TABS, tabDots, type Tab } from './tab-dots';
import { renderToasts } from './render-toasts';
import { receiptText } from './effects';
import { renderInboxButton, showTicket } from './inbox';
import { helpHooks } from './help';
import { markTipSeen, nextTip, settleTips, TipBar, tourNext, TOUR, type TourStep } from './onboarding';
import { showWelcome } from './welcome';
import { NewsBar } from './changelog';
import { build } from 'virtual:changelog';

const GEAR = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';
const SYNC = '<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M12 4V1L8 5l4 4V6a6 6 0 0 1 5.7 7.9l1.5 1.5A8 8 0 0 0 12 4zm0 14a6 6 0 0 1-5.7-7.9L4.8 8.6A8 8 0 0 0 12 20v3l4-4-4-4z"/></svg>';

/** Today's local calendar day, injected into the pure core for seasons. */
const today = (d = new Date()): CalendarDay => ({ month: d.getMonth() + 1, day: d.getDate() });

const AUTOSAVE_MS = 10_000;
/** Hold-to-sync repeat interval: about 8 clicks per second (see hold.ts). */
const HOLD_REPEAT_MS = 125;

export async function startApp(root: HTMLElement): Promise<void> {
  const loaded = await loadGame(Date.now());
  let state: GameState = setCalendar(loaded.state ?? createInitialState(Date.now()), today());
  let wiping = false;
  let tab: Tab = 'automations';
  /** Trophies the player has seen (101): in memory only, so everything already unlocked at load counts as seen. */
  let trophiesSeen = state.achievements.length;
  let bulk: BulkMode = 1;

  // ---------- DOM ----------
  const hud = new Hud();
  const settingsBtn = h('button', { class: 'icon-btn', testId: 'settings', attrs: { 'aria-label': T.settings.title } });
  settingsBtn.innerHTML = GEAR;
  const inboxBtn = h('button', { class: 'inbox-btn', testId: 'inbox', attrs: { hidden: '' } });

  const net = new NetworkView();
  const hub = h('button', { class: 'hub', testId: 'hub', attrs: { 'aria-label': T.hubAria } });
  hub.innerHTML = `${SYNC}<span>${T.hubLabel}</span>`;
  // Hub tier name under SYNKA, shown only in the compact strip (084); the big map shows it as rings.
  const hubTierTag = h('span', { class: 'hub-tier', testId: 'hub-tier', attrs: { 'aria-hidden': 'true' } });
  const floatLayer = h('div', { class: 'float-layer', attrs: { 'aria-hidden': 'true' } });
  const eventCard = new EventCard(claimActiveEvent);
  const eventSlot = eventCard.slot;
  const sideLabels = h('div', { class: 'side-labels' }, h('span', { text: T.sourceSystems }), h('span', { text: T.targetSystems }));
  const hero = h('section', { class: 'hero' }, net.svg, sideLabels, net.tip, hub, hubTierTag, floatLayer, eventSlot);
  // The intro tour (031) is in memory only, so a reload ends it.
  let tour: TourStep | null = null;
  const tips = new TipBar(
    (id) => {
      if (tour) tour = null;
      else if (id) state = markTipSeen(state, id);
      commit();
    },
    () => applySettings({ tips: false }, true),
    () => ((tour = tour && tourNext(tour)), render()),
  );
  helpHooks.replay = () => ((tour = TOUR[0]), render());
  const customers = new CustomerRow(() => state);
  const newsBar = new NewsBar((v) => ((state = { ...state, lastSeenVersion: v }), commit()));

  const tabButtons = {} as Record<Tab, HTMLElement>;
  for (const t of TABS) tabButtons[t] = h('button', { class: 'tab', attrs: { role: 'tab' }, text: T.tabs[t], testId: `tab-${t}` });
  const achievementList = new AchievementList();
  const panel = h('section', { class: 'panel' });
  const lists = {
    automations: new ShopList(h('div', { class: 'list' }), 'automations', (id, btn) => doBuy(id, btn)),
    upgrades: new ShopList(h('div', { class: 'list' }), 'upgrades', (id, btn) => doBuy(id, btn)),
  };
  const prestigeView = new PrestigeView(doBuyMerit, () => state, doPrestige, (id) => ((state = chooseFocus(state, id)), commit()));
  const bulkLabel = (m: BulkMode) => (m === 1 ? T.bulk.one : m === 10 ? T.bulk.ten : T.bulk.max);
  const bulkButtons = BULK_MODES.map((m) => {
    const b = h('button', { class: 'bulk-opt', text: bulkLabel(m), testId: `bulk-${m}`, attrs: { 'aria-pressed': String(m === bulk) } });
    b.addEventListener('click', () => {
      bulk = lists.automations.bulk = lists.upgrades.bulk = m;
      for (const [i, o] of bulkButtons.entries()) o.setAttribute('aria-pressed', String(BULK_MODES[i] === m));
      render();
    });
    return b;
  });
  const bulkBar = h('div', { class: 'bulk', attrs: { role: 'group', 'aria-label': T.bulk.aria } }, ...bulkButtons);
  const tabViews: Record<Tab, { host: HTMLElement; bulk: boolean; render: () => void }> = {
    automations: { host: lists.automations.host, bulk: true, render: () => lists.automations.render(state) },
    upgrades: { host: lists.upgrades.host, bulk: true, render: () => lists.upgrades.render(state) },
    prestige: { host: prestigeView.host, bulk: false, render: () => prestigeView.render(state) },
    achievements: { host: achievementList.host, bulk: false, render: () => achievementList.render(state) },
  };

  const tabsNav = h('nav', { class: 'tabs', attrs: { role: 'tablist', 'aria-label': T.a11y.tabsAria } }, ...Object.values(tabButtons));
  const top = h('header', { class: 'top' }, h('div', { class: 'brand', text: T.title }), inboxBtn, settingsBtn);
  root.replaceChildren(h('div', { class: 'app' }, top, newsBar.host, hud.host, hero, tips.host, customers.host, tabsNav, panel));
  tips.marks = { sync: hub, buy: panel, event: eventSlot, help: settingsBtn };
  // Compact map (057): scrolling the shop shrinks the map to a strip so more cards fit.
  // A tap on the tier name in the strip shows what the next tier needs instead of expanding the map (087).
  const heroSize = new HeroSize(hero, panel, [hub, eventSlot], { el: hubTierTag, tap: () => toast(hubTierInfo()) });

  // ---------- Actions ----------
  /** Stop saving (wipe or import replaces the save), then reload once `done` has written storage. */
  const leaveFor = (done: Promise<void>) => ((wiping = true), void done.then(() => location.reload()));
  const commit = (): void => (persist(), render());
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

  const syncFeedbackSettings = (): void => (configureFeedback(state.settings.sound, state.settings.vibration, state.settings.volume), setNotation(state.settings.notation));
  /** Sound and haptic for a purchase or an answered ticket. */
  const reward = (): void => (sfx.buy(), haptic('medium'));

  function doClick(x: number, y: number): void {
    const gained = kpPerClick(state);
    state = click(state);
    const rect = hero.getBoundingClientRect();
    const [lx, ly] = [x - rect.left, y - rect.top];
    // The compact strip (059) gets smaller effects that start beside SYNKA instead of on top of it.
    floatText(floatLayer, lx, ly, `+${fmt(gained)}`, heroSize.hubAnchor(hub));
    flashClass(hub, 'pop', 300);
    ripple(hub, floatLayer, heroSize.fx.ripple);
    burst(floatLayer, lx, ly, { spread: heroSize.fx.spread });
    if (motionOk()) net.pulse();
    sfx.click();
    haptic('light');
    hud.renderCounters(state);
  }

  function doBuy(id: string, btn: HTMLElement): void {
    const before = state;
    state = bulk === 1 ? buy(state, id) : buyMany(state, id, resolveBulk(state, id, bulk));
    if (state === before) return;
    reward();
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
      if (card) (flashClass(card, 'sheen', 900), stamp(card, T.celebrate.double));
      if (effectsFor('milestone', reducedMotion()).includes('confetti')) confetti(r.left + r.width / 2, r.top);
    }
    commit();
  }

  function doBuyMerit(id: string): void {
    const before = state;
    state = buyMerit(state, id);
    if (state === before) return;
    reward();
    commit();
  }

  function doPrestige(gained: GameState['merits']): void {
    state = prestige(state);
    customers.reset(state);
    sfx.fanfare();
    haptic('medium');
    commit();
    yearTransition(T.prestige.title, gained, () => toast(T.prestige.done(fmt(gained)), 'good'));
  }

  function claimActiveEvent(): void {
    const res = claimEvent(state);
    state = res.state;
    if (res.event) {
      toast(receiptText(res.event.claimText, res.event.effect, res.state, res.granted), 'event');
      sfx.event();
      haptic('medium');
      persist();
    }
    eventCard.render(state);
  }

  function openInbox(): void {
    const shown = showTicket(state, (id, choice) => {
      const r = answerTicket(state, id, choice);
      if (!r.choice) return;
      state = r.state;
      toast(receiptText(r.choice.outcome, r.choice.effect, r.state, r.granted), 'event');
      reward();
      commit();
    });
    if (!shown) toast(T.inbox.empty);
  }

  function applySettings(patch: Partial<Settings>, save: boolean): void {
    state = setSettings(state, patch);
    syncFeedbackSettings();
    // The KP counter only redraws when the value changes, so a new notation is written out here.
    if (patch.notation) hud.host.querySelector('.kp-value')!.textContent = fmt(state.kp);
    if (save) commit();
  }

  /** Offline catch-up. `news` (056, on start only) goes into the welcome dialog when it shows; returns whether it did. */
  function resume(nowMs: number, news?: () => HTMLElement): boolean {
    const r = applyOffline(state, nowMs);
    state = refillInboxOffline(r.state, r.awayMs, Math.random);
    if (r.creditedMs < BALANCE.offline.dialogMinMs || !r.earned.gt(0)) return false;
    const earned = r.earned;
    showWelcome(state, earned, r.awayMs, r.creditedMs, (c) => ((state = applyMorningChoice(state, c, earned, Math.random)), commit()), news?.());
    return true;
  }

  // ---------- Rendering ----------
  function announceAchievements(before: GameState): void {
    const fresh = newAchievements(before, state);
    if (!fresh.length) return;
    // Loading an old save can unlock many at once: one summary toast instead of a flood.
    if (fresh.length > 3) toast(T.achievements.toastMany(fresh.length), 'good');
    else for (const a of fresh) toast(T.achievements.toast(a.name), 'good');
    sfx.fanfare();
    persist();
  }

  /** The hub tier and the KP/s the next one needs (087). */
  function hubTierInfo(): string {
    const next = nextHubTierKps(net.currentTier);
    return T.hubTierInfo(net.currentTier, next === null ? null : fmt(next));
  }
  let hubInfoShown = '';

  /** Dot on a tab while something there can be bought (089, 093, 097) or a new trophy is unseen (101); the label tells screen readers why. */
  function setTabDot(t: Tab, dot: boolean, why: string): void {
    const b = tabButtons[t];
    if (b.classList.contains('dot') === dot) return;
    b.classList.toggle('dot', dot);
    b.setAttribute('aria-label', dot ? `${T.tabs[t]}. ${why}` : T.tabs[t]);
  }

  // State at the previous render; null until the first one, so a loaded save never toasts (109).
  let rendered: GameState | null = null;
  function render(): void {
    state = setCalendar(state, today());
    const flow = networkFlow(state);
    for (const t of renderToasts(rendered, state, net.update(flow))) toast(t, 'good');
    rendered = state;
    hud.render(state);
    renderInboxButton(inboxBtn, state);
    customers.render(state);
    hubTierTag.textContent = T.hubTiers[net.currentTier] ?? '';
    hubTierTag.style.setProperty('--tier-progress', hubTierProgress(flow.total).toFixed(3));
    const info = hubTierInfo();
    if (hubInfoShown !== info) {
      hubInfoShown = info;
      hub.setAttribute('aria-label', `${T.hubAria}. ${info}`);
    }
    eventCard.render(state);
    renderTips();

    tabButtons.prestige.hidden = !prestigeUnlocked(state);
    tabButtons.achievements.hidden = state.achievements.length === 0;
    if (tabButtons[tab].hidden) tab = 'automations';
    for (const [k, b] of Object.entries(tabButtons)) {
      b.classList.toggle('active', k === tab);
      b.setAttribute('aria-selected', String(k === tab));
    }
    trophiesSeen = seenTrophies(state, tab, trophiesSeen);
    for (const d of tabDots(state, tab, trophiesSeen)) setTabDot(d.tab, d.dot, d.why);

    // Shop tabs get the bulk bar above their list; the others show only their view.
    const view = tabViews[tab];
    if (panel.lastElementChild !== view.host) {
      panel.replaceChildren(...(view.bulk ? [bulkBar] : []), view.host);
    }
    view.render();
  }

  function renderTips(): void {
    if (tour) return tips.render(null, tour);
    const settled = settleTips(state, tips.shown);
    if (settled !== state) {
      state = settled;
      persist();
    }
    tips.render(nextTip(state));
  }

  // ---------- Events ----------
  const stopHold = bindHold(hub, doClick, HOLD_REPEAT_MS);
  hub.addEventListener('animationend', () => hub.classList.remove('pop'));
  settingsBtn.addEventListener('click', () =>
    openSettings({ state: () => state, apply: applySettings, wipe: () => leaveFor(wipeGame()), load: (next) => leaveFor(saveGame(next)) }),
  );
  inboxBtn.addEventListener('click', openInbox);
  for (const t of TABS) tabButtons[t].addEventListener('click', () => ((tab = t), render(), heroSize.sync()));

  // Back: close the top dialog, otherwise save and minimize (never quit, so nothing is lost).
  function handleBack(): void {
    if (closeTopDialog()) return;
    if (!Capacitor.isNativePlatform()) return;
    persist();
    void App.minimizeApp().catch(() => undefined); // not supported: ignore
  }
  document.addEventListener('keydown', (e) => e.key === 'Escape' && handleBack());
  if (Capacitor.isNativePlatform()) void App.addListener('backButton', handleBack).catch(() => undefined); // plugin missing: keep default

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
  let [last, rollAcc, renderAcc, saveAcc] = [performance.now(), 0, 0, 0];
  function frame(now: number): void {
    const dt = Math.min(1000, Math.max(0, now - last));
    last = now;
    const before = state;
    state = tick(state, dt);
    announceAchievements(before);
    const broken = brokenStreak(before, state);
    if (broken > 0) toast(T.eventStreakBroken(broken));
    rollAcc += dt;
    while (rollAcc >= BALANCE.events.rollIntervalMs) {
      rollAcc -= BALANCE.events.rollIntervalMs;
      const ev = rollEvent(state, Math.random);
      if (ev) state = spawnEvent(state, ev);
      state = receiveTicket(state, Math.random);
    }
    net.frame(dt / 1000);
    if ((renderAcc += dt) >= 100) {
      renderAcc = 0;
      render();
    }
    if ((saveAcc += dt) >= AUTOSAVE_MS) {
      saveAcc = 0;
      persist();
    }
    requestAnimationFrame(frame);
  }

  syncFeedbackSettings();
  void cancelNotifications();
  if (loaded.error) toast(T.saveError);
  if (loaded.state) {
    const news = newsBar.load(state.lastSeenVersion).length > 0;
    if (!resume(Date.now(), news ? () => newsBar.line() : undefined) && news) newsBar.showBar();
  } else state = { ...state, lastSeenVersion: build };
  render();
  requestAnimationFrame(frame);
}
