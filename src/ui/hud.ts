// Top stats: KP counter, rates, the active buffs and the current season.
import { BALANCE } from '../content/balance';
import { T } from '../content/texts';
import { activeBuffs, activeSeason, connectedMunicipalities, currentFocus, DEFAULT_FOCUS, kpPerClick, kpPerSecond, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { focusLines } from './effects';
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
  private readonly goal = h('div', { class: 'goal-chip', testId: 'goal-hud', attrs: { hidden: '', 'aria-label': T.goal.aria, title: T.goal.title } });
  private readonly focus = h('button', { class: 'focus-chip', testId: 'focus-hud', attrs: { hidden: '' } });
  readonly host = h('section', { class: 'stats' }, h('div', { class: 'kp' }, this.kp, h('span', { class: 'unit', text: ` ${T.currency}` })),
    h('div', { class: 'rates' }, this.kps, h('span', { class: 'dot', text: '·' }), this.kpc),
    // Goal, focus, buffs and season share one wrapping row, so the HUD stays short (057).
    h('div', { class: 'chips' }, this.goal, this.focus, this.buffs, this.season));
  private focusDef = currentFocus({});

  constructor() {
    // Tapping the focus label explains what this school year changes (053).
    this.focus.addEventListener('click', () => showDialog(this.focusDef.name, [this.focusDef.desc, ...focusLines(this.focusDef)], [{ label: T.focus.close, primary: true }], 'focus-info'));
  }

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
    const towns = connectedMunicipalities(state);
    this.goal.textContent = T.goal.short(towns, BALANCE.goal.municipalities);
    this.goal.hidden = towns === 0;
    this.focusDef = currentFocus(state);
    this.focus.textContent = this.focusDef.name;
    this.focus.setAttribute('aria-label', T.focus.aria(this.focusDef.name));
    this.focus.hidden = this.focusDef.id === DEFAULT_FOCUS;
  }
}
