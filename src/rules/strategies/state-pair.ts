// docs/rules-spec.md section 6.2 and DEC-0001. Unlocks both states of the item
// and nothing else. Sits above ladder-down in the resolution order deliberately:
// Raw trout is in a state pair and (once one exists) a fish ladder, and the pair
// must win, so lower fish stay locked.

import { grantedActions } from '../actions.ts'
import { cardOf, familyContext, toCards, type Dataset } from '../dataset.ts'
import { fromRule, type Draft, type StrategyModule } from '../draft.ts'
import { ends, interpolate } from '../explanation.ts'
import { matchStatePair } from '../match.ts'
import type { Card, LadderFamily, Unlock } from '../types.ts'

/** The ladder the pair stopped the descent of. Section 6.2 reports the rest of it
 *  as excluded so the player can see what the pair cost them. Either state may be
 *  the one on the ladder - herbs are laddered under their clean name, so a foil
 *  Grimy guam leaf has to reach the herb ladder through its partner. */
const stoppedLadder = (d: Dataset, cardNames: string[]): LadderFamily | undefined =>
  cardNames.flatMap((n) => d.laddersByCard.get(n) ?? []).sort((a, b) => a.id.localeCompare(b.id))[0]

export const statePair: StrategyModule = (d: Dataset, card: Card): Draft | null => {
  const match = matchStatePair(d, card.name)
  if (!match) return null

  const unlocks: Unlock[] = []
  for (const state of match.pair.states) {
    const unlocked = d.cardsByName.get(state.card)
    if (!unlocked) continue
    unlocks.push({
      card: unlocked,
      actions: grantedActions(state.actions ?? [], match.rule.grants?.actions),
      ...(state.note ? { note: state.note } : {}),
    })
  }

  const unlockedNames = new Set(unlocks.map((u) => u.card.name))
  const ladder = stoppedLadder(d, [...unlockedNames])
  const excluded = ladder
    ? toCards(
        d,
        ladder.rungs.flatMap((r) => r.members.map(cardOf)).filter((n) => !unlockedNames.has(n)),
      )
    : []

  // The pair's `kind` is its transformation and the processed state is its output,
  // so the transformation never leaves the unlock set. Section 4.1's second
  // canonical case: foil Raw trout gets no product-boundary caveat.
  const processed = match.pair.states.find((s) => s.role === 'processed')?.card
  const products = processed
    ? new Map(match.pair.states.map((s) => [s.card, processed]))
    : undefined

  return {
    strategy: 'state-pair',
    unlocks,
    excluded,
    products,
    explanation: interpolate(match.rule.explanation, {
      card: card.name,
      family: match.pair.label,
      count: unlocks.length,
      excludedCount: excluded.length,
      ...ends(unlocks.map((u) => u.card)),
    }),
    ...(ladder ? { family: familyContext(d, ladder) } : {}),
    ...fromRule(match.rule),
  }
}
