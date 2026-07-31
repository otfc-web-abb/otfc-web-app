// Resolution order and the strategies the curated data does not reach yet, run
// against synthetic datasets. See fixtures.ts for why these are not in data/.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  BRIEF,
  FISH_LADDER,
  FISH_NAMES,
  LADDER_RULE,
  STATE_PAIR_RULE,
  TROUT_PAIR,
  dataset,
} from './fixtures.ts'
import { createResolver } from './resolve.ts'
import type { Resolution } from './types.ts'

const names = (r: Resolution) => r.unlocks.map((u) => u.card.name)
const excluded = (r: Resolution) => r.excluded.map((c) => c.name)

describe('state-pair beats ladder-down', () => {
  const both = createResolver(
    dataset({
      cardNames: FISH_NAMES,
      families: [FISH_LADDER],
      statePairs: [TROUT_PAIR],
      rules: [LADDER_RULE, STATE_PAIR_RULE],
    }),
  )

  // Without this the precedence assertion below proves nothing: it has to be true
  // that the ladder rule really would have fired and really would have descended.
  const ladderOnly = createResolver(
    dataset({
      cardNames: FISH_NAMES,
      families: [FISH_LADDER],
      statePairs: [TROUT_PAIR],
      rules: [LADDER_RULE],
    }),
  )

  it('the ladder rule alone would descend to the fish below', () => {
    const r = ladderOnly('Raw trout')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Raw shrimps', 'Raw trout'])
  })

  it('but with both rules present the pair wins', () => {
    const r = both('Raw trout')

    assert.equal(r.strategy, 'state-pair')
    assert.equal(r.ruleId, 'state-pair-both-states-only')
    assert.deepEqual(names(r), ['Raw trout', 'Trout'])
  })

  it('so the descent stops - Raw shrimps stays locked', () => {
    assert.ok(!names(both('Raw trout')).includes('Raw shrimps'))
  })

  it('and the stopped ladder is reported as excluded, above and below', () => {
    assert.deepEqual(excluded(both('Raw trout')), ['Raw shrimps', 'Raw salmon'])
  })

  it('a laddered card with no state pair still descends', () => {
    const r = both('Raw salmon')

    assert.equal(r.strategy, 'ladder-down')
    assert.deepEqual(names(r), ['Raw shrimps', 'Raw trout', 'Raw salmon'])
  })
})

describe('the product boundary', () => {
  const resolve = createResolver(
    dataset({ cardNames: FISH_NAMES, families: [FISH_LADDER], rules: [LADDER_RULE] }),
  )

  it('fires when a granted transformation produces a card outside the unlock set', () => {
    const caveat = resolve('Raw trout').caveats.find((c) => c.includes('separate card'))

    assert.ok(caveat)
    assert.match(caveat, /Shrimps and Trout/)
  })

  it('stays silent when the product is already unlocked', () => {
    const pairOnly = createResolver(
      dataset({ cardNames: FISH_NAMES, statePairs: [TROUT_PAIR], rules: [STATE_PAIR_RULE] }),
    )
    const r = pairOnly('Raw trout')

    assert.deepEqual(names(r), ['Raw trout', 'Trout'])
    assert.ok(r.unlocks.some((u) => u.actions.includes('cook')))
    assert.ok(!r.caveats.some((c) => c.includes('separate card')))
  })

  it('can be forced off by a rule', () => {
    const quiet = createResolver(
      dataset({
        cardNames: FISH_NAMES,
        families: [FISH_LADDER],
        rules: [{ ...LADDER_RULE, grants: { productBoundary: false } }],
      }),
    )

    assert.ok(!quiet('Raw trout').caveats.some((c) => c.includes('separate card')))
  })

  it('uses generic wording when the family records no product', () => {
    const unnamed = createResolver(
      dataset({
        cardNames: ['Bronze bar', 'Iron bar'],
        families: [
          {
            id: 'bar',
            label: 'Bars',
            kind: 'ladder',
            tags: ['resource'],
            actions: ['smith'],
            rungs: [
              { tier: 'bronze', members: ['Bronze bar'] },
              { tier: 'iron', members: ['Iron bar'] },
            ],
          },
        ],
        rules: [LADDER_RULE],
      }),
    )
    const caveat = unnamed('Iron bar').caveats.find((c) => c.includes('separate card'))

    assert.ok(caveat)
    assert.match(caveat, /Smithing is granted here, but whatever comes out/)
  })
})

describe('grants.actions', () => {
  it('narrows the inherited verb set when a rule says so', () => {
    const resolve = createResolver(
      dataset({
        cardNames: FISH_NAMES,
        families: [FISH_LADDER],
        rules: [{ ...LADDER_RULE, grants: { actions: ['catch'] } }],
      }),
    )

    assert.ok(resolve('Raw trout').unlocks.every((u) => u.actions.join() === 'catch'))
  })
})

describe('components', () => {
  const COMPOSITE = dataset({
    cardNames: ['Slayer helmet', 'Black mask', 'Spiny helmet', 'Facemask'],
    families: [
      {
        id: 'slayer-helmet',
        label: 'Slayer helmet',
        kind: 'composite',
        tags: ['breakable'],
        actions: ['wear'],
        whole: 'Slayer helmet',
        parts: ['Black mask', 'Spiny helmet', 'Facemask'],
      },
    ],
    rules: [
      {
        id: 'components-rule',
        strategy: 'components',
        applies: { familyTags: ['breakable'] },
        explanation: '{card} breaks into {count} cards.',
        confidence: 'sourced',
        sources: BRIEF,
      },
    ],
  })

  it('unlocks the whole and its parts', () => {
    const r = createResolver(COMPOSITE)('Slayer helmet')

    assert.equal(r.strategy, 'components')
    assert.deepEqual(names(r), ['Slayer helmet', 'Black mask', 'Spiny helmet', 'Facemask'])
    assert.deepEqual(r.excluded, [])
    assert.equal(r.explanation, 'Slayer helmet breaks into 4 cards.')
  })

  it('does not fire from a part', () => {
    const r = createResolver(COMPOSITE)('Black mask')

    assert.equal(r.strategy, 'unresolved')
    assert.equal(r.family?.id, 'slayer-helmet')
  })
})

describe('group', () => {
  it('unlocks every member of an unordered set, with nothing excluded', () => {
    const resolve = createResolver(
      dataset({
        cardNames: ['Ring of the gods', 'Tyrannical ring', 'Treasonous ring'],
        families: [
          {
            id: 'wilderness-rings',
            label: 'Wilderness rings',
            kind: 'set',
            tags: ['group'],
            actions: ['wear'],
            members: ['Ring of the gods', 'Tyrannical ring', 'Treasonous ring'],
          },
        ],
        rules: [
          {
            id: 'group-rule',
            strategy: 'group',
            applies: { familyTags: ['group'] },
            explanation: '{card} unlocks the whole of {family}.',
            confidence: 'sourced',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Tyrannical ring')

    assert.equal(r.strategy, 'group')
    assert.equal(r.unlocks.length, 3)
    assert.deepEqual(r.excluded, [])
    assert.equal(r.explanation, 'Tyrannical ring unlocks the whole of Wilderness rings.')
  })
})

describe('npc-hierarchy', () => {
  it('never matches, so a monster falls through to unresolved', () => {
    const resolve = createResolver(
      dataset({
        cardNames: ['Kalphite Queen', 'Kalphite Worker'],
        families: [
          {
            id: 'kalphites',
            label: 'Kalphites',
            kind: 'set',
            tags: ['npc'],
            actions: ['use'],
            members: ['Kalphite Queen', 'Kalphite Worker'],
          },
        ],
        rules: [
          {
            id: 'npc-rule',
            strategy: 'npc-hierarchy',
            applies: { familyTags: ['npc'] },
            explanation: 'Never reached.',
            confidence: 'sourced',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Kalphite Queen')

    assert.equal(r.strategy, 'unresolved')
    assert.deepEqual(r.unlocks, [])
    assert.equal(r.family?.id, 'kalphites')
  })
})

describe('tie-breaks - spec 7.1', () => {
  it('an explicit family id beats a broad tag', () => {
    const resolve = createResolver(
      dataset({
        cardNames: FISH_NAMES,
        families: [FISH_LADDER],
        rules: [
          LADDER_RULE,
          { ...LADDER_RULE, id: 'fish-explicit', applies: { families: ['fish'] } },
        ],
      }),
    )

    assert.equal(resolve('Raw salmon').ruleId, 'fish-explicit')
  })

  it('an explicit state-pair id beats a broad kind', () => {
    const resolve = createResolver(
      dataset({
        cardNames: FISH_NAMES,
        statePairs: [TROUT_PAIR],
        rules: [
          STATE_PAIR_RULE,
          { ...STATE_PAIR_RULE, id: 'trout-explicit', applies: { statePairs: ['trout'] } },
        ],
      }),
    )

    assert.equal(resolve('Raw trout').ruleId, 'trout-explicit')
  })
})

describe('overrides', () => {
  const base = {
    cardNames: FISH_NAMES,
    families: [FISH_LADDER],
    statePairs: [TROUT_PAIR],
    rules: [LADDER_RULE, STATE_PAIR_RULE],
  }

  it('a replace override answers the card outright', () => {
    const resolve = createResolver(
      dataset({
        ...base,
        overrides: [
          {
            card: 'Raw trout',
            mode: 'replace',
            strategy: 'override',
            unlocks: [{ card: 'Raw trout', actions: ['catch'] }],
            excluded: ['Raw salmon'],
            explanation: 'Trout is special.',
            confidence: 'contested',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Raw trout')

    assert.equal(r.strategy, 'override')
    assert.deepEqual(names(r), ['Raw trout'])
    assert.deepEqual(excluded(r), ['Raw salmon'])
    assert.equal(r.explanation, 'Trout is special.')
    assert.equal(r.confidence, 'contested')
  })

  it('a replace override can refuse deliberately', () => {
    const resolve = createResolver(
      dataset({
        ...base,
        overrides: [
          {
            card: 'Raw trout',
            mode: 'replace',
            strategy: 'unresolved',
            unlocks: [],
            explanation: 'The family rule over-reaches here.',
            confidence: 'undecided',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Raw trout')

    assert.equal(r.strategy, 'unresolved')
    assert.deepEqual(r.unlocks, [])
    assert.deepEqual(r.excluded, [])
    assert.equal(r.confidence, 'undecided')
    assert.equal(r.explanation, 'The family rule over-reaches here.')
  })

  it('an annotate override adds caveats and lowers confidence', () => {
    const resolve = createResolver(
      dataset({
        ...base,
        overrides: [
          {
            card: 'Raw trout',
            mode: 'annotate',
            caveats: ['Disputed in the Discord.'],
            confidence: 'contested',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Raw trout')

    assert.equal(r.strategy, 'state-pair')
    assert.equal(r.confidence, 'contested')
    assert.ok(r.caveats.includes('Disputed in the Discord.'))
  })

  it('plain-foil is checked before the override', () => {
    const resolve = createResolver(
      dataset({
        ...base,
        overrides: [
          {
            card: 'Raw trout',
            mode: 'replace',
            strategy: 'override',
            unlocks: [{ card: 'Raw salmon' }],
            explanation: 'Should not be reached under plain-foil.',
            confidence: 'sourced',
            sources: BRIEF,
          },
        ],
      }),
    )
    const r = resolve('Raw trout', 'plain-foil')

    assert.equal(r.strategy, 'plain-foil')
    assert.deepEqual(names(r), ['Raw trout'])
  })
})

describe('confidence composition - lowest wins', () => {
  const contestedRule = { ...LADDER_RULE, confidence: 'contested' as const }

  it('a contested rule under a sourced ruleset is contested', () => {
    const resolve = createResolver(
      dataset({ cardNames: FISH_NAMES, families: [FISH_LADDER], rules: [contestedRule] }),
    )

    assert.equal(resolve('Raw salmon', 'standard').confidence, 'contested')
  })

  it('a sourced rule under a contested ruleset is contested', () => {
    const resolve = createResolver(
      dataset({ cardNames: FISH_NAMES, families: [FISH_LADDER], rules: [LADDER_RULE] }),
    )

    assert.equal(resolve('Raw salmon', 'standard').confidence, 'sourced')
    assert.equal(resolve('Raw salmon', 'extreme').confidence, 'contested')
  })
})

describe('purity', () => {
  it('two resolvers over the same data agree, and repeat calls are identical', () => {
    const raw = dataset({
      cardNames: FISH_NAMES,
      families: [FISH_LADDER],
      statePairs: [TROUT_PAIR],
      rules: [LADDER_RULE, STATE_PAIR_RULE],
    })
    const a = createResolver(raw)
    const b = createResolver(raw)

    assert.deepEqual(a('Raw trout'), b('Raw trout'))
    assert.deepEqual(a('Raw trout'), a('Raw trout'))
  })

  it('does not mutate the dataset it was given', () => {
    const raw = dataset({
      cardNames: FISH_NAMES,
      families: [FISH_LADDER],
      statePairs: [TROUT_PAIR],
      rules: [LADDER_RULE, STATE_PAIR_RULE],
    })
    const before = JSON.stringify(raw)
    const resolve = createResolver(raw)

    for (const name of FISH_NAMES) {
      for (const ruleset of ['standard', 'extreme', 'plain-foil'] as const) resolve(name, ruleset)
    }

    assert.equal(JSON.stringify(raw), before)
  })
})
