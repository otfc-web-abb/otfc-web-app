// docs/rules-spec.md section 6.1. A `replace` override answers the card outright,
// ignoring every rules.json entry, and supplies its own strategy label. The
// deliberate-refusal case is strategy 'unresolved' - a card where a family-level
// rule would over-reach and the honest answer is that this one is undecided.

import { familyContext, type Dataset } from '../dataset.ts'
import type { Draft, StrategyModule } from '../draft.ts'
import { UNRESOLVED_EXPLANATION } from '../explanation.ts'
import { unresolved } from './unresolved.ts'
import type { Card, Unlock } from '../types.ts'

export const override: StrategyModule = (d: Dataset, card: Card): Draft | null => {
  const entry = d.replaceByCard.get(card.name)
  if (!entry) return null

  if (entry.strategy === 'unresolved') {
    return {
      ...unresolved(d, card),
      explanation: entry.explanation || UNRESOLVED_EXPLANATION,
      caveats: entry.caveats ?? [],
      rulesetCaveats: entry.rulesetCaveats,
    }
  }

  const unlocks: Unlock[] = []
  for (const u of entry.unlocks ?? []) {
    const unlocked = d.cardsByName.get(u.card)
    if (!unlocked) continue
    unlocks.push({ card: unlocked, actions: u.actions ?? [], ...(u.note ? { note: u.note } : {}) })
  }

  const excluded = (entry.excluded ?? [])
    .map((n) => d.cardsByName.get(n))
    .filter((c): c is Card => c !== undefined)

  const family = (d.familiesByCard.get(card.name) ?? [])[0]

  return {
    strategy: entry.strategy,
    unlocks,
    excluded,
    explanation: entry.explanation,
    caveats: entry.caveats ?? [],
    confidence: entry.confidence,
    sources: entry.sources,
    rulesetCaveats: entry.rulesetCaveats,
    ...(family ? { family: familyContext(d, family) } : {}),
  }
}
