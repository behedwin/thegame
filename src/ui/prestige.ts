// Prestige tab: merits owned and pending, next-year preview, the prestige button and the merit shop.
import { T } from '../content/texts';
import { BALANCE } from '../content/balance';
import { canPrestige, chaptersRead, fastestYearRecord, connectedMunicipalities, isUntriedFocus, nextYearMunicipalities, nextUnlock, nextYearSpeedupPct, pendingMerits, runKpForMerits, schoolYear, yearDurationMs, yearStart, yearSummary, type GameState } from '../core';
import type { FocusDef } from '../content/types';
import { toast } from './feedback';
import { h, showDialog } from './dialogs';
import { addChapter } from './celebrate';
import { focusLines } from './effects';
import { fmt, fmtDuration } from './format';
import { ShopList } from './shop';

/** A change against last school year, or nothing in the first one (078, 083). */
const diff = (n: number | null, text: (n: number) => string = T.prestige.summaryDiff): string => (n === null ? '' : text(n));

/** The year clock's text, and whether this year runs ahead of the fastest one (094, 102). Pure. */
export function yearClock(state: GameState): { text: string; onPace: boolean } {
  const record = fastestYearRecord(state);
  const elapsed = yearDurationMs(state);
  const onPace = record !== null && elapsed < record;
  return { text: T.prestige.yearClock(fmtDuration(elapsed), record === null ? null : fmtDuration(record), onPace), onPace };
}

export class PrestigeView {
  readonly merits: ShopList;
  readonly host: HTMLElement;
  private readonly info = h('div', { class: 'prestige-info' });
  private readonly btn = h('button', { class: 'btn primary wide', testId: 'prestige' });
  private readonly goal = h('div', { class: 'goal', testId: 'goal' });
  private readonly story = h('details', { class: 'story', testId: 'chapters' });
  private readonly clock = h('p', { class: 'year-clock muted', testId: 'year-clock' });
  private shownYear = 0;

  /**
   * `confirm` runs when the player confirms the prestige dialog; it gets the merits gained.
   * `chooseFocus` runs when the player picks the new school year's focus (053).
   */
  constructor(buyMerit: (id: string) => void, state: () => GameState, confirm: (gained: GameState['merits']) => void, private readonly chooseFocus: (id: string) => void) {
    this.merits = new ShopList(h('div', { class: 'list' }), 'merits', buyMerit);
    const card = h('div', { class: 'prestige-card' }, h('h3', { text: T.prestige.title }), h('p', { text: T.prestige.intro }), this.clock, this.info, this.btn);
    this.host = h('div', {}, this.goal, card, this.story, h('h3', { class: 'list-title', text: T.prestige.shopTitle }), this.merits.host);
    this.btn.addEventListener('click', () => {
      if (!canPrestige(state())) return;
      const gained = pendingMerits(state());
      showDialog(T.prestige.title, [this.summary(state()), T.prestige.confirm], [
        { label: T.cancel },
        { label: T.prestige.confirmYes, primary: true, testId: 'confirm-prestige', onClick: () => this.confirmed(confirm, gained, state) },
      ]);
    });
  }

  /** The year in review shown in the confirm dialog (063). */
  private summary(state: GameState): HTMLElement {
    const s = yearSummary(state);
    const p = T.prestige;
    const lines = [
      p.summaryKp(fmt(s.kpEarned)) + diff(s.kpDiffPct, p.summaryPct),
      p.summaryCustomers(s.customers),
      p.summaryIntegrations(s.integrations),
      p.summaryEvents(s.events) + diff(s.eventsDiff),
      p.summaryTickets(s.tickets) + diff(s.ticketsDiff),
      ...(s.bestStreak > 0 ? [p.summaryStreak(s.bestStreak) + diff(s.bestStreakDiff)] : []),
      p.summaryTime(fmtDuration(s.durationMs)),
      p.summaryMerits(fmt(s.merits)),
    ];
    return h('div', { class: 'year-summary', testId: 'year-summary' }, h('strong', { text: T.prestige.summaryTitle }),
      h('ul', {}, ...lines.map((text) => h('li', { text }))),
      ...(s.bestYear ? [h('p', { class: 'prestige-preview', testId: 'year-summary-best', text: T.prestige.summaryBest })] : []),
      ...(s.fastestYear ? [h('p', { class: 'prestige-preview', testId: 'year-summary-fastest', text: T.prestige.summaryRecord })] : []));
  }

  /** Run the prestige, then show what the new school year brings (yearStart: chapter 052, unlocks 051, focus 053). */
  private confirmed(confirm: (gained: GameState['merits']) => void, gained: GameState['merits'], state: () => GameState): void {
    confirm(gained);
    const { chapter, unlocked, focuses } = yearStart(schoolYear(state()));
    if (chapter) addChapter(chapter.title, chapter.text);
    if (unlocked.length > 0) toast(T.prestige.unlocked(unlocked.map((a) => a.name).join(', ')), 'good');
    this.pickFocus(focuses, state().focusesPlayed);
  }

  /**
   * Let the player pick this school year's focus (053). It opens under the year transition, so it is seen
   * once that closes. Closing it keeps the default focus: no time limit, nothing lost.
   */
  private pickFocus(options: FocusDef[], played: readonly string[]): void {
    if (options.length < 2) return;
    let close = (): void => {};
    const buttons = options.map((f) => {
      const b = h('button', { class: 'btn wide focus-opt', testId: `focus-${f.id}` }, h('strong', { text: f.name }),
        ...(isUntriedFocus(f.id, played) ? [' · ', h('small', { class: 'muted', testId: 'focus-untried', text: T.focus.untried })] : []), h('br'), h('small', { text: focusLines(f).join(' · ') }));
      b.style.textAlign = 'left';
      b.addEventListener('click', () => (close(), this.chooseFocus(f.id)));
      return b;
    });
    close = showDialog(T.focus.pickTitle, [T.focus.pickIntro, ...buttons], [], 'focus-dialog');
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
    this.renderClock(state);
    this.renderGoal(state);
    this.merits.render(state);
  }

  /** How long this school year has run, against the record, from the second year on (094). */
  private renderClock(state: GameState): void {
    this.clock.hidden = state.prestiges < 1;
    if (this.clock.hidden) return;
    const { text, onPace } = yearClock(state);
    if (this.clock.textContent !== text) this.clock.textContent = text;
    this.clock.classList.toggle('on-pace', onPace);
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
