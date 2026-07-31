// docs/rules-spec.md section 6.3. Unlocks the card's own rung and every rung
// below it. rungs[0] is the lowest, so "below" is a lower index. Every rung above
// is reported as excluded - what you do not get matters as much as what you do.

import { grantedActions } from '../actions.ts'
import { cardOf, familyContext, memberActions, toCards, type Dataset } from '../dataset.ts'
import { fromRule, type Draft, type StrategyModule } from '../draft.ts'
import { ends, interpolate } from '../explanation.ts'
import { matchFamily } from '../match.ts'
import type { Card, LadderFamily, Unlock } from '../types.ts'

const rungIndexOf = (family: LadderFamily, cardName: string): number =>
  family.rungs.findIndex((r) => r.members.some((m) => cardOf(m) === cardName))

export const ladderDown: StrategyModule = (d: Dataset, card: Card): Draft | null => {
  const match = matchFamily(d, card.name, 'ladder-down', 'ladder')
  if (!match) return null

  const family = match.family as LadderFamily
  const index = rungIndexOf(family, card.name)
  if (index < 0) return null

  const unlocks: Unlock[] = []
  for (const rung of family.rungs.slice(0, index + 1)) {
    for (const member of rung.members) {
      const unlocked = d.cardsByName.get(cardOf(member))
      if (!unlocked) continue
      unlocks.push({
        card: unlocked,
        actions: grantedActions(memberActions(family, member), match.rule.grants?.actions),
        ...(typeof member === 'object' && member.note ? { note: member.note } : {}),
      })
    }
  }

  const excluded = toCards(
    d,
    family.rungs.slice(index + 1).flatMap((r) => r.members.map(cardOf)),
  )

  return {
    strategy: 'ladder-down',
    unlocks,
    excluded,
    explanation: interpolate(match.rule.explanation, {
      card: card.name,
      family: family.label,
      count: unlocks.length,
      excludedCount: excluded.length,
      ...ends(unlocks.map((u) => u.card)),
    }),
    family: familyContext(d, family),
    ...fromRule(match.rule),
  }
}
