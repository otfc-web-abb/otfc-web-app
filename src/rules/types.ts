// The Resolution contract from docs/rules-spec.md section 10, plus TypeScript
// mirrors of the four data files. The JSON Schemas in data/schema/ are the
// contract for the data; these types are the engine's view of it.

export type Ruleset = 'standard' | 'extreme' | 'plain-foil'

export type Strategy =
  | 'override'
  | 'state-pair'
  | 'ladder-down'
  | 'components'
  | 'group'
  | 'npc-hierarchy'
  | 'plain-foil'
  | 'unresolved'

export type Action =
  | 'wear'
  | 'wield'
  | 'use'
  | 'mine'
  | 'chop'
  | 'catch'
  | 'plant'
  | 'smelt'
  | 'smith'
  | 'cook'
  | 'craft'
  | 'fletch'

export type Confidence = 'sourced' | 'contested' | 'undecided'

/** A record in src/data/cards.json. */
export type Card = {
  name: string
  slug: string
  img: string
  examine: string
  cats: string[]
  regions: string[]
  value: number
  equipable: boolean
  equipmentSlot: string | null
  options: string[]
  stackable: boolean
  questItem: boolean
}

export type Source = {
  kind: 'brief' | 'decision' | 'community' | 'wiki' | 'game-data'
  label: string
  url?: string
  decision?: string
  quote?: string
  retrieved?: string
}

export type Unlock = { card: Card; actions: Action[]; note?: string }

/** The family behind a resolution, resolved to cards so the ladder visual can render it. */
export type FamilyContext = {
  id: string
  label: string
  kind: FamilyKind
  note?: string
  /** Ladders only. rungs[0] is the lowest. */
  rungs?: { tier: string; members: Card[] }[]
  /** Sets and composites. For a composite this is the parts. */
  members?: Card[]
  /** Composites only. */
  whole?: Card
}

export type Resolution = {
  card: Card | null
  ruleset: Ruleset
  strategy: Strategy
  unlocks: Unlock[]
  excluded: Card[]
  explanation: string
  caveats: string[]
  confidence: Confidence
  sources: Source[]
  family?: FamilyContext
  ruleId?: string
}

// --- data files ---------------------------------------------------------------

export type FamilyKind = 'ladder' | 'set' | 'composite'

export type Member =
  | string
  | { card: string; cosmeticOf?: string; actions?: Action[]; produces?: string; note?: string }

export type Rung = { tier: string; members: Member[] }

type FamilyBase = {
  id: string
  label: string
  tags?: string[]
  actions?: Action[]
  note?: string
}

export type LadderFamily = FamilyBase & { kind: 'ladder'; rungs: Rung[] }
export type SetFamily = FamilyBase & { kind: 'set'; members: Member[] }
export type CompositeFamily = FamilyBase & { kind: 'composite'; whole: string; parts: Member[] }
export type Family = LadderFamily | SetFamily | CompositeFamily

export type StatePairState = {
  card: string
  role: 'unprocessed' | 'processed'
  actions?: Action[]
  note?: string
}

export type StatePair = {
  id: string
  label: string
  kind: string
  states: StatePairState[]
  note?: string
}

export type RulesetCaveats = { standard?: string[]; extreme?: string[] }

export type Selector = {
  families?: string[]
  familyTags?: string[]
  statePairs?: string[]
  statePairKinds?: string[]
}

/** The five strategies a rules.json entry may declare. `override`, `plain-foil`
 *  and `unresolved` are engine states, not authorable rules. */
export type RuleStrategy = 'state-pair' | 'ladder-down' | 'components' | 'group' | 'npc-hierarchy'

export type Rule = {
  id: string
  strategy: RuleStrategy
  applies: Selector
  grants?: { actions?: 'inherit' | Action[]; productBoundary?: boolean }
  explanation: string
  caveats?: string[]
  rulesetCaveats?: RulesetCaveats
  confidence: 'sourced' | 'contested'
  sources: Source[]
}

export type RulesetDef = {
  label: string
  summary: string
  caveats?: string[]
  confidence: Confidence
  sources: Source[]
}

export type ReplaceOverride = {
  card: string
  mode: 'replace'
  strategy: Exclude<Strategy, 'plain-foil'>
  unlocks?: { card: string; actions?: Action[]; note?: string }[]
  excluded?: string[]
  explanation: string
  caveats?: string[]
  rulesetCaveats?: RulesetCaveats
  confidence: Confidence
  sources: Source[]
}

export type AnnotateOverride = {
  card: string
  mode: 'annotate'
  caveats: string[]
  rulesetCaveats?: RulesetCaveats
  confidence: Confidence
  sources: Source[]
}

export type Override = ReplaceOverride | AnnotateOverride

/** Everything resolve() reads. Injected rather than imported so the engine stays
 *  pure and the tests can build a dataset that exercises a case the shipped data
 *  does not yet contain. */
export type RawData = {
  cards: Card[]
  families: Family[]
  statePairs: StatePair[]
  rulesets: Record<Ruleset, RulesetDef>
  rules: Rule[]
  overrides: Override[]
}
