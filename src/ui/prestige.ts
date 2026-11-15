// Prestige tab: merits owned and pending, next-year preview, the prestige button and the merit shop.
import { T } from '../content/texts';
import { BALANCE } from '../content/balance';
import { canPrestige, chapterFor, chaptersRead, connectedMunicipalities, nextYearMunicipalities, nextUnlock, nextYearSpeedupPct, pendingMerits, runKpForMerits, schoolYear, unlocksInYear, type GameState } from '../core';
import { toast } from './feedback';
import { h, showDialog } from './dialogs';
import { addChapter } from './celebrate';
import { fmt } from './format';
import { ShopList } from './shop';

export class PrestigeView {
  readonly merits: ShopList;
  readonly host: HTMLElement;
  private readonly info = h('div', { class: 'prestige-info' });
  private readonly btn = h('button', { class: 'btn primary wide', testId: 'prestige' });
  private readonly goal = h('div', { class: 'goal', testId: 'goal' });
  private readonly story = h('details', { class: 'story', testId: 'chapters' });
  private shownYear = 0;

  /** `confirm` runs when the player confirms the prestige dialog; it gets the merits gained. */
  constructor(buyMerit: (id: string) => void, state: () => GameState, confirm: (gained: GameState['merits']) => void) {
    this.merits = new ShopList(h('div', { class: 'list' }), 'merits', buyMerit);
    const card = h('div', { class: 'prestige-card' }, h('h3', { text: T.prestige.title }), h('p', { text: T.prestige.intro }), this.info, this.btn);
    this.host = h('div', {}, this.goal, card, this.story, h('h3', { class: 'list-title', text: T.prestige.shopTitle }), this.merits.host);
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
    const chapter = chapterFor(schoolYear(state()));
    if (chapter) addChapter(chapter.title, chapter.text);
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
    this.renderGoal(state);
    this.merits.render(state);
  }

  /** National goal with a thin progress bar, the next year's gain and the story so far (052). */
  private renderGoal(state: GameState): void {
    const [towns, total, gain] = [connectedMunicipalities(state), BALANCE.goal.municipalities, nextYearMunicipalities(state)];
    const bar = h('div', { class: 'goal-bar', attrs: { role: 'progressbar', 'aria-label': T.goal.aria, 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(towns) } },
      h('span', { attrs: { style: `width: ${((towns / total) * 100).toFixed(1)}%` } }));
    this.goal.replaceChildren(h('strong', { text: T.goal.title }), h('p', { testId: 'goal-count', text: T.goal.count(towns, total) }), bar,
      ...(gain > 0 ? [h('p', { class: 'muted', testId: 'goal-next', text: T.goal.nextYear(gain) })] : []));
    if (this.shownYear === schoolYear(state)) return;
    this.shownYear = schoolYear(state);
    const chapters = chaptersRead(state).reverse();
    this.story.replaceChildren(h('summary', { text: T.goal.chapters }),
      ...chapters.map((c) => h('div', { class: 'chapter' }, h('h4', { text: c.title }), h('p', { text: c.text }))));
    this.story.hidden = chapters.length === 0;
  }
}
