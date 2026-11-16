// Stats page: lifetime numbers, opened from the settings dialog. Rows are derived from the
// game state on open; every value shown is already part of the save.
import { ACHIEVEMENTS, FOCUSES } from '../content/registry';
import { T } from '../content/texts';
import { bestYearEarned, DEFAULT_FOCUS, fastestYearRecord, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { fmt, fmtDuration } from './format';

export interface StatRow { label: string; value: string }

/** The rows of the stats page. Pure, so it can be tested without a DOM. */
export function statRows(state: GameState): StatRow[] {
  const S = T.stats;
  const row = (label: string, value: string): StatRow => ({ label, value });
  const count = (label: string, n: number | GameState['kp']): StatRow => row(label, fmt(n));
  const kp = (label: string, d: GameState['kp']): StatRow => row(label, `${fmt(d)} ${T.currency}`);
  return [
    kp(S.totalEarned, state.totalEarned),
    kp(S.thisYear, state.runEarned),
    kp(S.bestYear, bestYearEarned(state)),
    ...(fastestYearRecord(state) === null ? [] : [row(S.fastestYear, fmtDuration(state.fastestYearMs))]),
    count(S.bestEventStreak, state.bestEventStreak),
    row(S.yearBestStreak, S.yearStreakValue(state.yearBestStreak, state.prestiges >= 1 ? state.lastYearBestStreak : null)),
    count(S.purchases, state.purchases),
    count(S.clicks, state.clicks),
    count(S.events, state.eventsClaimed),
    count(S.tickets, state.ticketsAnswered),
    count(S.schoolYears, state.prestiges + 1),
    count(S.meritsEarned, state.meritsEarned),
    row(S.achievements, S.of(state.achievements.length, ACHIEVEMENTS.length)),
    row(S.focusesPlayed, S.of(state.focusesPlayed.length, FOCUSES.filter((f) => f.id !== DEFAULT_FOCUS).length)),
    row(S.timePlayed, fmtDuration(state.timeMs)),
  ];
}

export function showStats(state: GameState): void {
  const rows = statRows(state).map((r, i) =>
    h('div', { class: 'stat-row', testId: `stat-${i}` }, h('span', { text: r.label }), h('strong', { text: r.value })),
  );
  showDialog(
    T.stats.title,
    [h('div', { class: 'stat-list', testId: 'stat-list' }, ...rows), h('p', { class: 'muted', text: T.stats.note })],
    [{ label: T.stats.close, primary: true }],
    'stats-dialog',
  );
}
