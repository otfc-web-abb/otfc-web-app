// docs/rules-spec.md section 5. The "a foil is just a foil" camp. Short-circuits
// the whole resolution order and returns the searched card alone. A first-class
// answer representing a real community position, not an error state and not a
// debug mode.

import { familyContext, type Dataset } from '../dataset.ts'
import type { Draft } from '../draft.ts'
import type { Card } from '../types.ts'

export const plainFoil = (d: Dataset, card: Card): Draft => {
  const ruleset = d.rulesets['plain-foil']
  const family = (d.familiesByCard.get(card.name) ?? [])[0]

  return {
    strategy: 'plain-foil',
    // Verbs come from the factual data where it records them. A card in no family
    // and no state pair has no curated verbs, and an empty list is the honest answer.
    unlocks: [{ card, actions: d.actionsByCard.get(card.name) ?? [] }],
    excluded: [],
    explanation: ruleset.summary,
    caveats: ruleset.caveats ?? [],
    confidence: ruleset.confidence,
    sources: ruleset.sources,
    ...(family ? { family: familyContext(d, family) } : {}),
  }
}
