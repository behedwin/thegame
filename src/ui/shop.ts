// Shop lists: automations, upgrades and the merit shop. Cards are built once per
// "reveal signature" and then cheaply updated every render.
import { AUTOMATIONS, MERITS, UPGRADES } from '../content/registry';
import { T } from '../content/texts';
import {
  automationKps,
  canBuy,
  canBuyMerit,
  costOf,
  getAutomation,
  getMerit,
  getUpgrade,
  isMaxed,
  isRevealed,
  level,
  meritCost,
  milestoneName,
  milestoneProgressPct,
  nextMilestone,
  type GameState,
} from '../core';
import { costOfMany, resolveBulk, type BulkMode } from '../core/bulk';
import { h } from './dialogs';
import { fmt } from './format';

export type ShopKind = 'automations' | 'upgrades' | 'merits';

/** Show the milestone quote from this far (percent) towards the next milestone (058). */
export const QUOTE_NEAR_PCT = 80;
/** How long the quote stays visible after a purchase, in ms. */
const QUOTE_AFTER_BUY_MS = 2500;

/** The latest milestone's quote is shown only near the next milestone or just after a buy, never when maxed. */
export function showMilestoneQuote(count: number, justBought: boolean): boolean {
  if (nextMilestone(count) === null) return false;
  return justBought || milestoneProgressPct(count) >= QUOTE_NEAR_PCT;
}

/** Split ids into buyable ones and maxed ones, keeping the original order in each (073). */
export function splitMaxed(ids: string[], maxed: (id: string) => boolean): { open: string[]; done: string[] } {
  const open: string[] = [];
  const done: string[] = [];
  for (const id of ids) (maxed(id) ? done : open).push(id);
  return { open, done };
}

interface Card {
  id: string;
  /** Display name, also used in the buy button's screen reader label. */
  name: string;
  root: HTMLElement;
  level: HTMLElement;
  sub: HTMLElement;
  btn: HTMLButtonElement;
  bar: HTMLElement | null;
  /** Latest named milestone (automations only). */
  named: HTMLElement | null;
}

export class ShopList {
  private cards: Card[] = [];
  private signature = '';
  /** Bulk mode for automations and upgrades (×1 / ×10 / MAX). */
  bulk: BulkMode = 1;
  /** Wall-clock time of the latest purchase per card, for the quote flash. */
  private boughtAt = new Map<string, number>();
  /** Whether the folded "Klara (n)" row of maxed upgrades is open; survives rebuilds (073). */
  private foldOpen = false;

  constructor(
    readonly host: HTMLElement,
    private readonly kind: ShopKind,
    private readonly onBuy: (id: string, btn: HTMLElement) => void,
  ) {}

  private visibleIds(s: GameState): { ids: string[]; done: string[]; teaser: boolean } {
    if (this.kind === 'merits') return { ids: MERITS.map((m) => m.id), done: [], teaser: false };
    const all = this.kind === 'automations' ? AUTOMATIONS.map((a) => a.id) : UPGRADES.map((u) => u.id);
    const revealed = all.filter((id) => isRevealed(s, id));
    const teaser = revealed.length < all.length;
    if (this.kind === 'automations') return { ids: revealed, done: [], teaser };
    const { open, done } = splitMaxed(revealed, (id) => isMaxed(s, id));
    return { ids: open, done, teaser };
  }

  private build(s: GameState, ids: string[], done: string[], teaser: boolean): void {
    this.host.replaceChildren();
    this.cards = [];
    for (const id of ids) this.host.append(this.makeCard(id));
    if (teaser) this.host.append(h('div', { class: 'card teaser', text: T.lockedTeaser }));
    if (done.length) {
      // Maxed upgrades fold into one row at the bottom so the buyable ones come first (073).
      const body = h('div', { class: 'fold-body', testId: 'fold-maxed-body' });
      for (const id of done) body.append(this.makeCard(id));
      body.hidden = !this.foldOpen;
      const row = h('button', {
        class: 'card fold',
        testId: 'fold-maxed',
        text: T.maxedFold(done.length),
        attrs: { 'aria-expanded': String(this.foldOpen) },
      });
      row.addEventListener('click', () => {
        this.foldOpen = !this.foldOpen;
        body.hidden = !this.foldOpen;
        row.setAttribute('aria-expanded', String(this.foldOpen));
      });
      this.host.append(row, body);
    }
    this.update(s);
  }

  private makeCard(id: string): HTMLElement {
    const def =
      this.kind === 'automations' ? getAutomation(id)! : this.kind === 'upgrades' ? getUpgrade(id)! : getMerit(id)!;
    const lvl = h('span', { class: 'card-level' });
    const sub = h('div', { class: 'card-sub' });
    const btn = h('button', { class: 'buy', testId: `buy-${id}` });
    const bar = this.kind === 'automations' ? h('div', { class: 'bar-fill' }) : null;
    const named = this.kind === 'automations' ? h('span', { class: 'card-milestone', testId: `milestone-${id}` }) : null;
    const subRow = h('div', { class: 'card-sub-row' }, sub);
    if (named) subRow.append(named);
    // Tapping the text toggles the full description; the buy button is separate (058).
    const info = h(
      'div',
      { class: 'card-info', testId: `info-${id}`, attrs: { role: 'button', tabindex: '0', 'aria-expanded': 'false' } },
      h('div', { class: 'card-title' }, h('span', { text: def.name }), lvl),
      h('div', { class: 'card-desc', text: def.desc }),
      subRow,
    );
    if (bar) info.append(h('div', { class: 'bar' }, bar));
    const root = h('div', { class: 'card shop-card', testId: `card-${id}` }, info, btn);
    const toggle = (): void => {
      const open = root.classList.toggle('expanded');
      info.setAttribute('aria-expanded', String(open));
    };
    info.addEventListener('click', toggle);
    info.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle();
    });
    btn.addEventListener('click', () => {
      this.boughtAt.set(id, performance.now());
      this.onBuy(id, btn);
    });
    this.cards.push({ id, name: def.name, root, level: lvl, sub, btn, bar, named });
    return root;
  }

  /** Rebuild if the visible set changed, then refresh numbers. */
  render(s: GameState): void {
    const { ids, done, teaser } = this.visibleIds(s);
    const sig = ids.join(',') + '|' + done.join(',') + (teaser ? '+' : '');
    if (sig !== this.signature) {
      this.signature = sig;
      this.build(s, ids, done, teaser);
    } else this.update(s);
  }

  private update(s: GameState): void {
    for (const c of this.cards) {
      if (this.kind === 'automations') {
        const count = level(s.automations, c.id);
        c.level.textContent = count ? T.owned(count) : '';
        const def = getAutomation(c.id)!;
        const next = nextMilestone(count);
        const named = milestoneName(def, count);
        c.sub.textContent = count
          ? `${fmt(automationKps(s, def))} ${T.perSecond} · ${next ? T.milestoneProgress(next) : T.allMilestones}`
          : T.perEach(fmt(def.kps));
        const justBought = performance.now() - (this.boughtAt.get(c.id) ?? -Infinity) < QUOTE_AFTER_BUY_MS;
        if (c.named) {
          const text = named && showMilestoneQuote(count, justBought) ? `“${named}”` : '';
          if (c.named.textContent !== text) c.named.textContent = text;
          c.named.hidden = !text;
        }
        if (c.bar) c.bar.style.width = `${milestoneProgressPct(count)}%`;
        this.setPriceButton(c, s);
      } else if (this.kind === 'upgrades') {
        const def = getUpgrade(c.id)!;
        c.level.textContent = T.level(level(s.upgrades, c.id), def.maxLevel);
        if (isMaxed(s, c.id)) this.setButton(c, T.maxed, false, true);
        else this.setPriceButton(c, s);
      } else {
        const def = getMerit(c.id)!;
        const lvl = level(s.meritUpgrades, c.id);
        c.level.textContent = T.level(lvl, def.maxLevel);
        if (lvl >= def.maxLevel) this.setButton(c, T.maxed, false, true);
        else this.setButton(c, `${fmt(meritCost(s, c.id))} ★`, canBuyMerit(s, c.id));
      }
    }
  }

  /** Price label and state for automations/upgrades, honouring the bulk mode. */
  private setPriceButton(c: Card, s: GameState): void {
    if (this.bulk === 1) {
      this.setButton(c, fmt(costOf(s, c.id)) + ' KP', canBuy(s, c.id));
      return;
    }
    const n = resolveBulk(s, c.id, this.bulk);
    const cost = costOfMany(s, c.id, n);
    this.setButton(c, T.buyMany(n, fmt(cost)), s.kp.gte(cost));
  }

  private setButton(c: Card, label: string, enabled: boolean, maxed = false): void {
    if (c.btn.textContent !== label) {
      c.btn.textContent = label;
      c.btn.setAttribute('aria-label', T.a11y.buyAria(c.name, label));
    }
    c.btn.disabled = !enabled;
    c.root.classList.toggle('affordable', enabled);
    c.root.classList.toggle('maxed', maxed);
  }
}
