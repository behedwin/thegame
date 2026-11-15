// Top stats: KP counter, rates, the active buffs and the current season.
import { T } from '../content/texts';
import { activeBuffs, activeSeason, kpPerClick, kpPerSecond, type GameState } from '../core';
import { h } from './dialogs';
import { countUp, shownValue } from './fx';
import { fmt } from './format';

/** One text per running buff, so the player sees every answer that is still working. */
export function buffLines(state: GameState): string[] {
  return activeBuffs(state).map((b) => T.buffActive(b.mult, Math.ceil((b.untilMs - state.timeMs) / 1000), b.kind === 'clickMult'));
}

export class Hud {
  private readonly kp = h('span', { class: 'kp-value', testId: 'kp-value', text: '0' });
  private readonly kps = h('span', { testId: 'kps' });
  private readonly kpc = h('span', {});
  private readonly buffs = h('div', { class: 'buffs', testId: 'buffs', attrs: { hidden: '' } });
  private readonly season = h('div', { class: 'buff season', testId: 'season', attrs: { hidden: '', role: 'status', 'aria-label': T.season.aria } });
  readonly host = h('section', { class: 'stats' }, h('div', { class: 'kp' }, this.kp, h('span', { class: 'unit', text: ` ${T.currency}` })),
    h('div', { class: 'rates' }, this.kps, h('span', { class: 'dot', text: '·' }), this.kpc), this.buffs, this.season);

  /** KP and rates only: cheap enough for every click. */
  renderCounters(state: GameState): void {
    countUp(this.kp, shownValue(this.kp) ?? state.kp, state.kp, 300);
    this.kps.textContent = `${fmt(kpPerSecond(state))} ${T.perSecond}`;
    this.kpc.textContent = `${fmt(kpPerClick(state))} ${T.perClick}`;
  }

  render(state: GameState): void {
    this.renderCounters(state);
    const lines = buffLines(state);
    const chips = [...this.buffs.children];
    if (chips.length !== lines.length) this.buffs.replaceChildren(...lines.map(() => h('span', { class: 'buff' })));
    lines.forEach((text, i) => (this.buffs.children[i]!.textContent = text));
    this.buffs.hidden = lines.length === 0;
    const season = activeSeason(state);
    if (season) {
      this.season.textContent = T.season.banner(season);
      this.season.dataset.season = season.id;
    }
    this.season.hidden = !season;
  }
}
