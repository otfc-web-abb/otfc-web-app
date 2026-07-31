// Gate for the data layer. Enforces docs/rules-spec.md section 12 and prints
// the coverage report. Any failure exits non-zero.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'data')
const SCHEMA = path.join(DATA, 'schema')

const errors: string[] = []
const fail = (check: string, detail: string) => errors.push(`[${check}] ${detail}`)

const readJson = async (p: string) => JSON.parse(await readFile(p, 'utf8'))

// --- shapes, kept loose on purpose - the schemas are the contract -------------

type Member = string | { card: string; actions?: string[]; produces?: string; cosmeticOf?: string; note?: string }
type Rung = { tier: string; members: Member[] }
type Family = {
  id: string
  label: string
  kind: 'ladder' | 'set' | 'composite'
  tags?: string[]
  actions?: string[]
  rungs?: Rung[]
  members?: Member[]
  whole?: string
  parts?: Member[]
}
type StatePair = {
  id: string
  label: string
  kind: string
  states: { card: string; role: 'unprocessed' | 'processed' }[]
}
type Selector = {
  families?: string[]
  familyTags?: string[]
  statePairs?: string[]
  statePairKinds?: string[]
}
type Rule = { id: string; strategy: string; applies: Selector; confidence: string }
type Override = {
  card: string
  mode: 'replace' | 'annotate'
  strategy?: string
  confidence: string
  unlocks?: { card: string }[]
  excluded?: string[]
}

const cardOf = (m: Member): string => (typeof m === 'string' ? m : m.card)

const membersOf = (f: Family): Member[] => {
  if (f.kind === 'ladder') return f.rungs!.flatMap((r) => r.members)
  if (f.kind === 'set') return f.members!
  return [f.whole!, ...f.parts!]
}

// --- load --------------------------------------------------------------------

const cards: { name: string }[] = await readJson(path.join(ROOT, 'src', 'data', 'cards.json'))
const cardNames = new Set(cards.map((c) => c.name))

const familiesFile = await readJson(path.join(DATA, 'families.json'))
const statePairsFile = await readJson(path.join(DATA, 'state-pairs.json'))
const rulesFile = await readJson(path.join(DATA, 'rules.json'))
const overridesFile = await readJson(path.join(DATA, 'overrides.json'))

const families: Family[] = familiesFile.families
const statePairs: StatePair[] = statePairsFile.statePairs
const rules: Rule[] = rulesFile.rules
const overrides: Override[] = overridesFile.overrides

const decisionsDoc = await readFile(path.join(ROOT, 'docs', 'decisions.md'), 'utf8')

// --- 1-3: schema -------------------------------------------------------------

const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)

for (const name of ['common', 'families', 'state-pairs', 'rules', 'overrides']) {
  ajv.addSchema(await readJson(path.join(SCHEMA, `${name}.schema.json`)), `${name}.schema.json`)
}

const schemaChecks: [string, unknown, unknown][] = [
  ['families.json', 'families.schema.json', familiesFile],
  ['state-pairs.json', 'state-pairs.schema.json', statePairsFile],
  ['rules.json', 'rules.schema.json', rulesFile],
  ['overrides.json', 'overrides.schema.json', overridesFile],
]

for (const [label, schemaKey, data] of schemaChecks) {
  const validate = ajv.getSchema(schemaKey as string)!
  if (!validate(data)) {
    for (const e of validate.errors ?? []) {
      fail('schema', `${label} ${e.instancePath || '/'} ${e.message}`)
    }
  }
}

// 2 and 3 are schema-enforced (sources minItems 1, ruleConfidence enum), but a
// schema can be edited. Re-check them here so the intent survives that.
for (const r of rules) {
  const sources = (r as unknown as { sources?: unknown[] }).sources
  if (!sources || sources.length === 0) fail('sources', `rule '${r.id}' has no sources`)
  if (r.confidence === 'undecided') fail('confidence', `rule '${r.id}' declares 'undecided'`)
}
for (const o of overrides) {
  const sources = (o as unknown as { sources?: unknown[] }).sources
  if (!sources || sources.length === 0) fail('sources', `override for '${o.card}' has no sources`)
}

// --- 4: every card name exists ----------------------------------------------

const referenced = new Map<string, string>() // card name -> where

const noteCard = (name: string, where: string) => {
  if (!referenced.has(name)) referenced.set(name, where)
}

for (const f of families) {
  for (const m of membersOf(f)) noteCard(cardOf(m), `families.json '${f.id}'`)
  for (const m of membersOf(f)) {
    if (typeof m === 'object') {
      if (m.produces) noteCard(m.produces, `families.json '${f.id}' produces`)
      if (m.cosmeticOf) noteCard(m.cosmeticOf, `families.json '${f.id}' cosmeticOf`)
    }
  }
}
for (const p of statePairs) {
  for (const s of p.states) noteCard(s.card, `state-pairs.json '${p.id}'`)
}
for (const o of overrides) {
  noteCard(o.card, `overrides.json`)
  for (const u of o.unlocks ?? []) noteCard(u.card, `overrides.json '${o.card}' unlocks`)
  for (const c of o.excluded ?? []) noteCard(c, `overrides.json '${o.card}' excluded`)
}

for (const [name, where] of referenced) {
  if (!cardNames.has(name)) fail('card-name', `${where}: '${name}' is not in cards.json`)
}

// --- 5, 6: rule selectors resolve -------------------------------------------

const familyById = new Map(families.map((f) => [f.id, f]))
const pairById = new Map(statePairs.map((p) => [p.id, p]))
const familyTags = new Set(families.flatMap((f) => f.tags ?? []))
const pairKinds = new Set(statePairs.map((p) => p.kind))

for (const r of rules) {
  for (const id of r.applies.families ?? []) {
    if (!familyById.has(id)) fail('selector', `rule '${r.id}' names family '${id}', which does not exist`)
  }
  for (const id of r.applies.statePairs ?? []) {
    if (!pairById.has(id)) fail('selector', `rule '${r.id}' names state pair '${id}', which does not exist`)
  }
  for (const tag of r.applies.familyTags ?? []) {
    if (!familyTags.has(tag)) fail('selector', `rule '${r.id}' names family tag '${tag}', which matches no family`)
  }
  for (const kind of r.applies.statePairKinds ?? []) {
    if (!pairKinds.has(kind)) fail('selector', `rule '${r.id}' names pair kind '${kind}', which matches no pair`)
  }
}

// --- 7: decision sources exist ----------------------------------------------

const sourceBearing: { label: string; sources: { kind: string; decision?: string }[] }[] = [
  ...Object.entries(rulesFile.rulesets).map(([k, v]) => ({ label: `ruleset '${k}'`, sources: (v as { sources: [] }).sources })),
  ...rules.map((r) => ({ label: `rule '${r.id}'`, sources: (r as unknown as { sources: [] }).sources })),
  ...overrides.map((o) => ({ label: `override '${o.card}'`, sources: (o as unknown as { sources: [] }).sources })),
]

for (const { label, sources } of sourceBearing) {
  for (const s of sources ?? []) {
    if (s.kind !== 'decision') continue
    if (!s.decision || !decisionsDoc.includes(`### ${s.decision} `)) {
      fail('decision', `${label} cites ${s.decision ?? '(none)'}, which is not in docs/decisions.md`)
    }
  }
}

// --- 8, 9, 10: structure -----------------------------------------------------

const seen = (label: string, ids: string[]) => {
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  for (const d of new Set(dupes)) fail('duplicate-id', `${label}: '${d}' appears more than once`)
}

seen('families.json', families.map((f) => f.id))
seen('state-pairs.json', statePairs.map((p) => p.id))
seen('rules.json', rules.map((r) => r.id))

for (const f of families) {
  if (f.kind !== 'ladder') continue
  const names = f.rungs!.flatMap((r) => r.members).map(cardOf)
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  for (const d of new Set(dupes)) fail('ladder', `family '${f.id}': '${d}' appears on more than one rung`)

  const tiers = f.rungs!.map((r) => r.tier)
  const tierDupes = tiers.filter((t, i) => tiers.indexOf(t) !== i)
  for (const d of new Set(tierDupes)) fail('ladder', `family '${f.id}': tier '${d}' is not unique`)
}

// --- resolution, shared by check 11 and the coverage report -------------------

const STRATEGY_ORDER = ['state-pair', 'ladder-down', 'components', 'group', 'npc-hierarchy'] as const
const KIND_FOR_STRATEGY: Record<string, Family['kind'] | null> = {
  'state-pair': null,
  'ladder-down': 'ladder',
  components: 'composite',
  group: 'set',
  'npc-hierarchy': null,
}

const familiesByCard = new Map<string, Family[]>()
for (const f of families) {
  for (const m of membersOf(f)) {
    const name = cardOf(m)
    if (!familiesByCard.has(name)) familiesByCard.set(name, [])
    familiesByCard.get(name)!.push(f)
  }
}

const pairsByCard = new Map<string, StatePair[]>()
for (const p of statePairs) {
  for (const s of p.states) {
    if (!pairsByCard.has(s.card)) pairsByCard.set(s.card, [])
    pairsByCard.get(s.card)!.push(p)
  }
}

/** Rules matching this card at this strategy, with their specificity. */
function matchesAt(card: string, strategy: string): { rule: Rule; explicit: boolean }[] {
  const out: { rule: Rule; explicit: boolean }[] = []

  for (const rule of rules) {
    if (rule.strategy !== strategy) continue

    if (strategy === 'state-pair') {
      const pairs = pairsByCard.get(card) ?? []
      if (rule.applies.statePairs?.some((id) => pairs.some((p) => p.id === id))) {
        out.push({ rule, explicit: true })
      } else if (rule.applies.statePairKinds?.some((k) => pairs.some((p) => p.kind === k))) {
        out.push({ rule, explicit: false })
      }
      continue
    }

    const kind = KIND_FOR_STRATEGY[strategy]
    // A composite family only fires for its `whole` - a card that is merely one of
    // its `parts` is not a candidate. Mirrors src/rules/match.ts matchFamily, which
    // filters the same way; a card can legitimately be the whole of one composite
    // family and a part of another (godsword hilts and godswords, DEC-0027/0028).
    const inKind = (familiesByCard.get(card) ?? [])
      .filter((f) => f.kind === kind)
      .filter((f) => (f.kind === 'composite' ? f.whole === card : true))
    if (rule.applies.families?.some((id) => inKind.some((f) => f.id === id))) {
      out.push({ rule, explicit: true })
    } else if (rule.applies.familyTags?.some((t) => inKind.some((f) => (f.tags ?? []).includes(t)))) {
      out.push({ rule, explicit: false })
    }
  }

  return out
}

/** Winning rule at a strategy, or null. Explicit beats broad - spec 7.1. */
function winnerAt(card: string, strategy: string): Rule | null {
  const hits = matchesAt(card, strategy)
  if (hits.length === 0) return null
  const explicit = hits.filter((h) => h.explicit)
  const contenders = explicit.length > 0 ? explicit : hits
  return contenders[0].rule
}

// --- 11: no ambiguous match --------------------------------------------------

for (const card of cardNames) {
  for (const strategy of STRATEGY_ORDER) {
    const hits = matchesAt(card, strategy)
    for (const explicit of [true, false]) {
      const tier = hits.filter((h) => h.explicit === explicit)
      if (tier.length > 1) {
        fail(
          'ambiguous',
          `'${card}' matches ${tier.length} rules at strategy '${strategy}' with equal specificity: ${tier.map((h) => h.rule.id).join(', ')}`
        )
      }
    }
  }
}

// --- 12: annotate overrides never raise confidence ---------------------------

const RANK: Record<string, number> = { undecided: 0, contested: 1, sourced: 2 }

for (const o of overrides) {
  if (o.mode !== 'annotate') continue
  let resolved: string | null = null
  for (const strategy of STRATEGY_ORDER) {
    const rule = winnerAt(o.card, strategy)
    if (rule) {
      resolved = rule.confidence
      break
    }
  }
  const base = resolved ?? 'undecided'
  if (RANK[o.confidence] > RANK[base]) {
    fail('annotate', `override for '${o.card}' declares '${o.confidence}' over a '${base}' resolution`)
  }
}

// --- TheSeahorsie's four ladders reproduce exactly ---------------------------

const SEAHORSIE: Record<string, string[]> = {
  shortbow: ['3rd age bow', 'Magic shortbow', 'Yew shortbow', 'Maple shortbow', 'Willow shortbow', 'Oak shortbow', 'Shortbow'],
  longbow: ['Magic longbow', 'Yew longbow', 'Maple longbow', 'Willow longbow', 'Oak longbow', 'Longbow'],
  pickaxe: ['Crystal pickaxe', '3rd age pickaxe', 'Dragon pickaxe', 'Gilded pickaxe', 'Rune pickaxe', 'Adamant pickaxe', 'Mithril pickaxe', 'Black pickaxe', 'Steel pickaxe', 'Iron pickaxe', 'Bronze pickaxe'],
  axe: ['Crystal axe', '3rd age axe', 'Dragon axe', 'Gilded axe', 'Rune axe', 'Adamant axe', 'Mithril axe', 'Black axe', 'Steel axe', 'Iron axe', 'Bronze axe'],
}

for (const [id, highestFirst] of Object.entries(SEAHORSIE)) {
  const f = familyById.get(id)
  if (!f || f.kind !== 'ladder') {
    fail('seahorsie', `family '${id}' is missing or is not a ladder`)
    continue
  }
  const actual = f.rungs!.flatMap((r) => r.members).map(cardOf).reverse()
  if (actual.join(' > ') !== highestFirst.join(' > ')) {
    fail('seahorsie', `family '${id}' does not reproduce the source ladder\n    source: ${highestFirst.join(' > ')}\n    actual: ${actual.join(' > ')}`)
  }
}

// --- report ------------------------------------------------------------------

if (errors.length > 0) {
  console.error(`validate-rules FAILED - ${errors.length} problem(s):\n`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}

const overrideByCard = new Map(overrides.filter((o) => o.mode === 'replace').map((o) => [o.card, o]))
const counts = new Map<string, number>()
const bump = (s: string) => counts.set(s, (counts.get(s) ?? 0) + 1)

for (const card of cardNames) {
  const replaced = overrideByCard.get(card)
  if (replaced) {
    bump(replaced.strategy === 'unresolved' ? 'unresolved' : 'override')
    continue
  }
  const hit = STRATEGY_ORDER.find((s) => winnerAt(card, s))
  bump(hit ?? 'unresolved')
}

const total = cards.length
const resolved = total - (counts.get('unresolved') ?? 0)
const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`

console.log('validate-rules OK\n')
console.log(`  ${families.length} families, ${statePairs.length} state pairs, ${rules.length} rules, ${overrides.length} overrides`)
console.log(`  ${referenced.size} distinct card names referenced, all present in cards.json\n`)
console.log('  Coverage under the standard ruleset:')
for (const [strategy, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${strategy.padEnd(14)} ${String(n).padStart(5)}  ${pct(n)}`)
}
console.log(`    ${'-'.repeat(14)} ${'-'.repeat(5)}`)
console.log(`    ${'resolved'.padEnd(14)} ${String(resolved).padStart(5)}  ${pct(resolved)}`)
console.log(`    ${'total'.padEnd(14)} ${String(total).padStart(5)}`)
