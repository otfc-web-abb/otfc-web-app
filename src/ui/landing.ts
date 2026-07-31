// The empty state. Shown until a card is picked, then hidden by `body.has-result`.
//
// The examples are picked so that between them a first-time visitor sees every
// shape of answer the tool produces - a progression, a two-form item, a set, and
// an honest "not decided yet" - before they search anything themselves. Which card
// stands for each shape is drawn fresh on every visit, so the landing page shows the
// breadth of the card list rather than the same four items forever.

import cardsJson from '../data/cards.json' with { type: 'json' }
import { resolve } from '../rules/index.ts'
import { esc } from './html.ts'

const STEPS = [
  {
    label: 'Search the card',
    body: 'Type the item you pulled as a foil. Card names come straight from the plugin.',
  },
  {
    label: 'Read the ruling',
    body: 'What it unlocks, what stays locked, and which rule decided it - shown side by side.',
  },
  {
    label: 'Check the source',
    body: 'Every ruling cites where it came from. No source, no ruling - it shows as undecided instead.',
  },
]

interface RawCard {
  name: string
  slug: string
  img: string
}

/** The four shapes, in the order they read best - a progression, then the two
 *  narrower rules, then the honest gap last. */
const SHAPES = [
  { strategy: 'ladder-down', what: 'Unlocks downward - a tier and everything below it' },
  { strategy: 'state-pair', what: 'Two forms of one item - nothing else' },
  { strategy: 'group', what: 'Unlocks the group - the whole set together' },
  { strategy: 'unresolved', what: 'Not decided yet - what an honest gap looks like' },
]

/** One pass over the card list under the default ruleset, held for the page's
 *  lifetime. Every card resolves to exactly one strategy, so this is the whole
 *  candidate set for every shape at once. */
let pools: Map<string, RawCard[]> | null = null

function poolsByStrategy(): Map<string, RawCard[]> {
  if (pools) return pools

  pools = new Map()
  for (const card of cardsJson as RawCard[]) {
    const { strategy } = resolve(card.name)
    const pool = pools.get(strategy)
    if (pool) pool.push(card)
    else pools.set(strategy, [card])
  }
  return pools
}

const pickOne = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

function pickExamples(): (RawCard & { what: string })[] {
  const byStrategy = poolsByStrategy()

  return SHAPES.flatMap(({ strategy, what }) => {
    const pool = byStrategy.get(strategy)
    return pool && pool.length > 0 ? [{ ...pickOne(pool), what }] : []
  })
}

export function renderLanding(): string {
  const examples = pickExamples()

  return `
    <div class="landing">
      <section class="landing__section">
        <h2 class="section-heading">How this works</h2>
        <ol class="steps">
          ${STEPS.map(
            (step, i) => `
            <li class="step">
              <span class="step__n" aria-hidden="true">${i + 1}</span>
              <p class="step__label">${esc(step.label)}</p>
              <p class="step__body">${esc(step.body)}</p>
            </li>
          `,
          ).join('')}
        </ol>
      </section>

      <section class="landing__section">
        <h2 class="section-heading">Try one of these</h2>
        <ul class="examples">
          ${examples.map(
            (card) => `
            <li class="example">
              <a class="example__link" href="?card=${esc(card.slug)}" data-slug="${esc(card.slug)}">
                <span class="example__frame">
                  <img class="example__img" src="${esc(card.img)}" alt="" loading="lazy" width="36" height="36" />
                </span>
                <span>
                  <span class="example__name">${esc(card.name)}</span>
                  <span class="example__what">${esc(card.what)}</span>
                </span>
              </a>
            </li>
          `,
          ).join('')}
        </ul>
      </section>
    </div>
  `
}

/** Examples are real links so they can be opened in a new tab or shared, but a
 *  plain click routes through the app rather than reloading the page. */
export function createLanding(root: HTMLElement, onSelect: (slug: string) => void): void {
  root.innerHTML = renderLanding()

  root.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return

    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('.example__link')
    if (!link?.dataset.slug) return

    event.preventDefault()
    onSelect(link.dataset.slug)
  })
}
