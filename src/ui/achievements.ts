// Achievements tab: all achievements, unlocked ones first marked as done. Rebuilt only
// when the unlocked set changes.
import { ACHIEVEMENTS } from '../content/registry';
import { T } from '../content/texts';
import { ACHIEVEMENT_PROD_PCT, hasAchievement, type GameState } from '../core';
import { h } from './dialogs';

export class AchievementList {
  readonly host = h('div', { testId: 'achievement-list' });
  private signature = '';

  render(state: GameState): void {
    const sig = state.achievements.join(',');
    if (sig === this.signature) return;
    this.signature = sig;
    const unlocked = ACHIEVEMENTS.filter((a) => hasAchievement(state, a.id)).length;
    const cards = ACHIEVEMENTS.map((a) => {
      const done = hasAchievement(state, a.id);
      const card = h(
        'div',
        { class: 'card', testId: `achievement-${a.id}`, attrs: { 'data-unlocked': String(done) } },
        h(
          'div',
          { class: 'card-info' },
          h('div', { class: 'card-title' }, h('span', { text: a.name }), h('span', { class: 'card-level', text: done ? T.achievements.done : '' })),
          h('div', { class: 'card-desc', text: a.desc }),
        ),
      );
      if (!done) card.style.opacity = '0.55';
      return card;
    });
    this.host.replaceChildren(
      h('p', { class: 'muted', testId: 'achievement-summary', text: T.achievements.summary(unlocked, ACHIEVEMENTS.length, unlocked * ACHIEVEMENT_PROD_PCT) }),
      h('div', { class: 'list' }, ...cards),
    );
  }
}
