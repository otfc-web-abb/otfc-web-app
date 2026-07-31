// docs/rules-spec.md section 6.6. The strategy holds its position in the
// resolution order and nothing else.
//
// TheSeahorsie's page gives a rank order - Pets -> Boss -> Superior -> Normal npc
// - and says NPCs with variants unlock horizontally, but never says what a foil at
// a given rank actually grants. That is not enough to specify an unlock, so nothing
// is specified and this never matches. Monster cards fall through to `unresolved`
// until Phase 7 gives the strategy a data model.

import type { StrategyModule } from '../draft.ts'

export const npcHierarchy: StrategyModule = () => null
