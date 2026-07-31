// docs/rules-spec.md section 10.1. A fixed placeholder set, no conditionals, no
// expressions. A placeholder with no value for this resolution is left alone
// rather than blanked, so a mis-authored explanation is visible instead of silent.

import type { Card } from './types.ts'

export type Placeholders = {
  card?: string
  family?: string
  lowest?: string
  highest?: string
  count?: number
  excludedCount?: number
}

const KEYS = ['card', 'family', 'lowest', 'highest', 'count', 'excludedCount'] as const

export function interpolate(template: string, values: Placeholders): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(KEYS as readonly string[]).includes(key)) return match
    const value = values[key as keyof Placeholders]
    return value === undefined ? match : String(value)
  })
}

/** {lowest} and {highest} are the ends of the unlock set in the order the
 *  strategy produced it - lowest rung first for a ladder. */
export const ends = (cards: Card[]) => ({
  lowest: cards[0]?.name,
  highest: cards.at(-1)?.name,
})

export const UNRESOLVED_EXPLANATION =
  'There is no agreed rule for this card yet. Rather than guess, this app says so. ' +
  'What is known factually about the card is shown below; what a foil of it unlocks has not been decided. ' +
  'Take it to the Discord - once it is settled it gets recorded here.'
