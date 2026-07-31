import { searchCards, type CardResult } from '../search/index.ts'

const RESULT_LIMIT = 30

function optionId(slug: string): string {
  return `search-result-${slug}`
}

export function createSearchUI(root: HTMLElement, onSelect: (card: CardResult) => void): void {
  root.innerHTML = `
    <div class="search">
      <label class="search__label" for="search-input">Search for a card</label>
      <input
        class="search__input"
        id="search-input"
        type="text"
        role="combobox"
        aria-expanded="false"
        aria-controls="search-results"
        aria-autocomplete="list"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="e.g. rune full helm"
      />
      <ul class="search__results" id="search-results" role="listbox"></ul>
      <p class="search__status" role="status" aria-live="polite"></p>
    </div>
  `

  const input = root.querySelector<HTMLInputElement>('.search__input')!
  const list = root.querySelector<HTMLUListElement>('.search__results')!
  const status = root.querySelector<HTMLParagraphElement>('.search__status')!

  let results: CardResult[] = []
  let activeIndex = -1

  function renderResults(): void {
    list.innerHTML = results
      .map(
        (card, index) => `
          <li
            class="search__result${index === activeIndex ? ' search__result--active' : ''}"
            role="option"
            id="${optionId(card.slug)}"
            aria-selected="${index === activeIndex}"
            data-slug="${card.slug}"
          >
            <img class="search__thumb" src="${card.img}" alt="" loading="lazy" width="32" height="32" />
            <span class="search__name">${card.name}</span>
          </li>
        `,
      )
      .join('')

    input.setAttribute('aria-expanded', String(results.length > 0))
    input.setAttribute('aria-activedescendant', activeIndex >= 0 ? optionId(results[activeIndex].slug) : '')
  }

  function runSearch(query: string): void {
    results = query.trim() ? searchCards(query, RESULT_LIMIT) : []
    activeIndex = results.length > 0 ? 0 : -1
    renderResults()
  }

  function moveActive(delta: number): void {
    if (results.length === 0) return
    activeIndex = (activeIndex + delta + results.length) % results.length
    renderResults()
    list.querySelector(`#${CSS.escape(optionId(results[activeIndex].slug))}`)?.scrollIntoView({ block: 'nearest' })
  }

  function selectCard(card: CardResult): void {
    const url = new URL(window.location.href)
    url.searchParams.set('card', card.slug)
    window.history.pushState({}, '', url)

    status.textContent = `Showing the guideline for ${card.name}.`
    results = []
    activeIndex = -1
    renderResults()
    onSelect(card)
  }

  input.addEventListener('input', () => {
    status.textContent = ''
    runSearch(input.value)
  })

  input.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        break
      case 'Enter':
        if (activeIndex >= 0) {
          event.preventDefault()
          selectCard(results[activeIndex])
        }
        break
      case 'Escape':
        input.value = ''
        results = []
        activeIndex = -1
        status.textContent = ''
        renderResults()
        break
    }
  })

  list.addEventListener('click', (event) => {
    const item = (event.target as HTMLElement).closest<HTMLLIElement>('.search__result')
    if (!item) return
    const card = results.find((c) => c.slug === item.dataset.slug)
    if (card) selectCard(card)
  })
}
