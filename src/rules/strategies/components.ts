// docs/rules-spec.md section 6.4. Unlocks the whole and each of its named parts.
// Only fires when the searched card is the whole - a foil on a part does not
// unlock the wholes that share it.

import { grantedActions } from '../actions.ts'
import { cardOf, familyContext, memberActions, type Dataset } from '../dataset.ts'
import { fromRule, type Draft, type StrategyModule } from '../draft.ts'
import { ends, interpolate } from '../explanation.ts'
import { matchFamily } from '../match.ts'
import type { Card, CompositeFamily, Unlock } from '../types.ts'

export const components: StrategyModule = (d: Dataset, card: Card): Draft | null => {
  const match = matchFamily(d, card.name, 'components', 'composite')
  if (!match) return null

  const family = match.family as CompositeFamily
  const unlocks: Unlock[] = []
  for (const member of [family.whole, ...family.parts]) {
    const unlocked = d.cardsByName.get(cardOf(member))
    if (!unlocked) continue
    unlocks.push({
      card: unlocked,
      actions: grantedActions(memberActions(family, member), match.rule.grants?.actions),
      ...(typeof member === 'object' && member.note ? { note: member.note } : {}),
    })
  }

  return {
    strategy: 'components',
    unlocks,
    excluded: [],
    explanation: interpolate(match.rule.explanation, {
      card: card.name,
      family: family.label,
      count: unlocks.length,
      excludedCount: 0,
      ...ends(unlocks.map((u) => u.card)),
    }),
    family: familyContext(d, family),
    ...fromRule(match.rule),
  }
}
