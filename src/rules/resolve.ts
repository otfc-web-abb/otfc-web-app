// docs/rules-spec.md section 7.
//
//   plain-foil -> override -> state-pair -> ladder-down -> components
//                -> group -> npc-hierarchy -> unresolved
//
// state-pair sits above ladder-down deliberately. An item in a state pair is one
// item in two forms, not two rungs of a progression, so the pair stops the
// descent - DEC-0001. Everything else about the order is spec, not configuration.
//
// resolve() is pure and never throws. An unknown card name returns `unresolved`.

import { productBoundaryCaveat } from './actions.ts'
import { lowest } from './confidence.ts'
import { buildDataset, type Dataset } from './dataset.ts'
import type { Draft } from './draft.ts'
import { components } from './strategies/components.ts'
import { group } from './strategies/group.ts'
import { ladderDown } from './strategies/ladder-down.ts'
import { npcHierarchy } from './strategies/npc-hierarchy.ts'
import { override } from './strategies/override.ts'
import { plainFoil } from './strategies/plain-foil.ts'
import { statePair } from './strategies/state-pair.ts'
import { unresolved } from './strategies/unresolved.ts'
import type { Card, Confidence, RawData, Resolution, Ruleset, RulesetCaveats } from './types.ts'

const ORDER = [override, statePair, ladderDown, components, group, npcHierarchy] as const

const dedupe = (values: string[]): string[] => [...new Set(values.filter((v) => v.length > 0))]

/** plain-foil takes no per-ruleset caveats - it is the answer, not a strictness setting. */
const forRuleset = (caveats: RulesetCaveats | undefined, ruleset: Ruleset): string[] =>
  ruleset === 'plain-foil' ? [] : (caveats?.[ruleset] ?? [])

function draftFor(d: Dataset, card: Card, ruleset: Ruleset): Draft {
  if (ruleset === 'plain-foil') return plainFoil(d, card)
  for (const strategy of ORDER) {
    const draft = strategy(d, card)
    if (draft) return draft
  }
  return unresolved(d, card)
}

/**
 * Turns a Draft into a Resolution: annotate overrides, the ruleset, and the
 * derived product boundary.
 *
 * `unresolved` deliberately takes none of the ruleset composition. Section 8
 * fixes its shape as `sources: []` and `confidence: 'undecided'`, so attaching a
 * ruleset's sources and caveats to it would be claiming support for an answer
 * that was not given. Per-card annotate caveats still apply - those are about the
 * card, not about the ruling.
 */
function finish(d: Dataset, card: Card | null, ruleset: Ruleset, draft: Draft): Resolution {
  const isUnresolved = draft.strategy === 'unresolved'
  const rulesetDef = d.rulesets[ruleset]
  const annotations = card ? (d.annotateByCard.get(card.name) ?? []) : []

  const boundary =
    draft.productBoundary === false
      ? null
      : (productBoundaryCaveat(d, draft.unlocks, draft.products) ??
        (draft.productBoundary === true
          ? 'You get the action, not what it makes. Whatever comes out is a separate card you still need to pull.'
          : null))

  const confidences: Confidence[] = [draft.confidence, ...annotations.map((a) => a.confidence)]
  if (!isUnresolved) confidences.push(rulesetDef.confidence)

  return {
    card,
    ruleset,
    strategy: draft.strategy,
    unlocks: draft.unlocks,
    excluded: draft.excluded,
    explanation: draft.explanation,
    caveats: dedupe([
      ...draft.caveats,
      ...forRuleset(draft.rulesetCaveats, ruleset),
      // plain-foil carries its own ruleset's caveats already, via the draft.
      ...(isUnresolved || ruleset === 'plain-foil' ? [] : (rulesetDef.caveats ?? [])),
      ...(boundary ? [boundary] : []),
      ...annotations.flatMap((a) => [...a.caveats, ...forRuleset(a.rulesetCaveats, ruleset)]),
    ]),
    confidence: lowest(...confidences),
    sources: draft.sources,
    ...(draft.family ? { family: draft.family } : {}),
    ...(draft.ruleId ? { ruleId: draft.ruleId } : {}),
  }
}

export type Resolver = (cardName: string, ruleset?: Ruleset) => Resolution

/** Binds the engine to a dataset. The shipped binding is in index.ts; tests build
 *  their own so a case the curated data does not yet contain can still be covered. */
export function createResolver(raw: RawData): Resolver {
  const d = buildDataset(raw)

  return (cardName: string, ruleset: Ruleset = 'standard'): Resolution => {
    const card = d.cardsByName.get(cardName) ?? null
    if (!card) return finish(d, null, ruleset, unresolved(d, null))
    return finish(d, card, ruleset, draftFor(d, card, ruleset))
  }
}
