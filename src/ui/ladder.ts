// The ladder visual. The family in order, the searched card's position marked, and
// every member labelled unlocked or still locked.
//
// Showing what a player does NOT get is the point of this component, so a locked
// member is rendered as an explicit, readable row - never dimmed out of the way.

import type { Card, FamilyContext, Resolution, Unlock } from '../rules/index.ts'
import { actionBadges } from './actions.ts'
import { esc, plural, wikiLink } from './html.ts'

/** The unlock behind each row, keyed by card name. The verbs and any per-card note
 *  live on the row they apply to rather than in a section of their own. */
type ActionMap = Map<string, Unlock>

type MemberState = 'unlocked' | 'locked' | 'context'

/**
 * `unresolved` renders every member neutrally except the searched card itself
 * (DEC-0061) - no ruling exists for the rest of the family, so nothing there is
 * marked unlocked or locked, but the card the player actually pulled is always
 * theirs. Every other strategy states a complete unlock set, so a member outside
 * it is genuinely not unlocked and says so.
 */
function memberState(name: string, unlocked: Set<string>, strategy: string): MemberState {
  if (strategy === 'unresolved') return unlocked.has(name) ? 'unlocked' : 'context'
  return unlocked.has(name) ? 'unlocked' : 'locked'
}

const CAPTIONS: Record<string, string> = {
  'ladder-down': 'Your tier and everything below it is unlocked. Everything above stays locked.',
  'state-pair':
    'Your card is one item in two forms, so it does not descend this progression. The rest of it stays locked.',
  'plain-foil': 'Under this reading the foil unlocks only the card it shows. The rest stays locked.',
  unresolved:
    'No rule has been decided for this family, so nothing else here is marked unlocked or locked - but the card you pulled is always yours.',
  override: 'A card-specific ruling applies. The rest of the progression is shown for context.',
  components: 'Shown for context. This card unlocks its parts rather than the tiers below it.',
  group: 'Shown for context. This card unlocks its group rather than the tiers below it.',
}

function renderMember(card: Card, state: MemberState, isSearched: boolean, actions: ActionMap): string {
  const marks: Record<MemberState, string> = {
    unlocked: 'Unlocked',
    locked: 'Still locked',
    context: 'No ruling',
  }

  const unlock = state === 'unlocked' ? actions.get(card.name) : undefined
  const verbs = unlock?.actions ?? []

  return `
    <li class="ladder__member ladder__member--${state}${isSearched ? ' ladder__member--searched' : ''}">
      <img class="ladder__thumb" src="${esc(card.img)}" alt="" loading="lazy" width="28" height="28" />
      ${wikiLink(card.name, 'ladder__name')}
      ${verbs.length > 0 ? `<span class="ladder__actions">${actionBadges(verbs)}</span>` : ''}
      <span class="ladder__mark">${marks[state]}</span>
      ${unlock?.note ? `<span class="ladder__member-note">${esc(unlock.note)}</span>` : ''}
    </li>
  `
}

function renderRungs(
  family: FamilyContext,
  searched: Card | null,
  unlocked: Set<string>,
  strategy: string,
  actions: ActionMap,
): string {
  const rungs = family.rungs ?? []

  // Which rung to flag as "you are here". The searched card is normally a member,
  // but a state pair is keyed on one form only - foil Grimy guam leaf sits against
  // a herb ladder that lists Guam leaf - so fall back to the highest unlocked rung.
  let searchedRung = rungs.findIndex((rung) => rung.members.some((m) => m.name === searched?.name))
  if (searchedRung < 0) {
    searchedRung = rungs.reduce((found, rung, i) => (rung.members.some((m) => unlocked.has(m.name)) ? i : found), -1)
  }

  // Highest tier first: a progression reads as something you climb, and it puts the
  // locked tiers above the marker where they belong.
  return [...rungs]
    .reverse()
    .map((rung, reversedIndex) => {
      const index = rungs.length - 1 - reversedIndex
      const states = rung.members.map((m) => memberState(m.name, unlocked, strategy))
      const rungState = states.includes('unlocked') ? 'unlocked' : states[0]

      return `
        <li class="ladder__rung ladder__rung--${rungState}">
          <span class="ladder__tier">${esc(rung.tier)}</span>
          <ul class="ladder__members">
            ${rung.members
              .map((m, i) => renderMember(m, states[i], m.name === searched?.name, actions))
              .join('')}
          </ul>
          ${index === searchedRung ? '<span class="ladder__here">You are here</span>' : ''}
        </li>
      `
    })
    .join('')
}

/** Sets and composites carry no order, so they render as a plain member list. No
 *  shipped family is one yet - this is here so a Phase 7 group rule has a view. */
function renderFlat(
  family: FamilyContext,
  searched: Card | null,
  unlocked: Set<string>,
  strategy: string,
  actions: ActionMap,
): string {
  const members = [...(family.whole ? [family.whole] : []), ...(family.members ?? [])]

  return `
    <ul class="ladder__members ladder__members--flat">
      ${members
        .map((m) => renderMember(m, memberState(m.name, unlocked, strategy), m.name === searched?.name, actions))
        .join('')}
    </ul>
  `
}

export function renderLadder(resolution: Resolution): string {
  const family = resolution.family
  if (!family) return ''

  const { strategy, card } = resolution
  const unlocked = new Set(resolution.unlocks.map((u) => u.card.name))
  const actions: ActionMap = new Map(resolution.unlocks.map((u) => [u.card.name, u]))

  const isLadder = family.kind === 'ladder' && (family.rungs?.length ?? 0) > 0
  const body = isLadder
    ? `<ol class="ladder__rungs">${renderRungs(family, card, unlocked, strategy, actions)}</ol>`
    : renderFlat(family, card, unlocked, strategy, actions)

  const all = isLadder
    ? (family.rungs ?? []).flatMap((r) => r.members)
    : [...(family.whole ? [family.whole] : []), ...(family.members ?? [])]

  const unlockedCount = all.filter((m) => unlocked.has(m.name)).length
  const lockedCount = strategy === 'unresolved' ? 0 : all.length - unlockedCount
  const noRulingCount = all.length - unlockedCount

  const tally =
    strategy === 'unresolved'
      ? unlockedCount > 0
        ? `${plural(unlockedCount, 'card')} unlocked, ${plural(noRulingCount, 'card')} not ruled on`
        : `${plural(all.length, 'card')} in this family, none ruled on`
      : `${unlockedCount} unlocked, ${lockedCount} still locked`

  return `
    <section class="result__section ladder" aria-labelledby="ladder-title">
      <h3 class="result__heading" id="ladder-title">${esc(family.label)}</h3>
      <p class="ladder__caption">${CAPTIONS[strategy] ?? ''}</p>
      ${body}
      <p class="ladder__tally">${tally}</p>
      ${family.note ? `<p class="ladder__note">${esc(family.note)}</p>` : ''}
    </section>
  `
}
