// docs/rules-spec.md section 9. When several confidences meet in one resolution
// the lowest wins. Confidence never rises through composition.

import type { Confidence } from './types.ts'

const RANK: Record<Confidence, number> = { undecided: 0, contested: 1, sourced: 2 }

export const lowest = (...values: Confidence[]): Confidence =>
  values.reduce((a, b) => (RANK[b] < RANK[a] ? b : a), 'sourced')
