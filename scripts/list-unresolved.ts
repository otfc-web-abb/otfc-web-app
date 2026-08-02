// Temporary helper: lists unresolved non-monster cards alphabetically.
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'data')
const readJson = async (p: string) => JSON.parse(await readFile(p, 'utf8'))

type Member = string | { card: string; actions?: string[]; produces?: string; cosmeticOf?: string; note?: string }
type Rung = { tier: string; members: Member[] }
type Family = {
  id: string; label: string; kind: 'ladder' | 'set' | 'composite'
  tags?: string[]; actions?: string[]; rungs?: Rung[]; members?: Member[]; whole?: string; parts?: Member[]
}
type StatePair = { id: string; label: string; kind: string; states: { card: string; role: string }[] }
type Selector = { families?: string[]; familyTags?: string[]; statePairs?: string[]; statePairKinds?: string[] }
type Rule = { id: string; strategy: string; applies: Selector; confidence: string }
type Override = { card: string; mode: 'replace' | 'annotate'; strategy?: string }

const cardOf = (m: Member): string => (typeof m === 'string' ? m : m.card)
const membersOf = (f: Family): Member[] => {
  if (f.kind === 'ladder') return f.rungs!.flatMap((r) => r.members)
  if (f.kind === 'set') return f.members!
  return [f.whole!, ...f.parts!]
}

const cards: { name: string; cats?: string[] }[] = await readJson(path.join(ROOT, 'src', 'data', 'cards.json'))
const families: Family[] = (await readJson(path.join(DATA, 'families.json'))).families
const statePairs: StatePair[] = (await readJson(path.join(DATA, 'state-pairs.json'))).statePairs
const rules: Rule[] = (await readJson(path.join(DATA, 'rules.json'))).rules
const overrides: Override[] = (await readJson(path.join(DATA, 'overrides.json'))).overrides

const STRATEGY_ORDER = ['state-pair', 'ladder-down', 'components', 'group', 'npc-hierarchy'] as const
const KIND_FOR_STRATEGY: Record<string, Family['kind'] | null> = {
  'state-pair': null, 'ladder-down': 'ladder', components: 'composite', group: 'set', 'npc-hierarchy': null,
}

const familiesByCard = new Map<string, Family[]>()
for (const f of families) for (const m of membersOf(f)) {
  const name = cardOf(m)
  if (!familiesByCard.has(name)) familiesByCard.set(name, [])
  familiesByCard.get(name)!.push(f)
}
const pairsByCard = new Map<string, StatePair[]>()
for (const p of statePairs) for (const s of p.states) {
  if (!pairsByCard.has(s.card)) pairsByCard.set(s.card, [])
  pairsByCard.get(s.card)!.push(p)
}

function matchesAt(card: string, strategy: string) {
  const out: { rule: Rule; explicit: boolean }[] = []
  for (const rule of rules) {
    if (rule.strategy !== strategy) continue
    if (strategy === 'state-pair') {
      const pairs = pairsByCard.get(card) ?? []
      if (rule.applies.statePairs?.some((id) => pairs.some((p) => p.id === id))) out.push({ rule, explicit: true })
      else if (rule.applies.statePairKinds?.some((k) => pairs.some((p) => p.kind === k))) out.push({ rule, explicit: false })
      continue
    }
    const kind = KIND_FOR_STRATEGY[strategy]
    const inKind = (familiesByCard.get(card) ?? []).filter((f) => f.kind === kind).filter((f) => (f.kind === 'composite' ? f.whole === card : true))
    if (rule.applies.families?.some((id) => inKind.some((f) => f.id === id))) out.push({ rule, explicit: true })
    else if (rule.applies.familyTags?.some((t) => inKind.some((f) => (f.tags ?? []).includes(t)))) out.push({ rule, explicit: false })
  }
  return out
}
function winnerAt(card: string, strategy: string): Rule | null {
  const hits = matchesAt(card, strategy)
  if (hits.length === 0) return null
  const explicit = hits.filter((h) => h.explicit)
  return (explicit.length > 0 ? explicit : hits)[0].rule
}

const overrideByCard = new Map(overrides.filter((o) => o.mode === 'replace').map((o) => [o.card, o]))

const nonMonster = cards.filter((c) => !(c.cats ?? []).includes('monster'))
const unresolved = nonMonster.filter((c) => {
  if (overrideByCard.has(c.name)) return overrideByCard.get(c.name)!.strategy === 'unresolved'
  return !STRATEGY_ORDER.some((s) => winnerAt(c.name, s))
}).map((c) => c.name).sort((a, b) => a.localeCompare(b))

console.log(`non-monster total: ${nonMonster.length}, unresolved: ${unresolved.length}`)
const offset = Number(process.argv[2] ?? 0)
const limit = Number(process.argv[3] ?? 50)
console.log(unresolved.slice(offset, offset + limit).join('\n'))
