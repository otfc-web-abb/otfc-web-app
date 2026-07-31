import cardsJson from '../data/cards.json' with { type: 'json' }
import searchIndexJson from '../data/search-index.json' with { type: 'json' }

import { search as fuzzySearch, type SearchIndexEntry } from './fuzzy.ts'

interface RawCard {
  name: string
  slug: string
  img: string
}

export interface CardResult {
  slug: string
  name: string
  img: string
  score: number
}

const cards = cardsJson as RawCard[]
const searchIndex = searchIndexJson as SearchIndexEntry[]

const cardsBySlug = new Map(cards.map((card) => [card.slug, card]))

export function cardBySlug(slug: string): CardResult | undefined {
  const card = cardsBySlug.get(slug)
  return card ? { slug: card.slug, name: card.name, img: card.img, score: 1 } : undefined
}

export function searchCards(query: string, limit = 40): CardResult[] {
  const matches = fuzzySearch(query, searchIndex, limit * 4)

  const results: CardResult[] = []
  for (const match of matches) {
    const card = cardsBySlug.get(match.slug)
    if (!card) continue
    results.push({ slug: card.slug, name: card.name, img: card.img, score: match.score })
  }

  results.sort((a, b) => b.score - a.score || a.name.length - b.name.length || a.name.localeCompare(b.name))
  return results.slice(0, limit)
}
