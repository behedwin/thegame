// Top stats: KP counter, rates, the active buff and the current season.
import { T } from '../content/texts';
import { activeBuffs, activeSeason, kpPerClick, kpPerSecond, type GameState } from '../core';
import { h } from './dialogs';
import { countUp, shownValue } from './fx';
import { fmt } from './format';

/** Text for the first active buff, or null when none is running. */
export function buffLine(state: GameState): string | null {
  const b = activeBuffs(state)[0];
  return b ? T.buffActive(b.mult, Math.ceil((b.untilMs - state.timeMs) / 1000), b.kind === 'clickMult') : null;
}

export class Hud {
  private readonly kp = h('span', { class: 'kp-value', testId: 'kp-value', text: '0' });
  private readonly kps = h('span', { testId: 'kps' });
  private readonly kpc = h('span', {});
  private readonly buff = h('div', { class: 'buff', attrs: { hidden: '' } });
  private readonly season = h('div', { class: 'buff season', testId: 'season', attrs: { hidden: '', role: 'status', 'aria-label': T.season.aria } });
  readonly host = h('section', { class: 'stats' }, h('div', { class: 'kp' }, this.kp, h('span', { class: 'unit', text: ` ${T.currency}` })),
    h('div', { class: 'rates' }, this.kps, h('span', { class: 'dot', text: '·' }), this.kpc), this.buff, this.season);

  /** KP and rates only: cheap enough for every click. */
  renderCounters(state: GameState): void {
    countUp(this.kp, shownValue(this.kp) ?? state.kp, state.kp, 300);
    this.kps.textContent = `${fmt(kpPerSecond(state))} ${T.perSecond}`;
    this.kpc.textContent = `${fmt(kpPerClick(state))} ${T.perClick}`;
  }

  render(state: GameState): void {
    this.renderCounters(state);
    const buff = buffLine(state);
    if (buff) this.buff.textContent = buff;
    this.buff.hidden = !buff;
    const season = activeSeason(state);
    if (season) {
      this.season.textContent = T.season.banner(season);
      this.season.dataset.season = season.id;
    }
    this.season.hidden = !season;
  }
}
