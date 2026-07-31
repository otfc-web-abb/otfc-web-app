// Indexes the four data files once so resolve() is a lookup rather than a scan.

import type {
  Action,
  AnnotateOverride,
  Card,
  Family,
  FamilyContext,
  LadderFamily,
  Member,
  RawData,
  ReplaceOverride,
  Rule,
  RulesetDef,
  Ruleset,
  StatePair,
} from './types.ts'

export type Dataset = {
  cardsByName: Map<string, Card>
  families: Family[]
  familyById: Map<string, Family>
  familiesByCard: Map<string, Family[]>
  laddersByCard: Map<string, LadderFamily[]>
  statePairsByCard: Map<string, StatePair[]>
  rules: Rule[]
  rulesets: Record<Ruleset, RulesetDef>
  replaceByCard: Map<string, ReplaceOverride>
  annotateByCard: Map<string, AnnotateOverride[]>
  /** Card -> what a transformation verb turns it into, where the family records it. */
  producesByCard: Map<string, string>
  /** Card -> the verbs the factual data says it supports. */
  actionsByCard: Map<string, Action[]>
}

export const cardOf = (m: Member): string => (typeof m === 'string' ? m : m.card)

export const membersOf = (f: Family): Member[] => {
  if (f.kind === 'ladder') return f.rungs.flatMap((r) => r.members)
  if (f.kind === 'set') return f.members
  return [f.whole, ...f.parts]
}

/** Verbs for one member: its own override, else the family default. */
export const memberActions = (f: Family, m: Member): Action[] =>
  (typeof m === 'string' ? undefined : m.actions) ?? f.actions ?? []

const push = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
  const bucket = map.get(key)
  if (bucket) bucket.push(value)
  else map.set(key, [value])
}

const union = (a: Action[], b: Action[]): Action[] => [...new Set([...a, ...b])]

export function buildDataset(raw: RawData): Dataset {
  const cardsByName = new Map(raw.cards.map((c) => [c.name, c]))
  const familyById = new Map(raw.families.map((f) => [f.id, f]))

  const familiesByCard = new Map<string, Family[]>()
  const laddersByCard = new Map<string, LadderFamily[]>()
  const producesByCard = new Map<string, string>()
  const actionsByCard = new Map<string, Action[]>()

  for (const f of raw.families) {
    for (const m of membersOf(f)) {
      const name = cardOf(m)
      push(familiesByCard, name, f)
      if (f.kind === 'ladder') push(laddersByCard, name, f)
      if (typeof m === 'object' && m.produces) producesByCard.set(name, m.produces)
      actionsByCard.set(name, union(actionsByCard.get(name) ?? [], memberActions(f, m)))
    }
  }

  const statePairsByCard = new Map<string, StatePair[]>()
  for (const p of raw.statePairs) {
    for (const s of p.states) {
      push(statePairsByCard, s.card, p)
      actionsByCard.set(s.card, union(actionsByCard.get(s.card) ?? [], s.actions ?? []))
    }
  }

  const replaceByCard = new Map<string, ReplaceOverride>()
  const annotateByCard = new Map<string, AnnotateOverride[]>()
  for (const o of raw.overrides) {
    if (o.mode === 'replace') replaceByCard.set(o.card, o)
    else push(annotateByCard, o.card, o)
  }

  return {
    cardsByName,
    families: raw.families,
    familyById,
    familiesByCard,
    laddersByCard,
    statePairsByCard,
    rules: raw.rules,
    rulesets: raw.rulesets,
    replaceByCard,
    annotateByCard,
    producesByCard,
    actionsByCard,
  }
}

/** A card name that is not in cards.json is dropped rather than faked. Validation
 *  rule 4 means this cannot happen with valid data. */
export const toCards = (d: Dataset, names: string[]): Card[] =>
  names.map((n) => d.cardsByName.get(n)).filter((c): c is Card => c !== undefined)

export function familyContext(d: Dataset, f: Family): FamilyContext {
  const base = { id: f.id, label: f.label, kind: f.kind, note: f.note }
  if (f.kind === 'ladder') {
    return {
      ...base,
      rungs: f.rungs.map((r) => ({ tier: r.tier, members: toCards(d, r.members.map(cardOf)) })),
    }
  }
  if (f.kind === 'set') return { ...base, members: toCards(d, f.members.map(cardOf)) }
  return {
    ...base,
    whole: d.cardsByName.get(f.whole),
    members: toCards(d, f.parts.map(cardOf)),
  }
}
