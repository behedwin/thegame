// Shop lists: automations, upgrades and the merit shop. Cards are built once per
// "reveal signature" and then cheaply updated every render.
import { AUTOMATIONS } from '../content/registry';
import { BALANCE } from '../content/balance';
import { MERITS } from '../content/registry';
import { T } from '../content/texts';
import { UPGRADES } from '../content/registry';
import {
  automationKps,
  canBuy,
  canBuyMerit,
  costOf,
  getAutomation,
  isMaxed,
  isRevealed,
  level,
  meritCost,
  milestonesReached,
  nextMilestone,
  type GameState,
} from '../core';
import type { AutomationDef } from '../content/types';
import { costOfMany, resolveBulk, type BulkMode } from '../core/bulk';
import { h } from './dialogs';
import { fmt } from './format';

/** Flavour name of the latest milestone reached at this count, or null if none (or unnamed). */
export function milestoneName(def: AutomationDef, count: number): string | null {
  const reached = milestonesReached(count);
  return reached > 0 ? (def.milestoneNames?.[reached - 1] ?? null) : null;
}

export type ShopKind = 'automations' | 'upgrades' | 'merits';

interface Card {
  id: string;
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
  /** Display names per id, used for the buy buttons' screen reader labels. */
  private readonly names = new Map<string, string>();

  constructor(
    readonly host: HTMLElement,
    private readonly kind: ShopKind,
    private readonly onBuy: (id: string, btn: HTMLElement) => void,
  ) {}

  private visibleIds(s: GameState): { ids: string[]; teaser: boolean } {
    if (this.kind === 'merits') return { ids: MERITS.map((m) => m.id), teaser: false };
    const all = this.kind === 'automations' ? AUTOMATIONS.map((a) => a.id) : UPGRADES.map((u) => u.id);
    const ids = all.filter((id) => isRevealed(s, id));
    return { ids, teaser: ids.length < all.length };
  }

  private build(s: GameState, ids: string[], teaser: boolean): void {
    this.host.replaceChildren();
    const names = this.names;
    this.cards = ids.map((id) => {
      const def =
        this.kind === 'automations'
          ? AUTOMATIONS.find((a) => a.id === id)!
          : this.kind === 'upgrades'
            ? UPGRADES.find((u) => u.id === id)!
            : MERITS.find((m) => m.id === id)!;
      const lvl = h('span', { class: 'card-level' });
      names.set(id, def.name);
      const sub = h('div', { class: 'card-sub' });
      const btn = h('button', { class: 'buy', testId: `buy-${id}` });
      const bar = this.kind === 'automations' ? h('div', { class: 'bar-fill' }) : null;
      const named = this.kind === 'automations' ? h('div', { class: 'card-desc card-milestone', testId: `milestone-${id}` }) : null;
      const info = h(
        'div',
        { class: 'card-info' },
        h('div', { class: 'card-title' }, h('span', { text: def.name }), lvl),
        h('div', { class: 'card-desc', text: def.desc }),
        sub,
      );
      if (named) info.append(named);
      if (bar) info.append(h('div', { class: 'bar' }, bar));
      const root = h('div', { class: 'card', testId: `card-${id}` }, info, btn);
      btn.addEventListener('click', () => this.onBuy(id, btn));
      this.host.append(root);
      return { id, root, level: lvl, sub, btn, bar, named };
    });
    if (teaser) this.host.append(h('div', { class: 'card teaser', text: T.lockedTeaser }));
    this.update(s);
  }

  /** Rebuild if the visible set changed, then refresh numbers. */
  render(s: GameState): void {
    const { ids, teaser } = this.visibleIds(s);
    const sig = ids.join(',') + (teaser ? '+' : '');
    if (sig !== this.signature) {
      this.signature = sig;
      this.build(s, ids, teaser);
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
          : `+${fmt(def.kps)} ${T.perSecond} styck`;
        if (c.named) c.named.textContent = named ? `“${named}”` : '';
        if (c.bar) {
          const prev = [0, ...BALANCE.milestones].filter((m) => m <= count).pop() ?? 0;
          const pct = next ? ((count - prev) / (next - prev)) * 100 : 100;
          c.bar.style.width = `${pct}%`;
        }
        this.setPriceButton(c, s);
      } else if (this.kind === 'upgrades') {
        const def = UPGRADES.find((u) => u.id === c.id)!;
        c.level.textContent = T.level(level(s.upgrades, c.id), def.maxLevel);
        if (isMaxed(s, c.id)) this.setButton(c, T.maxed, false, true);
        else this.setPriceButton(c, s);
      } else {
        const def = MERITS.find((m) => m.id === c.id)!;
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
      c.btn.setAttribute('aria-label', T.a11y.buyAria(this.names.get(c.id) ?? c.id, label));
    }
    c.btn.disabled = !enabled;
    c.root.classList.toggle('affordable', enabled);
    c.root.classList.toggle('maxed', maxed);
  }
}
