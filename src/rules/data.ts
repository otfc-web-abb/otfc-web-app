// The single boundary where the JSON files become typed. The JSON Schemas in
// data/schema/ are the contract and `npm run validate-rules` is the gate, so the
// cast here is asserting what validation already enforced rather than trusting
// the files blind.

import cardsJson from '../data/cards.json' with { type: 'json' }
import familiesJson from '../../data/families.json' with { type: 'json' }
import statePairsJson from '../../data/state-pairs.json' with { type: 'json' }
import rulesJson from '../../data/rules.json' with { type: 'json' }
import overridesJson from '../../data/overrides.json' with { type: 'json' }

import type { Card, Family, Override, RawData, Rule, RulesetDef, Ruleset, StatePair } from './types.ts'

export const shippedData: RawData = {
  cards: cardsJson as Card[],
  families: (familiesJson as { families: Family[] }).families,
  statePairs: (statePairsJson as { statePairs: StatePair[] }).statePairs,
  rulesets: (rulesJson as { rulesets: Record<Ruleset, RulesetDef> }).rulesets,
  rules: (rulesJson as { rules: Rule[] }).rules,
  overrides: (overridesJson as { overrides: Override[] }).overrides,
}
