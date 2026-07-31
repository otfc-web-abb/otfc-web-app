// What a strategy module returns. resolve() turns a Draft into a Resolution by
// applying annotate overrides, the ruleset, and the product boundary.

import type { Card, Confidence, FamilyContext, Rule, RulesetCaveats, Source, Strategy, Unlock } from './types.ts'

export type Draft = {
  strategy: Strategy
  unlocks: Unlock[]
  excluded: Card[]
  explanation: string
  caveats: string[]
  confidence: Confidence
  sources: Source[]
  family?: FamilyContext
  ruleId?: string
  rulesetCaveats?: RulesetCaveats
  /** Set by a rule's `grants.productBoundary` to force the caveat on or off.
   *  Undefined leaves the engine to derive it. */
  productBoundary?: boolean
  /** Per-resolution product knowledge, consulted ahead of the family data. */
  products?: Map<string, string>
}

/** A strategy module. Returns null when the card does not match it, which is how
 *  the resolution order falls through. */
export type StrategyModule = (d: import('./dataset.ts').Dataset, card: Card) => Draft | null

export const fromRule = (rule: Rule) => ({
  ruleId: rule.id,
  confidence: rule.confidence,
  sources: rule.sources,
  caveats: rule.caveats ?? [],
  rulesetCaveats: rule.rulesetCaveats,
  productBoundary: rule.grants?.productBoundary,
})
