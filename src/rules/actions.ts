// The product boundary from docs/rules-spec.md section 4.1, and the one action
// class that drives it. Section 4 also names a possession and an acquisition
// class; neither has behaviour attached, so neither is listed here. The
// transformation class is hard-coded on purpose - a new verb is one of the few
// changes that legitimately needs code.

import type { Dataset } from './dataset.ts'
import type { Action, Unlock } from './types.ts'

export const TRANSFORMATION: readonly Action[] = ['smelt', 'smith', 'cook', 'craft', 'fletch']

const GERUND: Record<string, string> = {
  smelt: 'smelting',
  smith: 'smithing',
  cook: 'cooking',
  craft: 'crafting',
  fletch: 'fletching',
}

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`

/** `grants.actions` on a rule: 'inherit' or absent keeps the factual verb set, an
 *  explicit list replaces it. */
export const grantedActions = (
  factual: Action[],
  grants: 'inherit' | Action[] | undefined,
): Action[] => (grants === undefined || grants === 'inherit' ? factual : grants)

/**
 * Section 4.1. A resolution that grants a transformation verb on a card whose
 * product falls outside its own unlock set gets the verb-not-product caveat.
 * Derived, so no rule has to author it.
 */
export function productBoundaryCaveat(
  d: Dataset,
  unlocks: Unlock[],
  /** Products the strategy knows better than the family data does. A state pair's
   *  transformation is the pair itself, so both its states produce the processed
   *  card - which is always inside the unlock set, which is why foil Raw trout
   *  gets no caveat while foil Iron ore does. */
  products_: Map<string, string> | undefined,
): string | null {
  const unlocked = new Set(unlocks.map((u) => u.card.name))
  const verbs = new Set<Action>()
  const products = new Set<string>()
  let unknownProduct = false

  for (const u of unlocks) {
    const transforming = u.actions.filter((a) => TRANSFORMATION.includes(a))
    if (transforming.length === 0) continue
    for (const a of transforming) verbs.add(a)

    const product = products_?.get(u.card.name) ?? d.producesByCard.get(u.card.name)
    if (!product) unknownProduct = true
    else if (!unlocked.has(product)) products.add(product)
  }

  if (verbs.size === 0) return null

  const doing = list([...verbs].map((a) => GERUND[a] ?? a))
  const verb = verbs.size === 1 ? 'is' : 'are'
  const lead = `You get the action, not what it makes. ${sentenceCase(doing)} ${verb} granted here, but`

  if (products.size > 0) {
    const tail = products.size === 1 ? 'is a separate card' : 'are separate cards'
    return `${lead} ${list([...products])} ${tail} you still need to pull.`
  }
  if (unknownProduct) {
    return `${lead} whatever comes out is a separate card you still need to pull.`
  }
  return null
}
