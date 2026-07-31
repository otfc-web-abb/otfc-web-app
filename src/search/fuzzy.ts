export interface SearchIndexEntry {
  slug: string
  terms: string[]
}

export interface SearchMatch {
  slug: string
  score: number
}

// Mirrors scripts/build-data.ts ALIASES, applied here to the query side -
// a card is never literally named "mith platebody", so the abbreviation has
// to be expanded when the player types it, not when the index is built.
const ALIASES: Record<string, string> = {
  d: 'dragon',
  dhide: 'dragonhide',
  mith: 'mithril',
  addy: 'adamant',
  bs: 'blue star',
}

export function normalizeQuery(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  let curr = new Array<number>(b.length + 1).fill(0)

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[b.length]
}

function wordScore(token: string, word: string): number {
  if (token === word) return 3
  if (word.startsWith(token)) return 2
  const maxDist = token.length <= 4 ? 1 : 2
  if (Math.abs(token.length - word.length) <= maxDist && levenshtein(token, word) <= maxDist) return 1
  return 0
}

function tokenScore(token: string, words: string[]): number {
  const candidates = [token]
  const alias = ALIASES[token]
  if (alias) candidates.push(alias)

  let best = 0
  for (const word of words) {
    for (const candidate of candidates) {
      const score = wordScore(candidate, word)
      if (score > best) best = score
    }
  }
  return best
}

function termScore(tokens: string[], term: string): number | null {
  const words = term.split(' ')
  let total = 0
  for (const token of tokens) {
    const score = tokenScore(token, words)
    if (score === 0) return null
    total += score
  }
  return total
}

export function matchEntry(tokens: string[], entry: SearchIndexEntry): number | null {
  let best: number | null = null
  for (const term of entry.terms) {
    const score = termScore(tokens, term)
    if (score !== null && (best === null || score > best)) best = score
  }
  return best
}

export function search(query: string, entries: SearchIndexEntry[], limit = 40): SearchMatch[] {
  const tokens = normalizeQuery(query)
  if (tokens.length === 0) return []

  const matches: SearchMatch[] = []
  for (const entry of entries) {
    const score = matchEntry(tokens, entry)
    if (score !== null) matches.push({ slug: entry.slug, score })
  }

  matches.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
  return matches.slice(0, limit)
}
