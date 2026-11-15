// Achievements tab: all achievements, unlocked ones marked as done and locked countable ones
// showing progress ("7 av 10"). Rebuilt only when the unlocked set or a shown counter changes.
import { ACHIEVEMENTS } from '../content/registry';
import { T } from '../content/texts';
import { ACHIEVEMENT_PROD_PCT, hasAchievement, progress, type GameState } from '../core';
import { h } from './dialogs';

export class AchievementList {
  readonly host = h('div', { testId: 'achievement-list' });
  private signature = '';

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
      return h(
        'div',
        { class: 'card', testId: `achievement-${a.id}`, attrs: { 'data-unlocked': String(done) } },
        h(
          'div',
          { class: 'card-info' },
          h('div', { class: 'card-title' }, h('span', { text: a.name }), h('span', { class: 'card-level', testId: done ? undefined : `achievement-progress-${a.id}`, text: labels[i] })),
          h('div', { class: 'card-desc', text: a.desc }),
        ),
      );
    });
    this.host.replaceChildren(
      h('p', { class: 'muted', testId: 'achievement-summary', text: T.achievements.summary(unlocked, ACHIEVEMENTS.length, unlocked * ACHIEVEMENT_PROD_PCT) }),
      h('div', { class: 'list' }, ...cards),
    );
  }
}
