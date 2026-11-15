// Prestige tab: merits owned and pending, next-year preview, the prestige button and the merit shop.
import { T } from '../content/texts';
import { canPrestige, nextUnlock, nextYearSpeedupPct, pendingMerits, runKpForMerits, schoolYear, unlocksInYear, type GameState } from '../core';
import { toast } from './feedback';
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
        { label: T.prestige.confirmYes, primary: true, testId: 'confirm-prestige', onClick: () => this.confirmed(confirm, gained, state) },
      ]);
    });
  }

  /** Run the prestige, then announce integration types the new school year unlocks (051). */
  private confirmed(confirm: (gained: GameState['merits']) => void, gained: GameState['merits'], state: () => GameState): void {
    confirm(gained);
    const fresh = unlocksInYear(schoolYear(state()));
    if (fresh.length > 0) toast(T.prestige.unlocked(fresh.map((a) => a.name).join(', ')), 'good');
  }

  render(state: GameState): void {
    const pending = pendingMerits(state);
    const speedup = nextYearSpeedupPct(state);
    const unlock = nextUnlock(state);
    const names = unlock?.defs.map((a) => a.name).join(', ') ?? '';
    const unlockText = !unlock ? '' : unlock.year === schoolYear(state) + 1 ? T.prestige.unlockNext(names) : T.prestige.unlockLater(unlock.year, names);
    this.info.replaceChildren(
      h('p', { class: 'merits-owned', text: T.prestige.merits(fmt(state.merits)) }),
      h('p', { text: T.prestige.pending(fmt(pending)) }),
      ...(speedup > 0 ? [h('p', { class: 'prestige-preview', testId: 'prestige-preview', text: T.prestige.preview(String(speedup)) })] : []),
      ...(unlock ? [h('p', { class: 'prestige-preview', testId: 'prestige-unlock', text: unlockText })] : []),
      h('p', { class: 'muted', text: T.prestige.next(fmt(runKpForMerits(pending.toNumber() + 1))) }),
    );
    this.btn.textContent = T.prestige.button(fmt(pending));
    this.btn.disabled = !canPrestige(state);
    this.merits.render(state);
  }
}
