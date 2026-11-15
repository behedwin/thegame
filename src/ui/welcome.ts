// Welcome-back dialog after offline time: what the network earned and the morning choice (034).
import { AUTOMATIONS, systemName } from '../content/registry';
import { T } from '../content/texts';
import { level, MORNING_CHOICES, type GameState, type MorningChoice } from '../core';
import { h, showDialog } from './dialogs';
import { sfx } from './feedback';
import { fmt, fmtDuration } from './format';

/** Id of a system the player has connected (either end of a random owned automation), or the default. */
export function welcomeSystemId(state: GameState, rng: () => number): string {
  const owned = AUTOMATIONS.filter((a) => level(state.automations, a.id) > 0);
  const pick = owned[Math.floor(rng() * owned.length)];
  return pick ? (rng() < 0.5 ? pick.from : pick.to) : 'skolmjuk';
}

export function showWelcome(state: GameState, earned: GameState['kp'], awayMs: number, creditedMs: number, choose: (c: MorningChoice) => void): void {
  showDialog(
    T.welcomeTitle,
    [
      h('p', { class: 'big-line', text: T.welcomeBody(systemName(welcomeSystemId(state, Math.random)), fmt(earned)) }),
      h('p', { class: 'muted', text: T.welcomeAway(fmtDuration(awayMs), awayMs > creditedMs, fmtDuration(creditedMs)) }),
      ...(state.inbox.length ? [h('p', { testId: 'welcome-tickets', text: T.welcomeTickets(state.inbox.length) })] : []),
      h('p', { text: T.morning.ask }),
    ],
    MORNING_CHOICES.map((c, i) => ({ label: T.morning[c], primary: !i, testId: i ? `welcome-${c}` : 'welcome-ok', onClick: () => choose(c) })),
    'welcome-dialog',
  );
  sfx.fanfare();
}
