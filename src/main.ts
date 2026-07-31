import './style.css'
import type { Ruleset } from './rules/index.ts'
import { cardBySlug } from './search/index.ts'
import { createLanding } from './ui/landing.ts'
import { createResultView } from './ui/result.ts'
import { createSearchUI } from './ui/search.ts'
import { renderShell } from './ui/shell.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderShell(
  { current: 'search' },
  `
    <p class="app__lede" id="intro">
      Search the foil you pulled. Get what it unlocks, what it does not, and why.
    </p>
    <div id="search-root"></div>
    <div id="landing-root"></div>
    <div id="result-root"></div>
  `,
)

const result = createResultView(document.querySelector<HTMLDivElement>('#result-root')!)

function showCard(name: string, ruleset?: Ruleset, options?: { scroll?: boolean }): void {
  document.body.classList.add('has-result')
  result.show(name, ruleset, options)
}

createSearchUI(document.querySelector<HTMLDivElement>('#search-root')!, (card) => showCard(card.name))

createLanding(document.querySelector<HTMLDivElement>('#landing-root')!, (slug) => {
  const card = cardBySlug(slug)
  if (!card) return

  const url = new URL(window.location.href)
  url.searchParams.set('card', card.slug)
  window.history.pushState({}, '', url)
  showCard(card.name)
})

const RULESETS: Ruleset[] = ['standard', 'extreme', 'plain-foil']

/**
 * Deep links are the sharing mechanism this app exists for - a link pasted into
 * Discord must reopen the identical result on a cold load. `?card=` and
 * `?ruleset=` are read here once at startup and again on back/forward, so
 * history navigation between two shared links also restores correctly.
 */
function restoreFromUrl(): void {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('card')
  const rulesetParam = params.get('ruleset')
  const ruleset = RULESETS.find((r) => r === rulesetParam)

  if (!slug) {
    document.body.classList.remove('has-result')
    result.clear()
    return
  }

  const card = cardBySlug(slug)
  if (card) showCard(card.name, ruleset, { scroll: false })
}

restoreFromUrl()
window.addEventListener('popstate', restoreFromUrl)
