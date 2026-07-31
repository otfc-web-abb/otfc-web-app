import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const SOURCE_URL =
  'https://raw.githubusercontent.com/Azderi/osrs-tcg/main/src/main/resources/Card.json'

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE_PATH = path.join(ROOT, '.cache', 'Card.json')
const OUT_DIR = path.join(ROOT, 'src', 'data')
const CARDS_OUT = path.join(OUT_DIR, 'cards.json')
const SEARCH_INDEX_OUT = path.join(OUT_DIR, 'search-index.json')

const REGION_TAGS = new Set([
  'asgarnia',
  'desert',
  'fremennik',
  'kandarin',
  'karamja',
  'kourend',
  'misthalin',
  'morytania',
  'tirannwn',
  'varlamore',
  'wilderness',
])

const JUNK_TAGS = new Set(['no', 'n/a'])

// name -> alias term, so "d hide" and "mith" find their full names
const ALIASES: Record<string, string> = {
  d: 'dragon',
  dhide: 'dragonhide',
  mith: 'mithril',
  addy: 'adamant',
  rune: 'rune',
  bs: 'blue star',
}

interface RawCard {
  name: string
  category: string[]
  imageUrl: string
  examine: string
  value: number
  equipable: boolean
  equipmentSlot?: string
  options: string[]
  tradeable: boolean
  stackable: boolean
  noteable: boolean
  questItem: boolean
  level?: number
  attackStyle?: string
  maxHit?: number
}

interface Card {
  name: string
  slug: string
  img: string
  examine: string
  cats: string[]
  regions: string[]
  value: number
  equipable: boolean
  equipmentSlot: string | null
  options: string[]
  stackable: boolean
  questItem: boolean
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategories(category: string[]): { cats: string[]; regions: string[] } {
  const cats = new Set<string>()
  const regions = new Set<string>()

  for (const raw of category) {
    const tag = raw.toLowerCase().trim()
    if (JUNK_TAGS.has(tag)) continue
    if (REGION_TAGS.has(tag)) {
      regions.add(tag)
    } else {
      cats.add(tag)
    }
  }

  return { cats: [...cats].sort(), regions: [...regions].sort() }
}

function normalizeSearchTerm(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function buildCard(raw: RawCard): Card {
  const { cats, regions } = normalizeCategories(raw.category)
  return {
    name: raw.name,
    slug: slugify(raw.name),
    img: raw.imageUrl,
    examine: raw.examine,
    cats,
    regions,
    value: raw.value,
    equipable: raw.equipable,
    equipmentSlot: raw.equipmentSlot ?? null,
    options: raw.options,
    stackable: raw.stackable,
    questItem: raw.questItem,
  }
}

interface SearchEntry {
  slug: string
  terms: string[]
}

function buildSearchIndex(cards: Card[]): SearchEntry[] {
  return cards.map((card) => {
    const base = normalizeSearchTerm(card.name)
    const terms = new Set([base])

    for (const word of base.split(' ')) {
      const alias = ALIASES[word]
      if (alias) terms.add(base.replace(word, alias))
    }

    return { slug: card.slug, terms: [...terms] }
  })
}

async function fetchCardJson(): Promise<RawCard[]> {
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Failed to fetch Card.json: ${res.status} ${res.statusText}`)
  return res.json()
}

async function loadCached(): Promise<RawCard[] | null> {
  if (!existsSync(CACHE_PATH)) return null
  return JSON.parse(await readFile(CACHE_PATH, 'utf8'))
}

function diffCards(previous: RawCard[] | null, current: RawCard[]): void {
  if (!previous) {
    console.log(`No previous cache - starting fresh with ${current.length} cards.`)
    return
  }

  const prevNames = new Set(previous.map((c) => c.name))
  const currNames = new Set(current.map((c) => c.name))

  const added = [...currNames].filter((n) => !prevNames.has(n))
  const removed = [...prevNames].filter((n) => !currNames.has(n))

  if (added.length === 0 && removed.length === 0) {
    console.log('No card additions or removals vs cached copy.')
    return
  }

  if (added.length > 0) {
    console.log(`Added (${added.length}):`)
    for (const name of added) console.log(`  + ${name}`)
  }
  if (removed.length > 0) {
    console.log(`Removed (${removed.length}):`)
    for (const name of removed) console.log(`  - ${name}`)
  }
}

async function main(): Promise<void> {
  const refresh = process.argv.includes('--refresh')

  await mkdir(path.dirname(CACHE_PATH), { recursive: true })
  await mkdir(OUT_DIR, { recursive: true })

  const cached = await loadCached()
  let raw: RawCard[]

  if (cached && !refresh) {
    console.log('Using cached Card.json (pass --refresh to re-download).')
    raw = cached
  } else {
    console.log('Fetching Card.json from upstream...')
    raw = await fetchCardJson()
    diffCards(cached, raw)
    await writeFile(CACHE_PATH, JSON.stringify(raw))
    console.log(`Cached ${raw.length} cards to ${path.relative(ROOT, CACHE_PATH)}`)
  }

  const cards = raw.map(buildCard)
  const searchIndex = buildSearchIndex(cards)

  await writeFile(CARDS_OUT, JSON.stringify(cards))
  await writeFile(SEARCH_INDEX_OUT, JSON.stringify(searchIndex))

  console.log(`Wrote ${cards.length} cards to ${path.relative(ROOT, CARDS_OUT)}`)
  console.log(`Wrote search index to ${path.relative(ROOT, SEARCH_INDEX_OUT)}`)

  const runeFullHelm = cards.find((c) => c.name === 'Rune full helm')
  if (!runeFullHelm || !runeFullHelm.img) {
    throw new Error('Smoke test failed: "Rune full helm" not resolved with a working image URL.')
  }
  console.log(`Smoke test OK: "Rune full helm" -> ${runeFullHelm.img}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
