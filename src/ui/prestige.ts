// Prestige tab: merits owned and pending, next-year preview, the prestige button and the merit shop.
import { T } from '../content/texts';
import { canPrestige, nextYearSpeedupPct, pendingMerits, runKpForMerits, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { fmt } from './format';
import { ShopList } from './shop';

export class PrestigeView {
  readonly merits: ShopList;
  readonly host: HTMLElement;
  private readonly info = h('div', { class: 'prestige-info' });
  private readonly btn = h('button', { class: 'btn primary wide', testId: 'prestige' });

  /** `confirm` runs when the player confirms the prestige dialog; it gets the merits gained. */
  constructor(buyMerit: (id: string) => void, state: () => GameState, confirm: (gained: GameState['merits']) => void) {
    this.merits = new ShopList(h('div', { class: 'list' }), 'merits', buyMerit);
    const card = h('div', { class: 'prestige-card' }, h('h3', { text: T.prestige.title }), h('p', { text: T.prestige.intro }), this.info, this.btn);
    this.host = h('div', {}, card, h('h3', { class: 'list-title', text: T.prestige.shopTitle }), this.merits.host);
    this.btn.addEventListener('click', () => {
      if (!canPrestige(state())) return;
      const gained = pendingMerits(state());
      showDialog(T.prestige.title, [T.prestige.confirm], [
        { label: T.cancel },
        { label: T.prestige.confirmYes, primary: true, testId: 'confirm-prestige', onClick: () => confirm(gained) },
      ]);
    });
  }

  render(state: GameState): void {
    const pending = pendingMerits(state);
    const speedup = nextYearSpeedupPct(state);
    this.info.replaceChildren(
      h('p', { class: 'merits-owned', text: T.prestige.merits(fmt(state.merits)) }),
      h('p', { text: T.prestige.pending(fmt(pending)) }),
      ...(speedup > 0 ? [h('p', { class: 'prestige-preview', testId: 'prestige-preview', text: T.prestige.preview(String(speedup)) })] : []),
      h('p', { class: 'muted', text: T.prestige.next(fmt(runKpForMerits(pending.toNumber() + 1))) }),
    );
    this.btn.textContent = T.prestige.button(fmt(pending));
    this.btn.disabled = !canPrestige(state);
    this.merits.render(state);
  }
}
