// docs/rules-spec.md sections 6.7 and 8. Nothing matched, and that is a designed
// answer rather than a failure. Nothing is claimed in either direction: no
// unlocks, no exclusions, no sources. The family is carried through so the ladder
// still renders as neutral context - a player who knows the ladder can reason
// about it themselves, which is the whole point of a guideline.

import { familyContext, type Dataset } from '../dataset.ts'
import type { Draft } from '../draft.ts'
import { UNRESOLVED_EXPLANATION } from '../explanation.ts'
import type { Card, Family } from '../types.ts'

/** Ladders read best as context, so they win when a card is in more than one family. */
const contextFamily = (d: Dataset, cardName: string): Family | undefined => {
  const families = (d.familiesByCard.get(cardName) ?? []).slice().sort((a, b) => a.id.localeCompare(b.id))
  return families.find((f) => f.kind === 'ladder') ?? families[0]
}

export const unresolved = (d: Dataset, card: Card | null): Draft => {
  const family = card ? contextFamily(d, card.name) : undefined
  return {
    strategy: 'unresolved',
    unlocks: [],
    excluded: [],
    explanation: UNRESOLVED_EXPLANATION,
    caveats: [],
    confidence: 'undecided',
    sources: [],
    ...(family ? { family: familyContext(d, family) } : {}),
  }
}
