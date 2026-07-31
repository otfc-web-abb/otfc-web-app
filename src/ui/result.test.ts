// Phase 5's gate: every Phase 3 test case has to render, and render the right
// thing. These assert against the markup renderResult() produces, so a change that
// silently stops marking locked tiers - the whole point of the ladder visual -
// fails here rather than in a screenshot nobody takes.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { resolve } from '../rules/index.ts'
import { GUIDELINE_LINE } from './copy.ts'
import { esc } from './html.ts'
import { renderResult } from './result.ts'

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
    ['Rune cannonball', 'standard'],
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
    assert.ok(html.includes('>Rune full helm</h2>'))
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

describe('foil Grimy guam leaf - the pair stops the herb ladder', () => {
  const html = renderResult('Grimy guam leaf', 'standard')

  it('marks the 13 herbs above as still locked', () => {
    assert.equal(lockedRows(html), 13)
    assert.ok(html.includes('Torstol'))
  })

  it('marks Guam leaf unlocked', () => {
    assert.equal(unlockedRows(html), 1)
  })

  it('still accounts for the searched card, which is not a ladder member', () => {
    assert.ok(html.includes('What this lets you do'))
    assert.ok(html.includes('On Grimy guam leaf, and nothing else.'))
  })

  it('explains that the descent stopped', () => {
    assert.ok(html.includes('does not descend this progression'))
  })
})

describe('the bottom of a ladder - foil Bronze dagger', () => {
  const html = renderResult('Bronze dagger', 'standard')

  it('shows one unlock against eight explicit locks', () => {
    assert.equal(unlockedRows(html), 1)
    assert.equal(lockedRows(html), 8)
  })

  it('does not pretend anything is below it', () => {
    assert.ok(html.includes('1 unlocked, 8 still locked'))
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

describe('unresolved is a designed screen, not an error', () => {
  const html = renderResult('Rune cannonball', 'standard')

  it('treats the card the same as any other result', () => {
    assert.ok(html.includes('foil__sheen'))
    assert.ok(html.includes('>Rune cannonball</h2>'))
  })

  it('states plainly that nothing is decided', () => {
    assert.ok(html.includes('There is no agreed rule for this card yet'))
    assert.ok(html.includes('badge--undecided'))
  })

  it('renders the family as neutral context, marking nothing unlocked or locked', () => {
    assert.equal(unlockedRows(html), 0)
    assert.equal(lockedRows(html), 0)
    assert.equal(contextRows(html), 7)
    assert.ok(html.includes('nothing here is marked unlocked or locked'))
  })

  it('shows the three camps as positions, never as an answer', () => {
    assert.ok(html.includes('The positions people hold'))
    assert.ok(html.includes('Downward unlocks'))
    assert.ok(html.includes('A foil is just a foil'))
    assert.ok(html.includes('not an answer for this card'))
  })

  it('offers the hand-off twice - once up top, once with the reasoning', () => {
    assert.ok(html.includes('Where this gets decided'))
    assert.ok(html.includes('take it there'))
    assert.equal(count(html, 'Suggest a rule'), 2)
    assert.ok(html.includes('handoff__actions--inline'))
  })

  it('claims no sources, per spec section 8', () => {
    assert.deepEqual(resolve('Rune cannonball').sources, [])
    assert.ok(!html.includes('<h3 class="result__heading">Source'))
  })
})

describe('a Monster card - unresolved with no family behind it', () => {
  it('renders the hand-off without a ladder', () => {
    const html = renderResult('Goblin', 'standard')

    assert.ok(html.includes('There is no agreed rule for this card yet'))
    assert.ok(html.includes('Where this gets decided'))
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
