// Test-only. Synthetic datasets for cases the curated data does not contain yet.
//
// The precedence test needs a card that is genuinely in both a state pair and a
// ruled ladder. No shipped card is: the herb, gem and dragonhide ladders carry no
// rule, and there is no fish ladder. Rather than add unsourced data to `data/` to
// make a test pass - which is exactly what the governing principle forbids - the
// engine takes its dataset as an argument and the test builds one.

import type { Card, Family, RawData, Rule, RulesetDef, Ruleset, StatePair } from './types.ts'

export const card = (name: string): Card => ({
  name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
  img: `https://example.invalid/${name}.png`,
  examine: `It's a ${name}.`,
  cats: [],
  regions: [],
  value: 1,
  equipable: false,
  equipmentSlot: null,
  options: [],
  stackable: false,
  questItem: false,
})

const ruleset = (label: string, confidence: RulesetDef['confidence']): RulesetDef => ({
  label,
  summary: `${label} summary.`,
  caveats: [`${label} caveat.`],
  confidence,
  sources: [{ kind: 'brief', label: `${label} source` }],
})

export const RULESETS: Record<Ruleset, RulesetDef> = {
  standard: ruleset('Standard', 'sourced'),
  extreme: ruleset('Extreme', 'contested'),
  'plain-foil': ruleset('Plain foil', 'contested'),
}

export const BRIEF: Rule['sources'] = [{ kind: 'brief', label: 'Test source' }]

export function dataset(parts: Partial<Omit<RawData, 'cards'>> & { cardNames: string[] }): RawData {
  return {
    cards: parts.cardNames.map(card),
    families: parts.families ?? [],
    statePairs: parts.statePairs ?? [],
    rulesets: parts.rulesets ?? RULESETS,
    rules: parts.rules ?? [],
    overrides: parts.overrides ?? [],
  }
}

// --- the state-pair vs ladder-down conflict -----------------------------------

export const FISH_NAMES = ['Raw shrimps', 'Shrimps', 'Raw trout', 'Trout', 'Raw salmon', 'Salmon']

export const FISH_LADDER: Family = {
  id: 'fish',
  label: 'Fish',
  kind: 'ladder',
  tags: ['resource'],
  actions: ['catch', 'cook'],
  rungs: [
    { tier: 'shrimps', members: [{ card: 'Raw shrimps', produces: 'Shrimps' }] },
    { tier: 'trout', members: [{ card: 'Raw trout', produces: 'Trout' }] },
    { tier: 'salmon', members: [{ card: 'Raw salmon', produces: 'Salmon' }] },
  ],
}

export const TROUT_PAIR: StatePair = {
  id: 'trout',
  label: 'Trout',
  kind: 'cook',
  states: [
    { card: 'Raw trout', role: 'unprocessed', actions: ['catch'] },
    { card: 'Trout', role: 'processed', actions: ['cook'] },
  ],
}

export const LADDER_RULE: Rule = {
  id: 'resource-ladder-down',
  strategy: 'ladder-down',
  applies: { familyTags: ['resource'] },
  explanation: '{card} unlocks {count} cards down to {lowest}.',
  confidence: 'sourced',
  sources: BRIEF,
}

export const STATE_PAIR_RULE: Rule = {
  id: 'state-pair-both-states-only',
  strategy: 'state-pair',
  applies: { statePairKinds: ['cook'] },
  explanation: 'Both forms of {card} and nothing else.',
  confidence: 'sourced',
  sources: BRIEF,
}
