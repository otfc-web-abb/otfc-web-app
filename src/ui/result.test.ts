// Phase 5's gate: every Phase 3 test case has to render, and render the right
// thing. These assert against the markup renderResult() produces, so a change that
// silently stops marking locked tiers - the whole point of the ladder visual -
// fails here rather than in a screenshot nobody takes.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shippedData } from '../rules/data.ts'
import { resolve } from '../rules/index.ts'
import type { Resolution } from '../rules/index.ts'
import { GUIDELINE_LINE } from './copy.ts'
import { esc } from './html.ts'
import { renderLadder } from './ladder.ts'
import { renderResult, renderUnresolved as renderUnresolvedForTest } from './result.ts'

/** A card that reaches `unresolved`: no family, no rule, nothing claimed. */
const UNRESOLVED_CARD = shippedData.cards.find((c) => c.cats.includes('monster'))!.name

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1

const unlockedRows = (html: string): number => count(html, 'ladder__member--unlocked')
const lockedRows = (html: string): number => count(html, 'ladder__member--locked')
const contextRows = (html: string): number => count(html, 'ladder__member--context')

describe('every screen carries the standing furniture', () => {
  const cases: [string, Parameters<typeof renderResult>[1]][] = [
    ['Rune full helm', 'standard'],
    ['Iron ore', 'standard'],
    ['Raw trout', 'standard'],
    ['Grimy guam leaf', 'standard'],
    ['Bronze dagger', 'standard'],
    [UNRESOLVED_CARD, 'standard'],
    ['Rune full helm', 'plain-foil'],
    ['Rune full helm', 'extreme'],
    ['Not a real card', 'standard'],
  ]

  for (const [name, ruleset] of cases) {
    it(`${name} / ${ruleset} shows the guideline line and the ruleset toggle`, () => {
      const html = renderResult(name, ruleset)

      assert.ok(html.includes(esc(GUIDELINE_LINE)), 'guideline line is missing')
      assert.equal(count(html, 'ruleset__option'), 4, 'expected three options, one marked active')
      assert.ok(html.includes(`data-ruleset="${ruleset}"`))
      assert.ok(!html.includes('undefined'), 'a placeholder leaked into the markup')
      assert.ok(!html.includes('[object Object]'))
    })
  }
})

describe('foil Rune full helm - the ladder marks both directions', () => {
  const html = renderResult('Rune full helm', 'standard')

  it('renders the foil hero', () => {
    assert.ok(html.includes('foil__sheen'))
    assert.ok(html.includes('foil__glare'))
    assert.ok(html.includes('<h2 class="hero__name">') && html.includes('>Rune full helm</a></h2>'))
  })

  it('marks 8 unlocked and 2 still locked, matching the engine', () => {
    const r = resolve('Rune full helm', 'standard')
    assert.equal(unlockedRows(html), r.unlocks.length)
    assert.equal(lockedRows(html), r.excluded.length)
    assert.equal(lockedRows(html), 2)
  })

  it('names the excluded tier explicitly rather than dropping it', () => {
    assert.ok(html.includes('Dragon full helm'))
    assert.ok(html.includes('Still locked'))
  })

  it('marks where the searched card sits', () => {
    assert.ok(html.includes('ladder__member--searched'))
    assert.ok(html.includes('You are here'))
  })

  it('puts the verbs on the rows they apply to, not in a section of their own', () => {
    const r = resolve('Rune full helm', 'standard')
    const verbs = r.unlocks.reduce((n, u) => n + u.actions.length, 0)

    assert.equal(count(html, 'ladder__actions'), r.unlocks.length)
    assert.equal(count(html, 'badge--action'), verbs)
    assert.ok(!html.includes('What this lets you do'))
  })
})

describe('foil Iron ore - the verbs, and the product boundary', () => {
  const html = renderResult('Iron ore', 'standard')

  it('shows both granted verbs', () => {
    assert.ok(html.includes('>mine</span>'))
    assert.ok(html.includes('>smelt</span>'))
  })

  it('surfaces the not-the-product caveat', () => {
    assert.ok(html.includes('You get the action, not what it makes'))
    assert.ok(html.includes('Iron bar'))
  })

  it('renders a multi-member rung as separate rows', () => {
    assert.ok(html.includes('Copper ore'))
    assert.ok(html.includes('Tin ore'))
    assert.equal(unlockedRows(html), 3)
    assert.equal(lockedRows(html), 6)
  })
})

describe('foil Raw trout - a state pair with no ladder behind it', () => {
  const html = renderResult('Raw trout', 'standard')

  it('falls back to the per-unlock list when the actions differ', () => {
    assert.ok(html.includes('What you unlock'))
    assert.ok(html.includes('>catch</span>'))
    assert.ok(html.includes('>use</span>'))
  })

  it('renders no ladder, because the engine gave no family', () => {
    assert.equal(resolve('Raw trout', 'standard').family, undefined)
    assert.ok(!html.includes('ladder__rungs'))
  })

  it('shows both forms and claims nothing else', () => {
    assert.ok(html.includes('Raw trout'))
    assert.ok(html.includes('Trout'))
    assert.equal(count(html, 'unlocks__item'), 2)
  })
})

// DEC-0026. The herb ladder carries no ladder-down rule, so the pair stopped
// nothing and the ladder is not drawn at all. Previously it was, which put the
// searched card in a footnote reading "and nothing else" directly beneath a ladder
// showing 13 herbs locked - two true statements that read as a contradiction.
describe('foil Grimy guam leaf - the pair answers alone', () => {
  const html = renderResult('Grimy guam leaf', 'standard')

  it('draws no ladder, because no rule would have descended the herbs', () => {
    assert.equal(lockedRows(html), 0)
    assert.ok(!html.includes('Torstol'))
  })

  it('names both states, since no ladder is there to name them', () => {
    assert.ok(html.includes('What you unlock'))
    assert.ok(html.includes('Grimy guam leaf'))
    assert.ok(html.includes('Guam leaf'))
    assert.ok(!html.includes('On all 2 unlocked cards.'))
  })

  it('does not strand the partner card in an "and nothing else" footnote', () => {
    assert.ok(!html.includes('On Grimy guam leaf, and nothing else.'))
  })
})

describe('the bottom of a ladder - foil Bronze dagger', () => {
  const html = renderResult('Bronze dagger', 'standard')

  it('shows one unlock against nine explicit locks', () => {
    assert.equal(unlockedRows(html), 1)
    assert.equal(lockedRows(html), 9)
  })

  it('does not pretend anything is below it', () => {
    assert.ok(html.includes('1 unlocked, 9 still locked'))
  })
})

describe('the plain-foil ruleset', () => {
  const html = renderResult('Rune full helm', 'plain-foil')

  it('reads as a first-class answer, not an error', () => {
    assert.ok(html.includes('the foil unlocks only the card it shows'))
    assert.ok(html.includes('one of three community camps, not a settled rule'))
  })

  it('unlocks only the searched card and locks the rest of the ladder', () => {
    assert.equal(unlockedRows(html), 1)
    assert.equal(lockedRows(html), 9)
  })
})

describe('the extreme ruleset', () => {
  const html = renderResult('Rune full helm', 'extreme')

  it('keeps the same unlock set as standard', () => {
    assert.equal(unlockedRows(html), 8)
    assert.equal(lockedRows(html), 2)
  })

  it('states the stricter caveat', () => {
    assert.ok(html.includes('interaction with a locked source'))
  })
})

describe('solo item - unresolved with no family (DEC-0062)', () => {
  // A card with no family at all is not genuinely undecided - there is no wider
  // ladder/group to be undecided about, so it gets its own "solo item" treatment
  // instead of the full unresolved screen: no undecided banner, no camps.
  const html = renderResult(UNRESOLVED_CARD, 'standard')

  it('treats the card the same as any other result', () => {
    assert.ok(html.includes('foil__sheen'))
    assert.ok(html.includes(`>${esc(UNRESOLVED_CARD)}</a></h2>`))
  })

  it('is tagged as a distinct solo-item result, not the undecided screen', () => {
    assert.ok(html.includes('result--unresolved-solo'))
    assert.ok(html.includes('ruling--solo'))
    assert.ok(html.includes('simply unlocks itself'))
  })

  it('does not show the undecided ruling banner', () => {
    assert.ok(!html.includes('There is no agreed rule for this card yet'))
    assert.ok(!html.includes('badge--undecided'))
  })

  it('marks nothing unlocked or locked on a ladder, because there is none', () => {
    assert.equal(unlockedRows(html), 0)
    assert.equal(lockedRows(html), 0)
  })

  it('does not show the community camps, since there is nothing genuinely undecided', () => {
    assert.ok(!html.includes('The positions people hold'))
  })

  it('claims no sources, per spec section 8', () => {
    assert.deepEqual(resolve(UNRESOLVED_CARD).sources, [])
    assert.ok(!html.includes('<h3 class="result__heading">Source'))
  })
})

describe('an unresolved card with a family - the full undecided screen', () => {
  const member = (name: string) => shippedData.cards.find((c) => c.name === name)!
  const resolution = {
    card: member('Bronze full helm'),
    ruleset: 'standard',
    strategy: 'unresolved',
    unlocks: [{ card: member('Bronze full helm'), actions: [] }],
    excluded: [],
    explanation: 'Nothing is decided here.',
    caveats: [],
    confidence: 'undecided',
    sources: [],
    family: {
      id: 'full-helm',
      label: 'Full helms',
      kind: 'ladder',
      rungs: [
        { tier: 'bronze', members: [member('Bronze full helm')] },
        { tier: 'iron', members: [member('Iron full helm')] },
      ],
    },
  } as unknown as Resolution

  it('states plainly that nothing is decided, and shows the community camps', () => {
    const html = renderUnresolvedForTest(resolution)
    assert.ok(html.includes('Nothing is decided here.'))
    assert.ok(html.includes('badge--undecided'))
    assert.ok(html.includes('The positions people hold'))
    assert.ok(html.includes('Downward unlocks'))
    assert.ok(html.includes('A foil is just a foil'))
    assert.ok(html.includes('not an answer for this card'))
  })
})

describe('a Monster card - unresolved with no family behind it', () => {
  it('renders the plain single-card unlock, with no undecided framing and no ladder', () => {
    const html = renderResult('Goblin', 'standard')

    assert.ok(!html.includes('There is no agreed rule for this card yet'))
    assert.ok(!html.includes('ladder__rungs'))
  })
})

describe('an unknown card name', () => {
  it('says so without rendering a hero or claiming anything', () => {
    const html = renderResult('Not a real card', 'standard')

    assert.ok(html.includes('No card by that name'))
    assert.ok(!html.includes('foil__sheen'))
    assert.ok(!html.includes('ladder__rungs'))
  })
})

describe('escaping', () => {
  it('escapes card names containing an apostrophe', () => {
    const html = renderResult("Green d'hide body", 'standard')

    assert.ok(html.includes('Green d&#39;hide body'))
    assert.ok(!html.includes("d'hide body</h2>"))
  })
})

// Section 8 requires that an unresolved card with a family still renders its ladder,
// with no rung marked either way. No shipped card is in that state any more - every
// family carries a rule - so the resolution is built directly.
describe('an unresolved card that does have a family', () => {
  const member = (name: string) => shippedData.cards.find((c) => c.name === name)!
  const resolution = {
    card: member('Bronze full helm'),
    ruleset: 'standard',
    strategy: 'unresolved',
    unlocks: [{ card: member('Bronze full helm'), actions: [] }],
    excluded: [],
    explanation: 'Nothing is decided here.',
    caveats: [],
    confidence: 'undecided',
    sources: [],
    family: {
      id: 'full-helm',
      label: 'Full helms',
      kind: 'ladder',
      rungs: [
        { tier: 'bronze', members: [member('Bronze full helm')] },
        { tier: 'iron', members: [member('Iron full helm')] },
      ],
    },
  } as unknown as Resolution

  const html = renderLadder(resolution)

  it('marks only the searched card unlocked, the rest neutral context', () => {
    assert.equal(unlockedRows(html), 1)
    assert.equal(lockedRows(html), 0)
    assert.equal(contextRows(html), 1)
    assert.ok(html.includes('the card you pulled is always yours'))
  })
})
