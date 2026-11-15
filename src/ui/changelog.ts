// "Nyheter i spelet": the changelog built into the app at build time (see virtual:changelog in vite.config.ts).
import { entries, type ChangelogEntry } from 'virtual:changelog';
import { T } from '../content/texts';
import { h, showDialog } from './dialogs';

/** Group entries by day, keeping their newest-first order. Undated entries share one group. */
export function groupByDay(list: readonly ChangelogEntry[]): [string, ChangelogEntry[]][] {
  const groups = new Map<string, ChangelogEntry[]>();
  for (const e of list) {
    const key = e.date ?? '';
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups];
}

export function showChangelog(): void {
  const days = groupByDay(entries).map(([day, list]) =>
    h(
      'section',
      { class: 'changelog-day' },
      h('h3', { text: day ? T.changelog.day(day) : T.changelog.earlier }),
      h('ul', {}, ...list.map((e) => h('li', { testId: 'changelog-entry', text: e.title }))),
    ),
  );
  showDialog(
    T.changelog.title,
    [h('div', { class: 'changelog', testId: 'changelog-list' }, ...days)],
    [{ label: T.changelog.close, primary: true }],
    'changelog-dialog',
  );
}
