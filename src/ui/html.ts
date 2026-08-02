const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Card names and examine text come from upstream Card.json and contain apostrophes
 *  and ampersands, so every interpolation into markup goes through this. */
export const esc = (value: string): string => value.replace(/[&<>"']/g, (c) => ENTITIES[c])

/** Card names match their wiki page titles, so the URL is derivable rather than
 *  another field to keep in sync with upstream. */
export const wikiUrl = (name: string): string =>
  `https://oldschool.runescape.wiki/w/${encodeURIComponent(name.replace(/ /g, '_'))}`

export const wikiLink = (name: string, className: string): string =>
  `<a class="${className}" href="${esc(wikiUrl(name))}" target="_blank" rel="noopener">${esc(name)}</a>`

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`
