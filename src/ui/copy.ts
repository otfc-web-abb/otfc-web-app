// Standing UI copy. The engine authors everything specific to a resolution; this
// file holds only what is true on every screen regardless of which card was
// searched. Kept apart from the renderers so the wording is reviewable in one place.

/** The project's whole posture, and the reason the result view has a sticky bar
 *  rather than a footnote. */
export const GUIDELINE_LINE =
  'This is a guideline, not a ruling. Use your own discretion - and your group\'s.'

/**
 * The three positions the community actually holds, per osrscardexchange. Shown on
 * the unresolved screen as principles under discussion. Deliberately worded so that
 * none of them reads as a suggested answer for the card being viewed.
 */
export const CAMPS = [
  {
    label: 'Downward unlocks',
    weight: 'Described as the leading consensus',
    body: 'A foil unlocks its own card and everything below it in the same progression, but nothing above.',
  },
  {
    label: 'A foil is just a foil',
    weight: 'A vocal minority',
    body: 'A foil is a shiny duplicate. It unlocks the card it shows and nothing more.',
  },
  {
    label: 'It depends on your ruleset',
    weight: 'Held alongside either of the above',
    body: 'The unlock is the same, but what you may do around it differs - stricter rulesets forbid touching a locked source at all.',
  },
]

export const CAMPS_SOURCE = {
  label: 'osrscardexchange - Foil cards: what people say',
  url: 'https://www.osrscardexchange.com/blog/foil-cards-what-people-say',
}

/** docs/rules-spec.md section 7. Shown on About so a player can see which questions
 *  get asked, and in what order the first match wins. */
export const RESOLUTION_ORDER = [
  { label: 'Card-specific ruling', body: 'Is there a recorded ruling for this exact card?' },
  { label: 'Two forms of one item', body: 'Does it have an unprocessed and a processed form?' },
  { label: 'Down the progression', body: 'Is it a tier in a progression that unlocks downward?' },
  { label: 'Made of parts', body: 'Can it be broken down into components?' },
  { label: 'Part of a group', body: 'Does it belong to a set that unlocks together?' },
  { label: 'Monsters and NPCs', body: 'Does the NPC hierarchy apply? Not yet specified for any card.' },
]

/** What each ruleset actually changes, in one line. The three toggle labels are
 *  jargon on their own, and the difference between them is the whole reason the
 *  toggle exists - so the selected one says what it means directly under it. */
export const RULESET_BLURBS: Record<string, string> = {
  standard: 'The usual reading. You may gather and bank an item before its card is unlocked.',
  extreme: 'Strictest reading. Same unlocks, but you may not touch a locked source at all.',
  'plain-foil': 'A foil unlocks only the card it shows, and nothing else.',
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  sourced: 'Sourced',
  contested: 'Contested',
  undecided: 'Undecided',
}

export const CONFIDENCE_BLURBS: Record<string, string> = {
  sourced: 'A recorded source supports this, and none on file contradicts it.',
  contested: 'Sources exist but disagree, or the only source is itself disputed.',
  undecided: 'No rule exists for this card yet.',
}

export const ACTION_LABELS: Record<string, string> = {
  wear: 'wear',
  wield: 'wield',
  use: 'use',
  mine: 'mine',
  chop: 'chop',
  catch: 'catch',
  plant: 'plant',
  smelt: 'smelt',
  smith: 'smith',
  cook: 'cook',
  craft: 'craft',
  fletch: 'fletch',
}
