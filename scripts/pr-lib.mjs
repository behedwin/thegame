// Pure decision logic that keeps automerge PRs from getting stuck. Used by scripts/unstick-prs.mjs
// (run by automerge.yml after every push to main and on a schedule). Tested in tests/pr-lib.test.ts.

/** Labels that hand a PR to the owner or the cleaner: never touched automatically. */
export const STOP_LABELS = ['conflict', 'blocked'];

const FAILED = new Set(['FAILURE', 'TIMED_OUT', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'ERROR']);
const PENDING_STATES = new Set(['PENDING', 'EXPECTED']);

/**
 * Summarise a PR's statusCheckRollup (from `gh pr view/list --json statusCheckRollup`).
 * Check runs have status/conclusion, commit statuses have state. CANCELLED is ignored: it is what a
 * superseded run looks like.
 * @returns {'none' | 'failure' | 'pending' | 'success'}
 */
export function checksState(rollup) {
  if (!rollup || rollup.length === 0) return 'none';
  let pending = false;
  for (const c of rollup) {
    const result = (c.conclusion || c.state || '').toUpperCase();
    if (FAILED.has(result)) return 'failure';
    const status = (c.status || '').toUpperCase();
    if ((c.status !== undefined && status !== 'COMPLETED') || PENDING_STATES.has(result)) pending = true;
  }
  return pending ? 'pending' : 'success';
}

/**
 * Decide what to do with one open PR.
 * @param {{number: number, labels: string[], behindBy: number, autoMerge: boolean, checks: string}} pr
 * @returns {{number: number, action: 'update-branch' | 'enable-auto-merge' | 'report-failing' | 'none', reason: string}}
 */
export function planAction(pr) {
  const out = (action, reason) => ({ number: pr.number, action, reason });
  if (!pr.labels.includes('automerge')) return out('none', 'no automerge label');
  const stop = pr.labels.find((l) => STOP_LABELS.includes(l));
  if (stop) return out('none', `labelled ${stop}: left to the owner/cleaner`);
  if (pr.behindBy > 0) return out('update-branch', `${pr.behindBy} commit(s) behind main`);
  if (pr.checks === 'failure') return out('report-failing', 'up to date with main but checks fail');
  if (!pr.autoMerge) return out('enable-auto-merge', 'automerge label but auto-merge is off');
  return out('none', pr.checks === 'success' ? 'up to date, auto-merge on' : 'up to date, waiting for checks');
}
