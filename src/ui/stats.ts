// Stats page: lifetime numbers, opened from the settings dialog. Rows are derived from the
// game state on open; every value shown is already part of the save.
import { ACHIEVEMENTS } from '../content/registry';
import { T } from '../content/texts';
import type { GameState } from '../core';
import { h, showDialog } from './dialogs';
import { fmt, fmtDuration } from './format';

export interface StatRow {
  label: string;
  value: string;
}

/** The rows of the stats page. Pure, so it can be tested without a DOM. */
export function statRows(state: GameState): StatRow[] {
  const kp = (d: GameState['kp']) => `${fmt(d)} ${T.currency}`;
  return [
    { label: T.stats.totalEarned, value: kp(state.totalEarned) },
    { label: T.stats.thisYear, value: kp(state.runEarned) },
    { label: T.stats.clicks, value: fmt(state.clicks) },
    { label: T.stats.events, value: fmt(state.eventsClaimed) },
    { label: T.stats.schoolYears, value: fmt(state.prestiges + 1) },
    { label: T.stats.meritsEarned, value: fmt(state.meritsEarned) },
    { label: T.stats.achievements, value: T.stats.of(state.achievements.length, ACHIEVEMENTS.length) },
    { label: T.stats.timePlayed, value: fmtDuration(state.timeMs) },
  ];
}

// Inline layout keeps the change inside this file (no shared stylesheet edits).
const ROW_STYLE = 'display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid var(--surface2)';

export function showStats(state: GameState): void {
  const rows = statRows(state).map((r, i) =>
    h('div', { class: 'stat-row', testId: `stat-${i}`, attrs: { style: ROW_STYLE } }, h('span', { text: r.label }), h('strong', { text: r.value })),
  );
  showDialog(
    T.stats.title,
    [h('div', { class: 'stat-list', testId: 'stat-list' }, ...rows), h('p', { class: 'muted', text: T.stats.note })],
    [{ label: T.stats.close, primary: true }],
    'stats-dialog',
  );
}
