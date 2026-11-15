// Achievements tab: all achievements, unlocked ones marked as done and locked countable ones
// showing progress ("7 av 10"), and the nearest locked one highlighted on top (077).
// Rebuilt only when the unlocked set or a shown counter changes.
import { ACHIEVEMENTS, type AchievementDef } from '../content/registry';
import { T } from '../content/texts';
import { ACHIEVEMENT_PROD_PCT, hasAchievement, progress, type GameState } from '../core';
import { h } from './dialogs';

/** The locked countable trophy with the highest have / need (started, i.e. have > 0); ties keep content order. */
export function nearestAchievement(
  state: GameState,
  list: readonly AchievementDef[] = ACHIEVEMENTS,
): { def: AchievementDef; have: number; need: number } | null {
  let best: { def: AchievementDef; have: number; need: number } | null = null;
  for (const def of list) {
    if (hasAchievement(state, def.id)) continue;
    const p = progress(state, def.condition);
    if (!p || p.have <= 0 || p.have >= p.need) continue;
    if (!best || p.have / p.need > best.have / best.need) best = { def, ...p };
  }
  return best;
}

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
    const near = nearestAchievement(state);
    const top = near
      ? [
          h(
            'div',
            { class: 'card nearest', testId: 'achievement-nearest', attrs: { 'data-id': near.def.id } },
            h(
              'div',
              { class: 'card-info' },
              h('div', { class: 'nearest-tag', text: T.achievements.nearest }),
              h('div', { class: 'card-title' }, h('span', { text: near.def.name }), h('span', { class: 'card-level', text: T.achievements.progress(near.have, near.need) })),
              h('div', { class: 'card-desc', text: near.def.desc }),
            ),
          ),
        ]
      : [];
    this.host.replaceChildren(
      h('p', { class: 'muted', testId: 'achievement-summary', text: T.achievements.summary(unlocked, ACHIEVEMENTS.length, unlocked * ACHIEVEMENT_PROD_PCT) }),
      h('div', { class: 'list' }, ...top, ...cards),
    );
  }
}
