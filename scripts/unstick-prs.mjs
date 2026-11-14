// Keep automerge PRs moving. Run by automerge.yml after every push to main, every 15 minutes, and
// on demand (workflow_dispatch). Workers and the cleaner can run it too (with a logged-in gh).
//
// For every open, non-draft PR labelled automerge (and not conflict/blocked):
//   - behind main (compare API, NOT mergeStateStatus, which says UNKNOWN right after a merge)
//     -> `gh pr update-branch`; if that fails -> label conflict (disables auto-merge);
//   - auto-merge off -> enable it (squash);
//   - up to date but checks fail -> warning (the cleaner/owner takes it from there).
//
// Env: REPO (owner/name; default: current repo), MAIN_SHA (default: current main), DRY_RUN=1 to only print.
// Usage: node scripts/unstick-prs.mjs
import { execFileSync } from 'node:child_process';
import { checksState, planAction } from './pr-lib.mjs';

const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const repo = process.env.REPO || gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
const dry = process.env.DRY_RUN === '1';
const mainSha = process.env.MAIN_SHA || gh(['api', `repos/${repo}/commits/main`, '--jq', '.sha']);

const prs = JSON.parse(
  gh(['pr', 'list', '-R', repo, '--state', 'open', '--json', 'number,labels,headRefOid,autoMergeRequest,statusCheckRollup,isDraft']),
);

let warnings = 0;
const warn = (msg) => {
  warnings++;
  console.log(`::warning::${msg}`);
};

for (const p of prs) {
  if (p.isDraft) continue;
  const labels = p.labels.map((l) => l.name);
  let behindBy = 0;
  if (labels.includes('automerge')) {
    try {
      behindBy = Number(gh(['api', `repos/${repo}/compare/${mainSha}...${p.headRefOid}`, '--jq', '.behind_by']));
    } catch (e) {
      warn(`PR #${p.number}: could not compare with main (${String(e.message).split('\n')[0]})`);
      continue;
    }
  }
  const plan = planAction({
    number: p.number,
    labels,
    behindBy,
    autoMerge: p.autoMergeRequest != null,
    checks: checksState(p.statusCheckRollup ?? []),
  });
  console.log(`#${p.number}: ${plan.action} (${plan.reason})${dry && plan.action !== 'none' ? ' [dry run]' : ''}`);
  if (dry) continue;

  if (plan.action === 'update-branch') {
    try {
      gh(['pr', 'update-branch', '-R', repo, String(p.number)]);
    } catch {
      warn(`PR #${p.number} could not be updated automatically; labelling conflict`);
      try {
        gh(['pr', 'edit', '-R', repo, String(p.number), '--add-label', 'conflict']);
      } catch {
        warn(`PR #${p.number}: could not add the conflict label`);
      }
    }
  } else if (plan.action === 'enable-auto-merge') {
    try {
      gh(['pr', 'merge', '-R', repo, String(p.number), '--auto', '--squash']);
    } catch (e) {
      warn(`PR #${p.number}: could not enable auto-merge (${String(e.message).split('\n')[0]})`);
    }
  } else if (plan.action === 'report-failing') {
    warn(`PR #${p.number} is up to date with main but its checks fail`);
  }
}

console.log(`unstick-prs: ${prs.length} open PR(s), ${warnings} warning(s)`);
