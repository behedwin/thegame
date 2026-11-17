// Achievements tab: all achievements, unlocked ones marked as done and locked countable ones
// showing progress ("7 av 10"), and the nearest locked one highlighted on top (077).
// Locked trophies come first under "Kvar att ta", unlocked ones after under "Tagna" (113),
// which folds open and closed and starts collapsed (118).
// Rebuilt only when the unlocked set or a shown counter changes.
import { ACHIEVEMENTS, type AchievementDef } from '../content/registry';
import { T } from '../content/texts';
import { ACHIEVEMENT_PROD_PCT, hasAchievement, nearestAchievement, progress, type GameState } from '../core';
import { flashClass } from './celebrate';
import { h } from './dialogs';

type CardOpts = { class: string; testId: string; attrs: Record<string, string>; levelTestId?: string; tag?: string };

/** One trophy card: optional tag line, name with its level label, and the description. */
function card(a: AchievementDef, label: string, o: CardOpts): HTMLElement {
  return h(
    'div',
    { class: o.class, testId: o.testId, attrs: o.attrs },
    h(
      'div',
      { class: 'card-info' },
      ...(o.tag ? [h('div', { class: 'nearest-tag', text: o.tag })] : []),
      h('div', { class: 'card-title' }, h('span', { text: a.name }), h('span', { class: 'card-level', testId: o.levelTestId, text: label })),
      h('div', { class: 'card-desc', text: a.desc }),
    ),
  );
}

export interface Trophy { def: AchievementDef; label: string }

/** Locked trophies ("Kvar att ta") and unlocked ones ("Tagna"), each in registry order with its level label (113). Pure. */
export function trophyGroups(state: GameState): { locked: Trophy[]; taken: Trophy[] } {
  const locked: Trophy[] = [];
  const taken: Trophy[] = [];
  for (const def of ACHIEVEMENTS) {
    const p = progress(state, def.condition);
    if (hasAchievement(state, def.id)) taken.push({ def, label: T.achievements.done });
    else locked.push({ def, label: p ? T.achievements.progress(p.have, p.need) : '' });
  }
  return { locked, taken };
}

export class AchievementList {
  readonly host = h('div', { testId: 'achievement-list' });
  private signature = '';
  /** Whether the "Tagna" group is open; survives rebuilds but is not saved (118). */
  private takenOpen = false;

  constructor() {
    // Tapping the highlighted "nearest" card finds the same trophy in the list (104).
    this.host.addEventListener('click', (e) => this.jump(e.target));
    this.host.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.jump(e.target)) e.preventDefault();
    });
  }

  /** Scroll the list card matching the nearest card to the middle of the view and flash it. */
  private jump(target: EventTarget | null): boolean {
    const near = target instanceof Element ? target.closest<HTMLElement>('.card.nearest') : null;
    const id = near?.dataset.id;
    if (!id) return false;
    const el = [...this.host.querySelectorAll<HTMLElement>('.card:not(.nearest)')].find((c) => c.dataset.id === id);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    flashClass(el, 'flash', 900);
    return true;
  }

  /** The "Tagna (n)" heading as a toggle button and the taken cards in a body it shows or hides (118). */
  private takenFold(cards: HTMLElement[]): HTMLElement[] {
    const body = h('div', { class: 'fold-body', testId: 'achievement-group-unlocked-body' }, ...cards);
    body.hidden = !this.takenOpen;
    const toggle = h('button', {
      class: 'group-title group-toggle',
      testId: 'achievement-group-unlocked',
      text: T.achievements.groupUnlocked(cards.length),
      attrs: { type: 'button', 'aria-expanded': String(this.takenOpen) },
    });
    toggle.addEventListener('click', () => {
      this.takenOpen = !this.takenOpen;
      body.hidden = !this.takenOpen;
      toggle.setAttribute('aria-expanded', String(this.takenOpen));
    });
    return [toggle, body];
  }

  render(state: GameState): void {
    const g = trophyGroups(state);
    const sig = [...g.locked, ...g.taken].map((t) => `${t.def.id}:${t.label}`).join('|');
    if (sig === this.signature) return;
    this.signature = sig;
    const toCards = (list: Trophy[], done: boolean): HTMLElement[] =>
      list.map(({ def, label }) => card(def, label, { class: 'card', testId: `achievement-${def.id}`, attrs: { 'data-unlocked': String(done), 'data-id': def.id }, levelTestId: done ? undefined : `achievement-progress-${def.id}` }));
    // A group without cards shows no heading.
    const locked = toCards(g.locked, false);
    const cards: HTMLElement[] = locked.length ? [h('h3', { class: 'group-title', testId: 'achievement-group-locked', text: T.achievements.groupLocked }), ...locked] : [];
    if (g.taken.length) cards.push(...this.takenFold(toCards(g.taken, true)));
    const near = nearestAchievement(state);
    const top = near
      ? [card(near.def, T.achievements.progress(near.have, near.need), { class: 'card nearest', testId: 'achievement-nearest', attrs: { 'data-id': near.def.id, role: 'button', tabindex: '0' }, tag: T.achievements.nearest })]
      : [];
    this.host.replaceChildren(
      h('p', { class: 'muted', testId: 'achievement-summary', text: T.achievements.summary(g.taken.length, ACHIEVEMENTS.length, g.taken.length * ACHIEVEMENT_PROD_PCT) }),
      h('div', { class: 'list' }, ...top, ...cards),
    );
  }
}
