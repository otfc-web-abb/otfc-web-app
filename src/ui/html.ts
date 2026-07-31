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

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`
