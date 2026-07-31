// Generates candidate state pairs (unprocessed/processed) from cards.json.
//
// Output is a CANDIDATE file for human review, not shipped data. The reviewed
// result is folded into data/state-pairs.json by hand - see phased_plan.md Phase 2.
//
// Two traps this handles, both found during review:
//   - "Raw rabbit" pairs with "Cooked rabbit", not with "Rabbit", which is the NPC.
//   - Several raw meats all cook into "Cooked meat". Many-to-one is not a pair,
//     so those are reported separately and left out.

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CARDS = path.join(ROOT, 'src', 'data', 'cards.json')
const OUT = path.join(ROOT, '.candidates', 'state-pairs.json')

interface Card {
  name: string
  cats: string[]
}

const PREFIXES = [
  { prefix: 'Raw ', kind: 'cook', cookedPrefix: 'Cooked ' },
  { prefix: 'Grimy ', kind: 'clean', cookedPrefix: null },
  { prefix: 'Uncut ', kind: 'cut', cookedPrefix: null },
] as const

function capitalise(s: string): string {
  return s[0].toUpperCase() + s.slice(1)
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function main(): Promise<void> {
  const cards: Card[] = JSON.parse(await readFile(CARDS, 'utf8'))
  const byName = new Map(cards.map((c) => [c.name, c]))

  const pairs = []
  const rejected: string[] = []
  const productCounts = new Map<string, number>()

  for (const { prefix, kind, cookedPrefix } of PREFIXES) {
    for (const card of cards) {
      if (!card.name.startsWith(prefix)) continue
      const base = card.name.slice(prefix.length)

      const explicit = cookedPrefix ? byName.get(cookedPrefix + base) : undefined
      const bare = byName.get(capitalise(base))
      const processed = explicit ?? bare

      if (!processed) {
        rejected.push(`${card.name} - no processed form found`)
        continue
      }
      if (processed.cats.includes('monster')) {
        rejected.push(`${card.name} -> ${processed.name} - processed form is a Monster card`)
        continue
      }

      productCounts.set(processed.name, (productCounts.get(processed.name) ?? 0) + 1)
      pairs.push({
        id: slugify(base),
        label: capitalise(base),
        kind,
        states: [
          { card: card.name, role: 'unprocessed' },
          { card: processed.name, role: 'processed' },
        ],
      })
    }
  }

  const manyToOne = pairs.filter((p) => productCounts.get(p.states[1].card)! > 1)
  const kept = pairs.filter((p) => productCounts.get(p.states[1].card) === 1)

  for (const p of manyToOne) {
    rejected.push(`${p.states[0].card} -> ${p.states[1].card} - many raw forms share one product`)
  }

  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify({ statePairs: kept, rejected }, null, 2))

  console.log(`${kept.length} candidate pairs, ${rejected.length} rejected`)
  console.log(`Wrote candidates to ${path.relative(ROOT, OUT)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
