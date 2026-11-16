// Achievements tab: all achievements, unlocked ones marked as done and locked countable ones
// showing progress ("7 av 10"), and the nearest locked one highlighted on top (077).
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

export class AchievementList {
  readonly host = h('div', { testId: 'achievement-list' });
  private signature = '';

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

  render(state: GameState): void {
    const labels = ACHIEVEMENTS.map((a) => {
      if (hasAchievement(state, a.id)) return T.achievements.done;
      const p = progress(state, a.condition);
      return p ? T.achievements.progress(p.have, p.need) : '';
    });
    const sig = labels.join('|');
    if (sig === this.signature) return;
    this.signature = sig;
    const unlocked = ACHIEVEMENTS.filter((a) => hasAchievement(state, a.id)).length;
    const cards = ACHIEVEMENTS.map((a, i) => {
      const done = hasAchievement(state, a.id);
      return card(a, labels[i] ?? '', {
        class: 'card',
        testId: `achievement-${a.id}`,
        attrs: { 'data-unlocked': String(done), 'data-id': a.id },
        levelTestId: done ? undefined : `achievement-progress-${a.id}`,
      });
    });
    const near = nearestAchievement(state);
    const top = near
      ? [card(near.def, T.achievements.progress(near.have, near.need), { class: 'card nearest', testId: 'achievement-nearest', attrs: { 'data-id': near.def.id, role: 'button', tabindex: '0' }, tag: T.achievements.nearest })]
      : [];
    this.host.replaceChildren(
      h('p', { class: 'muted', testId: 'achievement-summary', text: T.achievements.summary(unlocked, ACHIEVEMENTS.length, unlocked * ACHIEVEMENT_PROD_PCT) }),
      h('div', { class: 'list' }, ...top, ...cards),
    );
  }
}
