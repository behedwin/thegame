// Tests for the "unstick PRs" decision logic (scripts/pr-lib.mjs), used by scripts/unstick-prs.mjs.
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helper without type declarations
import { checksState, planAction } from '../scripts/pr-lib.mjs';

type Pr = { number: number; labels: string[]; behindBy: number; autoMerge: boolean; checks: string };
const pr = (over: Partial<Pr> = {}): Pr => ({
  number: 21,
  labels: ['automerge'],
  behindBy: 0,
  autoMerge: true,
  checks: 'success',
  ...over,
});

describe('checksState', () => {
  it('is none without checks', () => {
    expect(checksState([])).toBe('none');
  });

  it('is success when every check passed or was skipped', () => {
    expect(
      checksState([
        { status: 'COMPLETED', conclusion: 'SUCCESS' },
        { status: 'COMPLETED', conclusion: 'SKIPPED' },
        { state: 'SUCCESS' },
      ]),
    ).toBe('success');
  });

  it('is pending while a check runs', () => {
    expect(checksState([{ status: 'IN_PROGRESS', conclusion: '' }, { status: 'COMPLETED', conclusion: 'SUCCESS' }])).toBe(
      'pending',
    );
    expect(checksState([{ state: 'PENDING' }])).toBe('pending');
  });

  it('is failure if any check failed, even while others run', () => {
    expect(checksState([{ status: 'COMPLETED', conclusion: 'FAILURE' }, { status: 'IN_PROGRESS' }])).toBe('failure');
    expect(checksState([{ status: 'COMPLETED', conclusion: 'TIMED_OUT' }])).toBe('failure');
    expect(checksState([{ state: 'ERROR' }])).toBe('failure');
  });

  it('does not treat a cancelled (superseded) run as failure', () => {
    expect(checksState([{ status: 'COMPLETED', conclusion: 'CANCELLED' }, { status: 'COMPLETED', conclusion: 'SUCCESS' }])).toBe(
      'success',
    );
  });
});

describe('planAction', () => {
  it('updates an automerge PR that is behind main, even while its checks still run', () => {
    // The race behind PR #21: main moved while CI ran, GitHub still said UNKNOWN, nothing updated it.
    expect(planAction(pr({ behindBy: 1, checks: 'pending' })).action).toBe('update-branch');
    expect(planAction(pr({ behindBy: 3, checks: 'success' })).action).toBe('update-branch');
  });

  it('updates a behind PR before reporting failing checks (the update may fix them)', () => {
    expect(planAction(pr({ behindBy: 1, checks: 'failure' })).action).toBe('update-branch');
  });

  it('re-enables auto-merge when the label is there but auto-merge is off', () => {
    expect(planAction(pr({ autoMerge: false })).action).toBe('enable-auto-merge');
    expect(planAction(pr({ autoMerge: false, checks: 'pending' })).action).toBe('enable-auto-merge');
  });

  it('reports an up-to-date PR with failing checks', () => {
    expect(planAction(pr({ checks: 'failure' })).action).toBe('report-failing');
  });

  it('does nothing for a healthy PR', () => {
    expect(planAction(pr()).action).toBe('none');
    expect(planAction(pr({ checks: 'pending' })).action).toBe('none');
  });

  it('leaves PRs without the automerge label alone', () => {
    expect(planAction(pr({ labels: ['needs-review'], behindBy: 2, autoMerge: false })).action).toBe('none');
  });

  it('leaves conflict and blocked PRs to the owner and the cleaner', () => {
    expect(planAction(pr({ labels: ['automerge', 'conflict'], behindBy: 2 })).action).toBe('none');
    expect(planAction(pr({ labels: ['blocked', 'automerge'], autoMerge: false })).action).toBe('none');
  });

  it('keeps the PR number and gives a reason', () => {
    const plan = planAction(pr({ number: 42, behindBy: 1 }));
    expect(plan.number).toBe(42);
    expect(plan.reason).toMatch(/behind/);
  });
});
