// Effect texts shared by random events and inbox tickets: the same preview, the same receipt.
import { T } from '../content/texts';
import type { EventDef, EventEffect, FocusDef } from '../content/types';
import { getAutomation, kpPerClick, kpPerSecond, previewEffect, type Decimal, type EffectPreview, type GameState } from '../core';
import { fmt } from './format';

/** The effect itself: "Produktion ×1,5 i 30 s", "KP/klick ×2 i 30 s" or "+1 234 KP". */
export function effectText(p: EffectPreview): string {
  if (p.kind === 'lump') return T.effect.lump(fmt(p.kp));
  return T.effect.buff(p.mult, Math.round(p.durationMs / 1000), p.kind === 'clickMult');
}

/** The line under a choice. Buffs also show roughly what they are worth at today's pace, so they compare with lumps. */
export function effectLine(state: GameState, e: EventEffect): string {
  const p = previewEffect(state, e);
  if (p.kind === 'lump') return T.effect.now(effectText(p));
  const click = p.kind === 'clickMult';
  const perSec = click ? kpPerClick(state).mul(T.effect.clicksPerSec) : kpPerSecond(state);
  const worth = perSec.mul(p.mult - 1).mul(p.durationMs / 1000);
  // Nothing to multiply yet (no production): an estimate of +0 would only mislead.
  return worth.gte(1) ? T.effect.worth(effectText(p), fmt(worth), click ? T.effect.clicksPerSec : undefined) : effectText(p);
}

/** The event card's effect line and its accessible label (title, effect, call to action). */
export function eventCardText(state: GameState, def: EventDef): { line: string; label: string } {
  const line = effectLine(state, def.effect);
  return { line, label: `${def.title}. ${line}. ${T.eventTap}` };
}

/** Toast after a claimed event or an answered ticket: the fun text, then what actually happened. */
export function receiptText(text: string, e: EventEffect, after: GameState, granted: Decimal): string {
  return T.receipt(text, effectText(e.kind === 'lump' ? { kind: 'lump', kp: granted } : previewEffect(after, e)));
}

/** A school-year focus's rule changes (053), one line each, plus the merit bonus when it has any. */
export function focusLines(def: FocusDef): string[] {
  if (def.effects.length === 0) return [T.focus.none];
  const names = (t: readonly string[] | 'all') => (t === 'all' ? '' : t.map((id) => getAutomation(id)?.name ?? id).join(' och '));
  return [...def.effects.map((e) => T.focus.effect(e, e.kind === 'autoMult' ? names(e.targets) : '')), T.focus.meritBonus];
}
