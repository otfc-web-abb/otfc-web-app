// Phase 3 test cases against the shipped data. Every case listed in the Phase 3
// section of phased_plan.md, including the negative assertions.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shippedData } from './data.ts'
import { UNRESOLVED_EXPLANATION } from './explanation.ts'
import { dataset } from './fixtures.ts'
import { resolve } from './index.ts'
import { createResolver } from './resolve.ts'
import type { Family, Resolution } from './types.ts'

const names = (r: Resolution) => r.unlocks.map((u) => u.card.name)
const excluded = (r: Resolution) => r.excluded.map((c) => c.name)
const actionsFor = (r: Resolution, name: string) =>
  r.unlocks.find((u) => u.card.name === name)?.actions ?? []

const cardNames = new Set(shippedData.cards.map((c) => c.name))

/** A "does not unlock X" assertion is worthless if X is not a card. */
const assertExists = (...cards: string[]) => {
  for (const name of cards) assert.ok(cardNames.has(name), `fixture card '${name}' is missing from cards.json`)
}

const assertNotUnlocked = (r: Resolution, ...cards: string[]) => {
  assertExists(...cards)
  for (const name of cards) {
    assert.ok(!names(r).includes(name), `'${name}' should not be unlocked by a foil ${r.card?.name}`)
  }
}

describe('the brief examples - downward unlocks', () => {
  it('foil Rune full helm unlocks every full helm rune and below', () => {
    const r = resolve('Rune full helm')

    assert.equal(r.strategy, 'ladder-down')
    assert.equal(r.ruleId, 'armour-ladder-down')
    assert.equal(r.confidence, 'sourced')
    assert.deepEqual(names(r), [
      'Bronze full helm',
      'Iron full helm',
      'Steel full helm',
      'Black full helm',
      'White full helm',
      'Mithril full helm',
      'Adamant full helm',
      'Rune full helm',
    ])
    assert.ok(r.unlocks.every((u) => u.actions.includes('wear')))
    assert.equal(r.family?.id, 'full-helm')
  })

  it('does not unlock the tier above, and says so explicitly', () => {
    const r = resolve('Rune full helm')

    assertNotUnlocked(r, 'Dragon full helm')
    assert.deepEqual(excluded(r), ['Gilded full helm', 'Dragon full helm'])
  })

  it('foil Mithril platebody stops at mithril', () => {
    const r = resolve('Mithril platebody')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), [
      'Bronze platebody',
      'Iron platebody',
      'Steel platebody',
      'Black platebody',
      'White platebody',
      'Mithril platebody',
    ])
    assert.deepEqual(excluded(r), [
      'Adamant platebody',
      'Rune platebody',
      'Gilded platebody',
      'Dragon platebody',
    ])
    assertNotUnlocked(r, 'Adamant platebody', 'Rune platebody')
  })

  it('foil Iron platelegs unlocks iron and bronze only', () => {
    const r = resolve('Iron platelegs')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Bronze platelegs', 'Iron platelegs'])
    assert.equal(r.excluded.length, 8)
    assertNotUnlocked(r, 'Steel platelegs', 'Rune platelegs')
  })
})

describe('foil Iron ore - the verb, not the product', () => {
  const r = resolve('Iron ore')

  it('resolves down the ore ladder', () => {
    assert.equal(r.strategy, 'ladder-down')
    assert.equal(r.ruleId, 'resource-ladder-down')
    assert.deepEqual(names(r), ['Copper ore', 'Tin ore', 'Iron ore'])
  })

  it('grants mine and smelt', () => {
    assert.deepEqual(actionsFor(r, 'Iron ore'), ['mine', 'smelt'])
    assert.deepEqual(actionsFor(r, 'Copper ore'), ['mine', 'smelt'])
  })

  it('does NOT grant Iron bar', () => {
    assertNotUnlocked(r, 'Iron bar', 'Bronze bar')
  })

  it('names the product boundary in a caveat', () => {
    const caveat = r.caveats.find((c) => c.includes('Iron bar'))
    assert.ok(caveat, `expected a product-boundary caveat naming Iron bar, got ${JSON.stringify(r.caveats)}`)
    assert.match(caveat, /Smelting/)
    assert.match(caveat, /Bronze bar/)
  })

  it('does not exclude the bars - they are a different ladder, not a tier above', () => {
    assert.ok(!excluded(r).includes('Iron bar'))
    assert.deepEqual(excluded(r), [
      'Silver ore',
      'Coal',
      'Gold ore',
      'Mithril ore',
      'Adamantite ore',
      'Runite ore',
    ])
  })
})

describe('foil Raw trout - the state pair', () => {
  const r = resolve('Raw trout')

  it('resolves as a state pair, not a ladder', () => {
    assert.equal(r.strategy, 'state-pair')
    assert.equal(r.ruleId, 'state-pair-both-states-only')
    assert.equal(r.confidence, 'sourced')
  })

  it('grants the cooked form', () => {
    assert.deepEqual(names(r), ['Raw trout', 'Trout'])
    assert.ok(names(r).includes('Trout'))
  })

  it('does NOT grant lower fish', () => {
    assertNotUnlocked(r, 'Raw shrimps', 'Raw sardine', 'Raw herring', 'Raw anchovies', 'Shrimps', 'Sardine')
  })

  it('does not descend to fish above it either', () => {
    assertNotUnlocked(r, 'Raw salmon', 'Raw lobster', 'Raw shark')
  })
})

describe('foil Grimy guam leaf - the state pair answers alone', () => {
  const r = resolve('Grimy guam leaf')

  it('resolves as a state pair', () => {
    assert.equal(r.strategy, 'state-pair')
    assert.equal(r.ruleId, 'state-pair-both-states-only')
  })

  it('grants the clean form', () => {
    assert.deepEqual(names(r), ['Grimy guam leaf', 'Guam leaf'])
  })

  it('does NOT grant other herbs', () => {
    assertNotUnlocked(r, 'Marrentill', 'Tarromin', 'Ranarr weed', 'Torstol', 'Grimy marrentill')
  })

  // DEC-0026. The herb family is factual ordering with no ladder-down rule on it,
  // so the pair stopped nothing and there is no forfeited descent to report.
  it('does not draw the herb ladder, because no rule would have descended it', () => {
    assert.equal(r.family, undefined)
    assert.deepEqual(r.excluded, [])
  })

  it('resolves the same way from the clean side', () => {
    const clean = resolve('Guam leaf')
    assert.equal(clean.strategy, 'state-pair')
    assert.deepEqual(names(clean), ['Grimy guam leaf', 'Guam leaf'])
  })
})

describe('the bottom of a ladder', () => {
  it('foil Bronze full helm unlocks itself and nothing else', () => {
    const r = resolve('Bronze full helm')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Bronze full helm'])
    assert.equal(r.excluded.length, 9)
    assert.equal(excluded(r)[0], 'Iron full helm')
  })

  it('foil Bronze dagger unlocks itself and nothing else', () => {
    const r = resolve('Bronze dagger')

    assert.deepEqual(names(r), ['Bronze dagger'])
    assertNotUnlocked(r, 'Iron dagger')
  })
})

describe('the plain-foil ruleset', () => {
  it('returns the searched card alone', () => {
    const r = resolve('Rune full helm', 'plain-foil')

    assert.equal(r.strategy, 'plain-foil')
    assert.deepEqual(names(r), ['Rune full helm'])
    assert.deepEqual(r.excluded, [])
    assert.equal(r.confidence, 'contested')
    assert.equal(r.explanation, shippedData.rulesets['plain-foil'].summary)
    assert.ok(r.sources.length > 0)
  })

  it('short-circuits the state pair too', () => {
    const r = resolve('Raw trout', 'plain-foil')

    assert.equal(r.strategy, 'plain-foil')
    assert.deepEqual(names(r), ['Raw trout'])
    assertNotUnlocked(r, 'Trout')
  })

  it('still keeps the factual verbs for the card', () => {
    assert.deepEqual(actionsFor(resolve('Iron ore', 'plain-foil'), 'Iron ore'), ['mine', 'smelt'])
  })
})

// Every shipped family now carries a rule, so this case has to be built. Adding an
// unruled family to `data/` to keep a shipped-data test alive would be inventing
// data to serve a test - fixtures.ts exists for exactly this.
describe('a card with a family but no rule', () => {
  const FAMILY: Family = {
    id: 'trinket',
    label: 'Trinkets',
    kind: 'ladder',
    actions: ['use'],
    rungs: [
      { tier: 'bronze', members: ['Bronze trinket'] },
      { tier: 'iron', members: ['Iron trinket'] },
    ],
  }
  const resolveUnruled = createResolver(
    dataset({ cardNames: ['Bronze trinket', 'Iron trinket'], families: [FAMILY] }),
  )
  const r = resolveUnruled('Iron trinket')

  it('resolves unresolved cleanly', () => {
    assert.equal(r.strategy, 'unresolved')
    assert.deepEqual(r.unlocks, [])
    assert.deepEqual(r.excluded, [])
    assert.equal(r.confidence, 'undecided')
    assert.deepEqual(r.sources, [])
    assert.equal(r.explanation, UNRESOLVED_EXPLANATION)
    assert.equal(r.ruleId, undefined)
  })

  it('still carries the family, so the ladder renders as context', () => {
    assert.equal(r.family?.id, 'trinket')
    assert.equal(r.family?.kind, 'ladder')
    assert.ok((r.family?.rungs?.length ?? 0) > 1)
    assert.ok(r.family?.rungs?.flatMap((g) => g.members).some((c) => c.name === 'Iron trinket'))
  })

  it('claims nothing under any ruleset', () => {
    for (const ruleset of ['standard', 'extreme'] as const) {
      const other = resolveUnruled('Iron trinket', ruleset)
      assert.equal(other.strategy, 'unresolved')
      assert.deepEqual(other.sources, [])
      assert.equal(other.confidence, 'undecided')
    }
  })
})

describe('a Monster card', () => {
  it('falls through npc-hierarchy to unresolved', () => {
    const monster = shippedData.cards.find((c) => c.cats.includes('monster'))!
    const r = resolve(monster.name)

    assert.equal(r.strategy, 'unresolved')
    assert.deepEqual(r.unlocks, [])
  })
})

describe('rulesets', () => {
  it('extreme keeps the unlock set and caps confidence at contested', () => {
    const standard = resolve('Rune full helm', 'standard')
    const extreme = resolve('Rune full helm', 'extreme')

    assert.deepEqual(names(extreme), names(standard))
    assert.deepEqual(excluded(extreme), excluded(standard))
    assert.equal(standard.confidence, 'sourced')
    assert.equal(extreme.confidence, 'contested')
  })

  it('attaches the ruleset caveats', () => {
    const extreme = resolve('Rune full helm', 'extreme')
    for (const caveat of shippedData.rulesets.extreme.caveats ?? []) {
      assert.ok(extreme.caveats.includes(caveat))
    }
  })

  it('round-trips the ruleset onto the resolution', () => {
    for (const ruleset of ['standard', 'extreme', 'plain-foil'] as const) {
      assert.equal(resolve('Rune full helm', ruleset).ruleset, ruleset)
    }
  })

  it('defaults to standard', () => {
    assert.equal(resolve('Rune full helm').ruleset, 'standard')
  })
})

describe('Phase 7 round 1 - cosmetic tiers, DEC-0006', () => {
  it('foil White full helm unlocks white and below, not black', () => {
    const r = resolve('White full helm')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), [
      'Bronze full helm',
      'Iron full helm',
      'Steel full helm',
      'Black full helm',
      'White full helm',
    ])
    assertNotUnlocked(r, 'Mithril full helm', 'Rune full helm')
  })

  it('foil Black full helm does not unlock White', () => {
    const r = resolve('Black full helm')
    assertNotUnlocked(r, 'White full helm')
  })

  it('foil Gilded platebody unlocks gilded and every tier below, down to bronze', () => {
    const r = resolve('Gilded platebody')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), [
      'Bronze platebody',
      'Iron platebody',
      'Steel platebody',
      'Black platebody',
      'White platebody',
      'Mithril platebody',
      'Adamant platebody',
      'Rune platebody',
      'Gilded platebody',
    ])
    assertNotUnlocked(r, 'Dragon platebody')
  })
})

describe('Phase 7 round 1 - dragonhide armour ladder, DEC-0007', () => {
  it('foil Red d\'hide body unlocks red and below, not blue or the god recolours', () => {
    const r = resolve("Red d'hide body")

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ["Green d'hide body", "Blue d'hide body", "Red d'hide body"])
    assertNotUnlocked(r, "Black d'hide body", "Gilded d'hide body", "Bandos d'hide body")
  })
})

describe('Phase 7 round 1 - elemental and combination rune ladders, DEC-0008/0009', () => {
  it('foil Fire rune unlocks every elemental rune below it', () => {
    const r = resolve('Fire rune')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Air rune', 'Mind rune', 'Water rune', 'Earth rune', 'Fire rune'])
    assertNotUnlocked(r, 'Body rune', 'Nature rune')
  })

  it('foil Steam rune unlocks combination runes below it, not elemental runes', () => {
    const r = resolve('Steam rune')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Mist rune', 'Dust rune', 'Mud rune', 'Smoke rune', 'Steam rune'])
    assertNotUnlocked(r, 'Lava rune', 'Water rune', 'Fire rune')
  })
})

describe('Phase 7 round 1 - plank ladder, DEC-0010', () => {
  it('foil Teak plank unlocks teak and below', () => {
    const r = resolve('Teak plank')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Plank', 'Oak plank', 'Teak plank'])
    assertNotUnlocked(r, 'Mahogany plank')
  })
})

describe('Phase 7 round 1 - unenchanted jewellery ladders, DEC-0011', () => {
  it('foil Diamond ring unlocks rings below diamond, not necklaces', () => {
    const r = resolve('Diamond ring')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), [
      'Gold ring',
      'Opal ring',
      'Jade ring',
      'Topaz ring',
      'Sapphire ring',
      'Emerald ring',
      'Ruby ring',
      'Diamond ring',
    ])
    assertNotUnlocked(r, 'Dragonstone ring', 'Zenyte ring', 'Diamond necklace')
  })
})

describe('Phase 7 round 1 - state pairs widened to cut and tan, DEC-0012', () => {
  it('foil Uncut diamond unlocks both states, not other gems', () => {
    const r = resolve('Uncut diamond')

    assert.equal(r.strategy, 'state-pair')
    assert.deepEqual(names(r), ['Uncut diamond', 'Diamond'])
    assertNotUnlocked(r, 'Uncut ruby', 'Ruby', 'Diamond ring')
  })

  it('foil Cowhide unlocks both states, not other hides', () => {
    const r = resolve('Cowhide')

    assert.equal(r.strategy, 'state-pair')
    assert.deepEqual(names(r), ['Cowhide', 'Leather'])
    assertNotUnlocked(r, "Green dragonhide", "Green dragon leather")
  })
})

describe('Phase 7 round 1 - named community sets, DEC-0013', () => {
  it('foil Treasonous ring unlocks the other two wilderness rings', () => {
    const r = resolve('Treasonous ring')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(r.excluded, [])
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Ring of the gods', 'Treasonous ring', 'Tyrannical ring']),
    )
  })

  it('foil Graceful cape unlocks the rest of the outfit, not the crafting kit', () => {
    const r = resolve('Graceful cape')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set([
        'Graceful hood',
        'Graceful top',
        'Graceful legs',
        'Graceful gloves',
        'Graceful boots',
        'Graceful cape',
      ]),
    )
    assertNotUnlocked(r, 'Graceful crafting kit')
  })

  it('3rd age splits into separate groups by combat style', () => {
    const melee = resolve('3rd age platebody')
    assert.equal(melee.strategy, 'group')
    assert.ok(names(melee).includes('3rd age cloak'))
    assertNotUnlocked(melee, '3rd age amulet', '3rd age vambraces', '3rd age axe')
  })

  it('Elite void is its own group, separate from regular Void Knight equipment', () => {
    const r = resolve('Elite void top')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(new Set(names(r)), new Set(['Elite void robe', 'Elite void top']))
    assertNotUnlocked(r, 'Void knight top', 'Void mage helm')
  })
})

describe('Phase 7 round 2 - lockboxes, DEC-0014', () => {
  it('foil Ornate lockbox unlocks the other two, not Forgotten lockbox', () => {
    const r = resolve('Ornate lockbox')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Simple lockbox', 'Elaborate lockbox', 'Ornate lockbox']),
    )
    assertNotUnlocked(r, 'Forgotten lockbox')
  })
})

describe('Phase 7 round 2 - achievement diary reward ladders, DEC-0015', () => {
  it("foil Rada's blessing 3 unlocks 1 through 3, not 4", () => {
    const r = resolve("Rada's blessing 3")

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ["Rada's blessing 1", "Rada's blessing 2", "Rada's blessing 3"])
    assertNotUnlocked(r, "Rada's blessing 4")
  })

  it("foil Varrock armour 4 unlocks the full series", () => {
    const r = resolve('Varrock armour 4')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), [
      'Varrock armour 1',
      'Varrock armour 2',
      'Varrock armour 3',
      'Varrock armour 4',
    ])
  })
})

describe('Phase 7 round 2 - the Barronite mace network, DEC-0016', () => {
  it('foil Barronite guard unlocks the other two components, not the mace', () => {
    const r = resolve('Barronite guard')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Barronite guard', 'Barronite handle', 'Barronite head']),
    )
    assertNotUnlocked(r, 'Barronite mace')
  })

  it('foil Barronite mace unlocks the Ancient/Imcando reward set, not the components', () => {
    const r = resolve('Barronite mace')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set([
        'Barronite mace',
        'Ancient globe',
        'Ancient astroscope',
        'Ancient carcanet',
        'Ancient ledger',
        'Ancient treatise',
        'Imcando hammer',
      ]),
    )
    assertNotUnlocked(r, 'Barronite guard', 'Barronite handle', 'Barronite head')
  })
})

describe('Phase 7 round 2 - Fire and Infernal capes, DEC-0017', () => {
  it('foil Infernal cape unlocks Fire cape below it', () => {
    const r = resolve('Infernal cape')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Fire cape', 'Infernal cape'])
  })

  it('foil Fire cape does not unlock Infernal cape', () => {
    const r = resolve('Fire cape')
    assertNotUnlocked(r, 'Infernal cape')
  })
})

describe('Phase 7 round 2 - small flat community groups, DEC-0018/0019/0020', () => {
  it('foil Seers ring unlocks the other three Fremennik rings', () => {
    const r = resolve('Seers ring')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Berserker ring', 'Archers ring', 'Warrior ring', 'Seers ring']),
    )
  })

  it('foil Fighter torso unlocks the rest of the Barbarian Assault reward set', () => {
    const r = resolve('Fighter torso')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set([
        'Fighter hat',
        'Ranger hat',
        'Healer hat',
        'Runner hat',
        'Fighter torso',
        'Penance skirt',
        'Runner boots',
        'Penance gloves',
      ]),
    )
  })

  it('foil Obsidian platebody unlocks helm and legs, not the cape or Toktz weapons', () => {
    const r = resolve('Obsidian platebody')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Obsidian helmet', 'Obsidian platebody', 'Obsidian platelegs']),
    )
    assertNotUnlocked(r, 'Obsidian cape', 'Toktz-xil-ak')
  })
})

describe('Phase 7 round 2 - Avernic defender joins the ladder, DEC-0021', () => {
  it('foil Avernic defender unlocks the whole ladder down to bronze', () => {
    const r = resolve('Avernic defender')

    assert.equal(r.strategy, 'ladder-down')
    assert.equal(names(r).length, 9)
    assert.deepEqual(names(r)[0], 'Bronze defender')
    assert.deepEqual(names(r).at(-1), 'Avernic defender')
  })

  it('does not unlock Mooleta, despite the wiki grouping it with defenders', () => {
    const r = resolve('Avernic defender')
    assertNotUnlocked(r, 'Mooleta')
  })
})

describe('Phase 7 round 2 - General Graardor, the first boss-group case, DEC-0022/DEC-0036', () => {
  it('foil General Graardor unlocks the boss and all his uniques, including the hilt', () => {
    const r = resolve('General Graardor')

    assert.equal(r.strategy, 'components')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['General Graardor', 'Bandos chestplate', 'Bandos tassets', 'Bandos boots', 'Bandos hilt']),
    )
  })

  it('a foil unique alone unlocks the sibling uniques, not the boss - DEC-0036', () => {
    const r = resolve('Bandos chestplate')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(['Bandos chestplate', 'Bandos tassets', 'Bandos boots', 'Bandos hilt']),
    )
    assertNotUnlocked(r, 'General Graardor')
  })

  it('Saradomin sword unlocks its sibling Zilyana uniques, not Commander Zilyana', () => {
    const r = resolve('Saradomin sword')

    assert.equal(r.strategy, 'group')
    assert.deepEqual(
      new Set(names(r)),
      new Set(["Saradomin sword", "Saradomin's light", 'Armadyl crossbow', 'Saradomin hilt']),
    )
    assertNotUnlocked(r, 'Commander Zilyana')
  })

  it('a godsword hilt still follows DEC-0028, not the boss-uniques group', () => {
    const r = resolve('Bandos hilt')

    assert.equal(r.strategy, 'components')
    assert.deepEqual(new Set(names(r)), new Set(['Bandos hilt', 'Bandos godsword']))
  })
})

describe('Phase 7 round 6 - chromatic dragon lines, DEC-0037', () => {
  it('foil Brutal red dragon unlocks the normal and baby variants too', () => {
    const r = resolve('Brutal red dragon')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(new Set(names(r)), new Set(['Brutal red dragon', 'Red dragon', 'Baby red dragon']))
  })

  it('foil Red dragon unlocks the baby variant but not the brutal one', () => {
    const r = resolve('Red dragon')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(new Set(names(r)), new Set(['Red dragon', 'Baby red dragon']))
    assertNotUnlocked(r, 'Brutal red dragon')
  })

  it('foil Baby black dragon unlocks only itself', () => {
    const r = resolve('Baby black dragon')

    assert.deepEqual(new Set(names(r)), new Set(['Baby black dragon']))
  })
})

describe('an unknown card name', () => {
  it('returns unresolved rather than throwing', () => {
    const r = resolve('Not a real card')

    assert.equal(r.strategy, 'unresolved')
    assert.equal(r.card, null)
    assert.deepEqual(r.unlocks, [])
    assert.equal(r.family, undefined)
  })

  it('survives empty and junk input', () => {
    for (const name of ['', ' ', '__proto__', 'constructor', 'toString', ' ']) {
      assert.equal(resolve(name).strategy, 'unresolved')
    }
  })
})

describe('the sweep', () => {
  const STRATEGIES = new Set([
    'override',
    'state-pair',
    'ladder-down',
    'components',
    'group',
    'npc-hierarchy',
    'plain-foil',
    'unresolved',
  ])
  const CONFIDENCES = new Set(['sourced', 'contested', 'undecided'])

  it('has the expected card universe', () => {
    assert.equal(shippedData.cards.length, 6376)
  })

  for (const ruleset of ['standard', 'extreme', 'plain-foil'] as const) {
    it(`returns a valid Resolution for all 6,376 cards under ${ruleset}`, () => {
      for (const card of shippedData.cards) {
        const r = resolve(card.name, ruleset)

        assert.equal(r.card?.name, card.name)
        assert.equal(r.ruleset, ruleset)
        assert.ok(STRATEGIES.has(r.strategy), `${card.name}: bad strategy '${r.strategy}'`)
        assert.ok(CONFIDENCES.has(r.confidence), `${card.name}: bad confidence '${r.confidence}'`)
        assert.ok(Array.isArray(r.unlocks) && Array.isArray(r.excluded))
        assert.ok(Array.isArray(r.caveats) && Array.isArray(r.sources))
        assert.ok(typeof r.explanation === 'string' && r.explanation.length > 0)
        assert.ok(!r.explanation.includes('{'), `${card.name}: uninterpolated placeholder in explanation`)

        for (const u of r.unlocks) {
          assert.ok(u.card && typeof u.card.name === 'string')
          assert.ok(Array.isArray(u.actions))
        }

        if (r.strategy === 'unresolved') {
          assert.equal(r.unlocks.length, 0, `${card.name}: unresolved must claim no unlocks`)
          assert.equal(r.excluded.length, 0, `${card.name}: unresolved must claim no exclusions`)
          assert.equal(r.sources.length, 0, `${card.name}: unresolved must cite no sources`)
          assert.equal(r.confidence, 'undecided')
        } else {
          assert.ok(r.sources.length > 0, `${card.name}: an answer must carry a source`)
          assert.ok(
            r.unlocks.some((u) => u.card.name === card.name),
            `${card.name}: an answer must unlock the searched card`,
          )
        }
      }
    })
  }

  // DEC-0024 added six utility ladders (+40 cards) and DEC-0025 regrouped the keys
  // by tier (+25). state-pair is unchanged at 190: DEC-0026 altered which ladder a
  // pair reports, never which cards it unlocks.
  // DEC-0028 gave each godsword hilt its own components family (hilt -> hilt +
  // godsword, asymmetric with the godsword -> godsword + hilt + shards + blade of
  // DEC-0027), so the 4 hilts move from unresolved to components alongside the 4
  // godswords: components rises from 4 to 8.
  // DEC-0033 added 27 enchanted-jewellery components families (each enchanted item
  // -> itself + its unenchanted gem base): components rises from 8 to 35, unresolved
  // drops by the same 27.
  // DEC-0032/DEC-0035 added two monster-recolour sets (elemental wizards, metallic
  // dragons) and, at first, three GWD boss-group sets modelled as symmetric groups.
  // DEC-0036 then corrected the boss/unique relationship to asymmetric: each boss
  // (General Graardor, Kree'arra, Commander Zilyana, K'ril Tsutsaroth) becomes a
  // `components` family (boss -> boss + uniques, General Graardor's now including
  // the hilt it was missing), paired with a `group` family of just the uniques
  // (unique -> sibling uniques, not the boss). DEC-0037 added four 3-rung chromatic
  // dragon ladders (red/green/blue/black: baby -> normal -> brutal).
  // Net over DEC-0032/0035/0036/0037: ladder-down 522 -> 534 (+12, the 4 dragon
  // lines), group 139 -> 157, components 8 -> 39 (+31: 27 jewellery + 4 bosses),
  // unresolved 5490 -> 5456.
  // DEC-0038 added ten more bosses under the same shape (Corporeal Beast, Zulrah,
  // Vorkath, Cerberus, Kraken, Thermonuclear smoke devil, Alchemical Hydra,
  // Sarachnis, Callisto/Artio, Venenatis/Spindel, Vet'ion/Calvar'ion - 9 `boss`
  // composites plus their paired `boss-uniques` groups). DEC-0039 added the
  // cross-boss Voidwaker assembly group (also added "Warm gloves" to the existing
  // Pyromancer outfit community set). Net: group 157 -> 210, components 39 -> 53,
  // unresolved 5456 -> 5389.
  // DEC-0040 added five more bosses (Nex, The Nightmare/Phosani's Nightmare,
  // Skotizo, Dawn/Dusk). DEC-0041 added the four Desert Treasure II bosses (Duke
  // Sucellus, The Leviathan, The Whisperer, Vardorvis) plus their cross-boss
  // dt2-shared-drops group. Net: group 210 -> 265, components 53 -> 63, unresolved
  // 5389 -> 5324.
  // DEC-0042 added Zalcano, Scorpia (pet only), Scurrius, and Giant Mole, plus the
  // Long bone/Curved bone pair (kept separate from either boss's uniques since
  // both items drop from most monsters). Net: group 265 -> 274, components 63 ->
  // 67, unresolved 5324 -> 5311.
  // DEC-0043 added Obor, Bryophyta, the three Dagannoth Kings, Chaos Elemental,
  // Kalphite Queen, and King Black Dragon, plus recognised Dragon pickaxe as a
  // real shared unique across nine bosses (added as a composite part only, not a
  // sibling-group member, so it stays unresolved when foiled directly). Net: group
  // 274 -> 281, components 67 -> 75, unresolved 5311 -> 5296.
  // DEC-0044 added the six Barrows brothers, Hespori, and two un-anchored
  // minigame-reward groups (Wintertodt, Tempoross - neither has a boss card).
  // Net: group 281 -> 320, components 75 -> 82, unresolved 5296 -> 5250.
  it('reports the Phase 7 round 5 coverage numbers', () => {
    const counts = new Map<string, number>()
    for (const card of shippedData.cards) {
      const s = resolve(card.name).strategy
      counts.set(s, (counts.get(s) ?? 0) + 1)
    }

    assert.equal(counts.get('ladder-down'), 534)
    assert.equal(counts.get('state-pair'), 190)
    assert.equal(counts.get('group'), 320)
    assert.equal(counts.get('components'), 82)
    assert.equal(counts.get('unresolved'), 5250)
    assert.equal(
      counts.get('ladder-down')! +
        counts.get('state-pair')! +
        counts.get('group')! +
        counts.get('components')!,
      1126,
    )
  })
})
