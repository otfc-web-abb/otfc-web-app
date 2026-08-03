// The result view. Renders whatever resolve() returned, including `unresolved`,
// which is a designed screen here rather than an error state - it is the common
// case at launch and the app's honesty made visible.

import { resolve, type Resolution, type Ruleset, type Unlock } from '../rules/index.ts'
import { actionBadges } from './actions.ts'
import { CAMPS, CONFIDENCE_BLURBS, CONFIDENCE_LABELS, GUIDELINE_LINE, RULESET_BLURBS } from './copy.ts'
import { esc, plural, wikiLink } from './html.ts'
import { renderLadder } from './ladder.ts'

const RULESETS: Ruleset[] = ['standard', 'extreme', 'plain-foil']
const RULESET_LABELS: Record<Ruleset, string> = {
  standard: 'Standard',
  extreme: 'Extreme',
  'plain-foil': 'Plain foil',
}

// --- pieces -------------------------------------------------------------------

/**
 * The blurb under the toggle says what the selected ruleset changes. When the
 * resolution carries caveats they say the same thing with the card's specifics
 * attached, so they take the slot rather than repeating it in a section below.
 */
function renderToggle(active: Ruleset, caveats: string[]): string {
  const lines = caveats.length > 0 ? caveats : [RULESET_BLURBS[active] ?? '']

  return `
    <div class="ruleset-field">
      <span class="ruleset__legend" id="ruleset-legend">Ruleset</span>
      <div class="ruleset" role="radiogroup" aria-labelledby="ruleset-legend">
        ${RULESETS.map(
          (r) => `
          <button
            class="ruleset__option${r === active ? ' ruleset__option--active' : ''}"
            type="button"
            role="radio"
            aria-checked="${r === active}"
            data-ruleset="${r}"
          >${RULESET_LABELS[r]}</button>
        `,
        ).join('')}
      </div>
      ${lines.map((line) => `<p class="ruleset__blurb">${esc(line)}</p>`).join('')}
    </div>
  `
}

/** The foil treatment. Pure CSS - the sheen layers are empty elements the
 *  stylesheet paints, so no image assets and nothing to load. */
function renderHero(resolution: Resolution): string {
  const card = resolution.card
  if (!card) return ''

  return `
    <div class="hero">
      <div class="foil">
        <img class="foil__img" src="${esc(card.img)}" alt="" width="130" height="130" />
        <span class="foil__sheen" aria-hidden="true"></span>
        <span class="foil__glare" aria-hidden="true"></span>
        <span class="foil__sparks" aria-hidden="true"
          >${'<i class="foil__spark"></i>'.repeat(7)}</span
        >
      </div>
      <p class="hero__eyebrow">Foil</p>
      <h2 class="hero__name">${wikiLink(card.name, 'hero__link')}</h2>
      ${card.examine ? `<p class="hero__examine">${esc(card.examine)}</p>` : ''}
    </div>
  `
}

const sameActions = (unlocks: Unlock[]): boolean =>
  unlocks.every((u) => u.actions.join() === unlocks[0].actions.join())

/**
 * The verbs normally ride on the ladder rows they apply to. This covers what the
 * ladder cannot draw: unlocks with no family at all, and unlocks sitting outside the
 * family it did draw.
 */
function renderUnlocks(resolution: Resolution): string {
  const { unlocks, family } = resolution
  if (unlocks.length === 0) return ''

  const inFamily = new Set(
    family
      ? [
          ...(family.rungs ?? []).flatMap((r) => r.members),
          ...(family.members ?? []),
          ...(family.whole ? [family.whole] : []),
        ].map((c) => c.name)
      : [],
  )

  const orphans = unlocks.filter((u) => !inFamily.has(u.card.name))
  if (orphans.length === 0) return ''

  // Collapsing several cards to one badge row drops their names, which only reads
  // if a ladder is naming them alongside. A state pair with no ladder behind it has
  // nothing else on the page, so "On all 2 unlocked cards" would be the whole answer.
  const namesAreCovered = orphans.length === 1 || family !== undefined

  if (sameActions(orphans) && namesAreCovered) {
    return `
      <section class="result__section">
        <h3 class="result__heading">What this lets you do</h3>
        <div class="actions">${actionBadges(orphans[0].actions)}</div>
        <p class="actions__note">${
          orphans.length === 1
            ? `On ${esc(orphans[0].card.name)}, and nothing else.`
            : `On all ${plural(orphans.length, 'unlocked card')}.`
        }</p>
      </section>
    `
  }

  return `
    <section class="result__section">
      <h3 class="result__heading">What you unlock</h3>
      <ul class="unlocks">
        ${orphans
          .map(
            (u) => `
          <li class="unlocks__item">
            <img class="unlocks__thumb" src="${esc(u.card.img)}" alt="" loading="lazy" width="28" height="28" />
            ${wikiLink(u.card.name, 'unlocks__name')}
            <span class="unlocks__actions">${actionBadges(u.actions)}</span>
            ${u.note ? `<span class="unlocks__note">${esc(u.note)}</span>` : ''}
          </li>
        `,
          )
          .join('')}
      </ul>
    </section>
  `
}

/** The engine reports exclusions explicitly, and the ladder already renders them in
 *  place. This covers the case where an excluded card is not a family member, so it
 *  would otherwise go unmentioned. */
function renderExcluded(resolution: Resolution): string {
  const { excluded, family } = resolution
  if (excluded.length === 0) return ''

  const inFamily = new Set((family?.rungs ?? []).flatMap((r) => r.members).map((c) => c.name))
  const orphans = excluded.filter((c) => !inFamily.has(c.name))
  if (orphans.length === 0) return ''

  return `
    <section class="result__section">
      <h3 class="result__heading">Still locked</h3>
      <ul class="unlocks unlocks--locked">
        ${orphans
          .map(
            (c) => `
          <li class="unlocks__item">
            <img class="unlocks__thumb" src="${esc(c.img)}" alt="" loading="lazy" width="28" height="28" />
            ${wikiLink(c.name, 'unlocks__name')}
            <span class="badge badge--locked">Still locked</span>
          </li>
        `,
          )
          .join('')}
      </ul>
    </section>
  `
}

/** The verdict, and how much to trust it. The strategy label and the tally both used
 *  to sit here too - the explanation states the first, the ladder counts the second. */
function renderRuling(resolution: Resolution): string {
  const { confidence, explanation } = resolution

  return `
    <section class="result__section ruling">
      <p class="ruling__explanation">${esc(explanation)}</p>
      <p class="ruling__confidence">
        <span class="badge badge--confidence badge--${confidence}">${esc(CONFIDENCE_LABELS[confidence] ?? confidence)}</span>
        <span class="ruling__gloss">${esc(CONFIDENCE_BLURBS[confidence] ?? '')}</span>
      </p>
    </section>
  `
}

// --- the unresolved screen ----------------------------------------------------

/**
 * A card with no family at all is not genuinely undecided - there is no ladder or
 * group for a "no agreed rule yet" framing to be about, and no camps to argue over.
 * DEC-0062 splits this into its own "solo item" treatment: plain statement that it
 * unlocks only itself, no undecided badge, no community-camps debate. This is
 * distinct from the full unresolved screen (section 8), which stays for a card that
 * does have a family and is genuinely caught between the resolution camps.
 */
function renderSoloItem(resolution: Resolution): string {
  const card = resolution.card
  if (!card) return ''
  const actions = resolution.unlocks[0]?.actions ?? []

  return `
    <section class="result__section ruling ruling--solo">
      <p class="ruling__explanation">
        ${esc(card.name)} has no known ladder, group, or state-pair relationship to any other card, so it simply unlocks itself.
      </p>
    </section>
    ${
      actions.length > 0
        ? `
      <section class="result__section">
        <h3 class="result__heading">What this lets you do</h3>
        <div class="actions">${actionBadges(actions)}</div>
      </section>
    `
        : ''
    }
  `
}

/**
 * rules-spec section 8: the card, the plain statement, then the principles at play.
 *
 * Nothing here may read as a suggested answer for this card. The camps are the
 * positions people hold, not positions applied to the card on screen.
 */
export function renderUnresolved(resolution: Resolution): string {
  if (!resolution.family) {
    return renderSoloItem(resolution)
  }

  return `
    ${renderRuling(resolution)}

    ${renderLadder(resolution)}
    ${renderUnlocks(resolution)}

    <section class="result__section">
      <h3 class="result__heading">The positions people hold</h3>
      <p class="principles__lede">
        These are the general arguments in circulation, not an answer for this card.
      </p>
      <ul class="principles principles--compact">
        ${CAMPS.map(
          (c) => `
          <li class="principles__item">
            <p class="principles__label">${esc(c.label)}</p>
            <p class="principles__weight">${esc(c.weight)}</p>
          </li>
        `,
        ).join('')}
      </ul>
      <p class="principles__source">
        What each one argues, and how a ruling gets made, is on
        <a class="link" href="/open-questions.html">Open questions</a>.
      </p>
    </section>
  `
}

// --- the view -----------------------------------------------------------------

/** The ladder leads. The verdict prose and the source list both said in words what
 *  the rows already show, so neither survives here - the unresolved screen keeps its
 *  statement because there the words are the answer. */
function renderResolved(resolution: Resolution): string {
  return `
    ${renderLadder(resolution)}
    ${renderUnlocks(resolution)}
    ${renderExcluded(resolution)}
  `
}

function renderNotFound(name: string): string {
  return `
    <section class="result__section ruling">
      <h3 class="result__heading">No card by that name</h3>
      <p class="ruling__explanation">
        Nothing in the plugin's card list matches "${esc(name)}", so there is nothing to reason about.
        Check the spelling, or search again.
      </p>
    </section>
  `
}

export function renderResult(cardName: string, ruleset: Ruleset): string {
  const resolution = resolve(cardName, ruleset)

  const body = !resolution.card
    ? renderNotFound(cardName)
    : resolution.strategy === 'unresolved'
      ? renderUnresolved(resolution)
      : renderResolved(resolution)

  const isSolo = resolution.strategy === 'unresolved' && resolution.card && !resolution.family
  const strategyClass = isSolo ? 'unresolved-solo' : resolution.strategy

  return `
    <article class="result result--${strategyClass}">
      <p class="guideline" role="note">${esc(GUIDELINE_LINE)}</p>
      ${renderHero(resolution)}
      ${renderToggle(ruleset, resolution.caveats)}
      ${body}
    </article>
  `
}

export type ResultView = {
  show: (cardName: string, ruleset?: Ruleset, options?: { scroll?: boolean }) => void
  clear: () => void
}

function writeRulesetToUrl(ruleset: Ruleset): void {
  const url = new URL(window.location.href)
  if (ruleset === 'standard') url.searchParams.delete('ruleset')
  else url.searchParams.set('ruleset', ruleset)
  window.history.replaceState(window.history.state, '', url)
}

/** The toggle re-renders in place and mirrors the choice into `?ruleset=`, so a
 *  shared link restores the same ruleset a player was viewing, not just the card. */
export function createResultView(root: HTMLElement): ResultView {
  let cardName: string | null = null
  let ruleset: Ruleset = 'standard'

  function render(): void {
    root.innerHTML = cardName ? renderResult(cardName, ruleset) : ''
  }

  root.addEventListener('click', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLButtonElement>('.ruleset__option')
    if (!option) return

    ruleset = option.dataset.ruleset as Ruleset
    writeRulesetToUrl(ruleset)
    render()
    root.querySelector<HTMLElement>('.ruleset__option--active')?.focus()
  })

  return {
    show(name: string, initialRuleset?: Ruleset, options?: { scroll?: boolean }) {
      cardName = name
      if (initialRuleset) ruleset = initialRuleset
      render()
      if (options?.scroll !== false) root.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    clear() {
      cardName = null
      render()
    },
  }
}
