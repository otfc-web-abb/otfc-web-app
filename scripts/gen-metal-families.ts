// Generates candidate metal-prefix ladder families from cards.json.
//
// Output is a CANDIDATE file for human review, not shipped data. The reviewed
// result is folded into data/families.json by hand - see phased_plan.md Phase 2.
//
// Cosmetic and stat-parallel prefixes (White, Gilded, trimmed (t)/(g), 3rd age)
// are deliberately NOT emitted: rung placement for those is a ruling, deferred
// by DEC-0003.

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CARDS = path.join(ROOT, 'src', 'data', 'cards.json')
const OUT = path.join(ROOT, '.candidates', 'metal-families.json')

// Progression order, lowest first. Factual: attack/defence requirements.
const TIERS = ['bronze', 'iron', 'steel', 'black', 'mithril', 'adamant', 'rune', 'dragon']

interface Card {
  name: string
  cats: string[]
  equipable: boolean
  equipmentSlot: string | null
  options: string[]
}

function tierOf(name: string): { tier: string; base: string } | null {
  for (const tier of TIERS) {
    const prefix = tier[0].toUpperCase() + tier.slice(1) + ' '
    if (name.startsWith(prefix)) return { tier, base: name.slice(prefix.length) }
  }
  return null
}

async function main(): Promise<void> {
  const cards: Card[] = JSON.parse(await readFile(CARDS, 'utf8'))

  const byBase = new Map<string, Map<string, Card>>()

  for (const card of cards) {
    const hit = tierOf(card.name)
    if (!hit) continue
    if (!byBase.has(hit.base)) byBase.set(hit.base, new Map())
    byBase.get(hit.base)!.set(hit.tier, card)
  }

  const families = []
  const singletons: string[] = []

  for (const [base, tiers] of [...byBase].sort(([a], [b]) => a.localeCompare(b))) {
    if (tiers.size < 2) {
      singletons.push(base)
      continue
    }

    const sample = [...tiers.values()][0]
    const slot = sample.equipmentSlot
    const actions = !sample.equipable
      ? ['use']
      : ['weapon', '2h', 'shield', 'ammo'].includes(slot ?? '')
        ? ['wield']
        : ['wear']

    families.push({
      id: base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      label: base[0].toUpperCase() + base.slice(1) + 's',
      kind: 'ladder',
      tags: sample.cats.filter((c) => c === 'armour' || c === 'weapon' || c === 'resource'),
      actions,
      _slot: slot,
      _cats: sample.cats,
      rungs: TIERS.filter((t) => tiers.has(t)).map((tier) => ({
        tier,
        members: [tiers.get(tier)!.name],
      })),
    })
  }

  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify({ families, singletons }, null, 2))

  console.log(`${[...byBase.values()].reduce((n, m) => n + m.size, 0)} metal-prefixed cards`)
  console.log(`${byBase.size} base names, ${families.length} with 2+ tiers`)
  console.log(`Wrote candidates to ${path.relative(ROOT, OUT)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
