import { ACTION_LABELS } from './copy.ts'
import { esc } from './html.ts'

export const actionBadges = (actions: string[]): string =>
  actions.map((a) => `<span class="badge badge--action">${esc(ACTION_LABELS[a] ?? a)}</span>`).join('')
