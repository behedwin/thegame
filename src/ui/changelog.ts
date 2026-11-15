// "Nyheter i spelet": the changelog built into the app at build time (see virtual:changelog in vite.config.ts).
import { build, entries, type ChangelogEntry } from 'virtual:changelog';
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

/**
 * Entries newer than the build the player last saw (056). Nothing when that build is unknown (0: new game
 * or an old save) or not older than the current one.
 */
export function newsSince(list: readonly ChangelogEntry[], lastSeen: number, current: number): ChangelogEntry[] {
  if (lastSeen <= 0 || lastSeen >= current) return [];
  return list.filter((e) => Number(e.id) > lastSeen);
}

export function showChangelog(): void {
  showEntries(entries);
}

/** The changelog dialog for the given entries: everything, or just "Nytt sedan sist" (056). */
function showEntries(list: readonly ChangelogEntry[]): void {
  const days = groupByDay(list).map(([day, list]) =>
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

/**
 * "Nytt sedan sist" (056): the closable bar shown after an update. `seen` stores the current build; it runs
 * once the player opens or closes the bar, or right away when the welcome dialog shows the line instead.
 */
export class NewsBar {
  readonly host = h('div', { class: 'tip', testId: 'news-bar', attrs: { role: 'status', 'aria-label': T.changelog.newsTitle, hidden: '' } });
  private news: ChangelogEntry[] = [];

  constructor(private readonly seen: (build: number) => void) {
    const show = h('button', { class: 'tip-next', testId: 'news-open', text: T.changelog.show });
    const close = h('button', { class: 'tip-close', testId: 'news-close', text: '×', attrs: { 'aria-label': T.changelog.hide } });
    show.addEventListener('click', () => (this.done(), showEntries(this.news)));
    close.addEventListener('click', () => this.done());
    this.host.append(h('span', { class: 'tip-text', testId: 'news-text' }), show, close);
  }

  /** Decide what to show after loading. Returns the news (empty when there is nothing to tell). */
  load(lastSeen: number): ChangelogEntry[] {
    this.news = newsSince(entries, lastSeen, build);
    if (lastSeen !== build && !this.news.length) this.seen(build);
    return this.news;
  }

  /** Show the bar for the loaded news. */
  showBar(): void {
    if (!this.news.length) return;
    this.host.querySelector('.tip-text')!.textContent = T.changelog.updated(this.news.length);
    this.host.hidden = false;
  }

  /** The same news as a line in another dialog (the welcome dialog); counts as seen right away. */
  line(): HTMLElement {
    const btn = h('button', { class: 'btn', testId: 'welcome-news', text: T.changelog.updated(this.news.length) });
    const news = this.news;
    btn.addEventListener('click', () => showEntries(news));
    this.seen(build);
    return btn;
  }

  private done(): void {
    this.host.hidden = true;
    this.seen(build);
  }
}
