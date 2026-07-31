// docs/rules-spec.md section 6.5. Unlocks every member of an unordered set -
// outfits, wilderness rings, tierless items that unlock sideways. Nothing is above
// anything else, so excluded is empty.

import { grantedActions } from '../actions.ts'
import { cardOf, familyContext, memberActions, type Dataset } from '../dataset.ts'
import { fromRule, type Draft, type StrategyModule } from '../draft.ts'
import { ends, interpolate } from '../explanation.ts'
import { matchFamily } from '../match.ts'
import type { Card, SetFamily, Unlock } from '../types.ts'

export const group: StrategyModule = (d: Dataset, card: Card): Draft | null => {
  const match = matchFamily(d, card.name, 'group', 'set')
  if (!match) return null

  const family = match.family as SetFamily
  const unlocks: Unlock[] = []
  for (const member of family.members) {
    const unlocked = d.cardsByName.get(cardOf(member))
    if (!unlocked) continue
    unlocks.push({
      card: unlocked,
      actions: grantedActions(memberActions(family, member), match.rule.grants?.actions),
      ...(typeof member === 'object' && member.note ? { note: member.note } : {}),
    })
  }

  return {
    strategy: 'group',
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
