// Which rule fires at a given strategy, and which factual family or pair it
// selected. Tie-breaks are docs/rules-spec.md section 7.1: explicit beats broad,
// and equal specificity is a validation error rather than a runtime coin toss.

import type { Dataset } from './dataset.ts'
import type { Family, FamilyKind, Rule, RuleStrategy, StatePair } from './types.ts'

export type FamilyMatch = { rule: Rule; family: Family }
export type PairMatch = { rule: Rule; pair: StatePair }

const byId = <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id)

/** Picks the winner from explicit and broad candidates. validate-rules check 11
 *  guarantees at most one per tier; taking the first keeps it deterministic if
 *  the data ever drifts ahead of the validator. */
const winner = <T>(explicit: T[], broad: T[]): T | null => explicit[0] ?? broad[0] ?? null

export function matchFamily(
  d: Dataset,
  cardName: string,
  strategy: Exclude<RuleStrategy, 'state-pair'>,
  kind: FamilyKind,
): FamilyMatch | null {
  const candidates = (d.familiesByCard.get(cardName) ?? [])
    .filter((f) => f.kind === kind)
    .filter((f) => (f.kind === 'composite' ? f.whole === cardName : true))
    .sort(byId)
  if (candidates.length === 0) return null

  const explicit: FamilyMatch[] = []
  const broad: FamilyMatch[] = []

  for (const rule of d.rules) {
    if (rule.strategy !== strategy) continue
    const named = candidates.find((f) => rule.applies.families?.includes(f.id))
    if (named) {
      explicit.push({ rule, family: named })
      continue
    }
    const tagged = candidates.find((f) => (f.tags ?? []).some((t) => rule.applies.familyTags?.includes(t)))
    if (tagged) broad.push({ rule, family: tagged })
  }

  return winner(explicit, broad)
}

export function matchStatePair(d: Dataset, cardName: string): PairMatch | null {
  const candidates = (d.statePairsByCard.get(cardName) ?? []).slice().sort(byId)
  if (candidates.length === 0) return null

  const explicit: PairMatch[] = []
  const broad: PairMatch[] = []

  for (const rule of d.rules) {
    if (rule.strategy !== 'state-pair') continue
    const named = candidates.find((p) => rule.applies.statePairs?.includes(p.id))
    if (named) {
      explicit.push({ rule, pair: named })
      continue
    }
    const kinded = candidates.find((p) => rule.applies.statePairKinds?.includes(p.kind))
    if (kinded) broad.push({ rule, pair: kinded })
  }

  return winner(explicit, broad)
}
