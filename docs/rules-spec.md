# Rules Spec

**Status:** Phase 1. Defines mechanisms, not rulings.

This document specifies what kinds of unlock behaviour can exist and how each is expressed as data. It contains no rulings about specific cards. Rulings live in `data/rules.json`, each carrying its source, and are recorded in [decisions.md](decisions.md).

The test this spec has to pass: **a new ruling can be added by editing JSON only.** If adding a ruling requires touching `src/rules/`, the mechanism was under-specified. Section 13 lists the handful of changes that legitimately do require code.

---

## 1. Governing principle

A rule enters the dataset only with a stated source. `sources` is a required, non-empty field on every `rules.json` entry and every `overrides.json` entry, so **an unsourced rule fails schema validation rather than being a judgement call**.

**Any card with no matching sourced rule resolves to `unresolved`.** That is a designed output state with its own presentation (section 8), not an error and not a gap to be filled by inference. The engine has no fallback heuristic, no "probably behaves like its neighbours" path, and no default strategy. Absence of data produces `unresolved`, always.

Being wrong costs more than being incomplete.

---

## 2. Vocabulary

| Term | Meaning |
|---|---|
| **Card** | A record in `src/data/cards.json`. Identified by its exact `name`. |
| **Family** | A factual grouping of cards: a `ladder`, a `set`, or a `composite`. Lives in `families.json`. |
| **Rung** | One step of a ladder. Holds one or more cards. `rungs[0]` is the **lowest**. |
| **State pair** | Two cards that are the unprocessed and processed forms of one item. Lives in `state-pairs.json`. |
| **Strategy** | The mechanism that produced an answer. One of the seven in section 6. |
| **Ruleset** | The player's chosen strictness: `standard`, `extreme`, `plain-foil`. Section 5. |
| **Confidence** | How settled the ruling is: `sourced`, `contested`, `undecided`. Section 9. |
| **Foil** | The card the player pulled. The searched card is always assumed to be the foil. |

**Factual vs judgemental.** `families.json` and `state-pairs.json` are factual - membership, order, and which verbs an item supports are read from the game and can be built out freely. `rules.json` and `overrides.json` are judgemental - they say what a foil *does*, and every entry is gated behind a source. A family present in `families.json` with no matching entry in `rules.json` resolves to `unresolved`. That is the intended default, not a missing row.

---

## 3. Data files

All four live in `data/`. Schemas are in `data/schema/`, sharing `common.schema.json`.

| File | Kind | Schema | Holds |
|---|---|---|---|
| `families.json` | Factual | `families.schema.json` | Ladders, sets, composites. Membership, order, verbs. |
| `state-pairs.json` | Factual | `state-pairs.schema.json` | Unprocessed/processed pairings. |
| `rules.json` | **Judgemental** | `rules.schema.json` | Which strategy applies to which families, plus ruleset definitions. Source mandatory. |
| `overrides.json` | **Judgemental** | `overrides.schema.json` | Per-card exceptions and caveats. Source mandatory. |

`families.json` covers more than ladders. The plan describes it as "ladder membership + order"; it also holds unordered `set` families (outfits, wilderness rings, tierless siblings) and `composite` families (a card and its parts), because those are equally factual and the architecture fixes the file count at four.

Each file is an object wrapper, not a bare array, so it can carry `$schema` and grow a header field without a migration:

```json
{ "$schema": "./schema/families.schema.json", "families": [ ... ] }
```

---

## 4. Action vocabulary

Actions are what the foil **permits the player to do** with a card. Closed set:

| Action | Class | Means |
|---|---|---|
| `wear` | possession | Equip in an armour slot. |
| `wield` | possession | Equip in a weapon or shield slot. |
| `use` | possession | Own and use a non-equippable item for its purpose. |
| `mine` | acquisition | Mine the rock that yields this. |
| `chop` | acquisition | Chop the tree that yields this. |
| `catch` | acquisition | Fish, hunt, or otherwise catch this. |
| `plant` | acquisition | Plant and harvest this. |
| `smelt` | transformation | Use as input to smelting. |
| `smith` | transformation | Use as input to smithing. |
| `cook` | transformation | Use as input to cooking. |
| `craft` | transformation | Use as input to crafting. |
| `fletch` | transformation | Use as input to fletching. |

The **class** column is not stored in data; it is fixed here and hard-coded in the engine, because it drives the product boundary below. `Card.json`'s `options[]` seeds the action set during curation; resource verbs are curated by hand.

### 4.1 The product boundary

**A resource unlock grants the verb, not the product.**

Granting `smelt` on Iron ore means the player may perform the smelting action with Iron ore as input. It does **not** grant Iron bar. If Iron bar is itself a card, the player still needs that card.

Mechanism, so this needs no per-rule authoring:

> When a resolution grants a **transformation** action on a card, and the product of that transformation is a card **not in the resolution's own unlock set**, the engine attaches the product-boundary caveat.

That single condition gets both canonical cases right:

- Foil Iron ore, `ladder-down`: grants `mine` + `smelt` on iron and below. Iron bar is not in the unlock set, so the caveat fires and the result view shows the boundary explicitly.
- Foil Raw trout, `state-pair`: grants `catch` + `cook`. Trout **is** in the unlock set, so no caveat - the rule already granted the product.

The product is named in the caveat when the factual member carries `produces`; otherwise the caveat uses generic wording. A rule may force the caveat on or off with `grants.productBoundary`, but the derived behaviour is the default and should stay that way.

This distinction is the difference between a useful app and a list of item names. It gets its own visual treatment in the result view, not a footnote.

---

## 5. Rulesets

The ruleset changes **what the player may do around the unlock**, not which cards are unlocked. Same unlock set, different caveats and different action availability. The three are defined as data in `rules.json` under `rulesets`, each with its own `sources` and `confidence`.

| Ruleset | Effect on output |
|---|---|
| `standard` | Full unlock set. Caveats note that gathering and banking an item before its card is unlocked is permitted, so acquisition verbs are usable ahead of the unlock. |
| `extreme` | Same unlock set. Caveats state that any interaction with a locked source is forbidden, so acquisition verbs on not-yet-unlocked cards are off the table and the player cannot pre-bank. Confidence is capped at `contested`. |
| `plain-foil` | **Short-circuits everything.** Returns the searched card alone, `unlocks: [{ card, actions }]` for that card only, `excluded: []`, and the explanation of that camp's position. Strategy is `plain-foil`. Confidence `contested`. |

`plain-foil` is checked before overrides and before every strategy. It is a first-class answer representing the "a foil is just a foil" camp, not an error state and not a debug mode.

Ruleset caveats compose: the ruleset's own `caveats` are attached to every resolution, then any `rulesetCaveats.<ruleset>` on the matched rule or override are merged on top. Nothing else in the pipeline branches on ruleset. If a future ruling needs the unlock *set* to differ by ruleset, that is a spec change, not a data change - see section 13.

**`extreme` is currently defined from the osrscardexchange framing only** (gather-then-bank vs cannot-interact-with-source). The Reddit extreme-cardlocked-ironman thread is not fetchable by tooling and has not been read. Until it is, `extreme` ships at `contested` confidence. See DEC-0004.

---

## 6. Strategies

Seven values. Six produce answers; `unresolved` is the honest seventh.

Every strategy takes the same shape: **factual input** (which cards are related and how) plus a **judgemental rule** (that this relationship means an unlock). Neither alone produces an answer. A ladder with no rule resolves `unresolved`; a rule pointing at a family that does not exist is a validation error.

### 6.1 `override`

**Input:** an `overrides.json` entry for the exact card name, `mode: "replace"`.

**Semantics:** answers this card outright, ignoring every `rules.json` entry. The entry supplies its own `strategy` label, `unlocks`, `excluded`, and `explanation`.

`strategy: "unresolved"` is legal here and is the deliberate-refusal case: a card where a family-level rule would over-reach and the honest answer is that this specific card is undecided. It must carry `confidence: "undecided"` and an empty `unlocks`.

`mode: "annotate"` is not a strategy. Annotations attach caveats to whatever resolved, and may lower but never raise confidence.

### 6.2 `state-pair`

**Input:** a `state-pairs.json` entry containing the card, plus a `rules.json` entry with `strategy: "state-pair"` selecting that pair by `statePairs` (id) or `statePairKinds` (kind).

**Semantics:** unlocks **both states of that item and nothing else**. Does not descend any ladder the card also belongs to. Actions are the union of both states' verbs unless the rule narrows them.

**Precedence over `ladder-down` is deliberate and load-bearing.** Raw trout is in a state pair and in a fish ladder; the state pair wins, so lower fish are not unlocked. Same for Grimy guam leaf and lower herbs. See DEC-0001.

Card names in data are the exact `cards.json` names, which are not always the names people say: the herb pair is `Grimy guam leaf` / `Guam leaf`, not "grimy guam" / "clean guam". Validation rule 4 catches the difference.

**Excluded:** if the card is also in a ladder **that a `ladder-down` rule selects**, the rest of that ladder - above *and* below - is reported as excluded, because the player needs to see that the state pair stopped the descent.

A ladder family that no `ladder-down` rule selects is not reported at all: no `family` context, no `excluded`. Nothing was going to descend it, so the pair stopped nothing and there is no forfeited descent to show. This matters because the gem, herb, dragonhide and dragon-leather families are exactly that - factual ordering with no rule on them - and reporting them anyway drew a full ladder of "still locked" rungs implying a loss the player never faced. See DEC-0026.

### 6.3 `ladder-down`

**Input:** a `families.json` entry with `kind: "ladder"` containing the card, plus a `rules.json` entry with `strategy: "ladder-down"` selecting that family by `families` (id) or `familyTags` (tag).

**Semantics:** unlocks the card's own rung and every rung below it. `rungs[0]` is the lowest, so "below" means a lower index. Every member of every unlocked rung is unlocked, including the other members of the card's own rung.

**Excluded:** every member of every rung above. This is shown explicitly in the result view - what you do not get matters as much as what you do.

Actions come from the family's `actions`, overridden per member where the member declares its own.

**Cosmetic siblings.** Whether a stat-identical reskin (Gilded, `(t)`/`(g)`, White) is its own rung or a sibling on the base rung is **not decided** - see DEC-0003. The schema expresses both: a rung holds an array of members, so siblings sit together, and a separate rung expresses the other answer. A member may carry `cosmeticOf` as a factual marker. Rung placement is the ruling; the marker is not.

### 6.4 `components`

**Input:** a `families.json` entry with `kind: "composite"` whose `whole` is the card, plus a `rules.json` entry with `strategy: "components"`.

**Semantics:** unlocks the whole and each of its named parts. Does not unlock other wholes that share a part.

### 6.5 `group`

**Input:** a `families.json` entry with `kind: "set"` containing the card, plus a `rules.json` entry with `strategy: "group"`.

**Semantics:** unlocks every member of the set. Unordered, so `excluded` is empty. Covers outfits, wilderness rings, and tierless items that unlock sideways.

### 6.6 `npc-hierarchy`

**Input:** deferred to Phase 7.

The strategy slot exists and the resolution order reserves its position. The only source, TheSeahorsie's page, gives a resolution order (`Pets -> Boss -> Superior -> Normal npc`) and states that NPCs with variants unlock horizontally, but does not state what a foil at a given rank actually grants. That is not enough to specify an unlock, so nothing is specified.

**Until Phase 7 this strategy never matches, and Monster cards resolve `unresolved`.** NPC variant groups can be recorded factually now as `kind: "set"` families; that data is inert without a rule.

This is the one known boundary where a future ruling will need engine work as well as data. It is declared rather than faked.

### 6.7 `unresolved`

**Input:** nothing matched.

Not a failure. Section 8 specifies what it looks like.

---

## 7. Resolution order

```
resolve(cardName, ruleset) -> Resolution
```

1. `ruleset === 'plain-foil'` -> short-circuit, strategy `plain-foil`. Stop.
2. `overrides.json` entry for this card with `mode: "replace"` -> strategy `override` (or the strategy the entry names). Stop.
3. `state-pair`
4. `ladder-down`
5. `components`
6. `group`
7. `npc-hierarchy` (never matches before Phase 7)
8. `unresolved`

Then, whatever resolved: apply every `mode: "annotate"` override for this card, merge the ruleset caveats, and derive the product boundary caveat.

**Matching a step** requires both the factual membership and a rule selecting it. A card in a ladder with no `ladder-down` rule falls through to step 5, not to an answer.

### 7.1 Tie-breaks

A card can belong to several families and several rules can select it. Determinism comes from two fixed rules and a validator, not from ordering luck.

1. **Explicit beats broad.** Within one strategy, a rule selecting by `families`/`statePairs` (explicit id) beats one selecting by `familyTags`/`statePairKinds`.
2. **Equal specificity is a validation error.** Two rules matching the same card at the same strategy and the same specificity fail `validate-rules`. There is no runtime tie-break, because a silent one is a silent wrong answer.

Multiple families of *different* kinds matching one card is fine - the resolution order picks, and the lower-priority family still renders as context.

---

## 8. `unresolved` presentation

This state will be common at launch. It is the app's honesty made visible and gets designed properly in Phase 5, not styled as an error.

A resolution with `strategy: 'unresolved'` carries:

- `unlocks: []` and `excluded: []`. Nothing is claimed in either direction. Not claiming an exclusion matters as much as not claiming an unlock.
- `confidence: 'undecided'`
- `sources: []`
- `family`: populated when the card belongs to one, so the ladder still renders as **context** with no rung marked unlocked or locked.
- `explanation`: the standard undecided copy, not a per-card string.

The view must show, in this order:

1. **The card**, treated the same as any other result. The player is not being told off for searching.
2. **A plain statement** that there is no agreed rule for this card yet.
3. **What is factually known** - the family and its order, rendered neutrally. A player who knows the ladder can reason about it themselves, which is the whole point of a guideline.
4. **The general principles at play** - the three community camps, and the resolution order - presented as principles under discussion, never as a suggested answer for this card. No "it would probably...".
5. **The Discord hand-off.** Direct, useful, and framed as where the decision gets made: this case has not been decided yet, take it to the Discord, and it can be recorded here once it is. Link out, plus the suggest-a-rule link.

A player landing here should feel informed, not stonewalled. They arrive knowing more than they did: that their case is genuinely open, what the competing positions are, and where to settle it.

---

## 9. Confidence

| Value | Criteria |
|---|---|
| `sourced` | At least one recorded source supports the ruling and no recorded source contradicts it. |
| `contested` | Sources exist but disagree, or the only source is actively disputed in the community. An answer is still given, flagged as contested, with the disagreement stated. |
| `undecided` | No rule exists. Reserved for `unresolved`. |

Schema-enforced: a `rules.json` entry may only declare `sourced` or `contested`. `undecided` cannot be authored onto a rule - it is reachable only through `unresolved` or a deliberate-refusal override.

Composition, when several confidences meet in one resolution: **the lowest wins.** Ruleset confidence, rule confidence, and any annotate-override confidence combine to the weakest. `extreme` at `contested` therefore caps every result under that ruleset at `contested`, which is correct while its source is a secondhand summary.

Confidence never rises through composition. An `annotate` override may lower it; nothing raises it.

---

## 10. The `Resolution` contract

Refines the sketch in `phased_plan.md`. Deltas are listed below the type.

```ts
resolve(cardName: string, ruleset: Ruleset): Resolution

type Ruleset = 'standard' | 'extreme' | 'plain-foil'

type Strategy =
  | 'override' | 'state-pair' | 'ladder-down' | 'components'
  | 'group' | 'npc-hierarchy' | 'plain-foil' | 'unresolved'

type Action =
  | 'wear' | 'wield' | 'use'
  | 'mine' | 'chop' | 'catch' | 'plant'
  | 'smelt' | 'smith' | 'cook' | 'craft' | 'fletch'

type Resolution = {
  card: Card
  ruleset: Ruleset
  strategy: Strategy
  unlocks: Array<{ card: Card; actions: Action[]; note?: string }>
  excluded: Card[]              // tiers ABOVE - shown explicitly as still locked
  explanation: string           // plain English, the "why"
  caveats: string[]
  confidence: 'sourced' | 'contested' | 'undecided'
  sources: Source[]
  family?: FamilyContext        // for the ladder visual; present even when unresolved
  ruleId?: string               // which rules.json entry fired, for debugging and validation
}

type Source = {
  kind: 'brief' | 'decision' | 'community' | 'wiki' | 'game-data'
  label: string
  url?: string
  decision?: string             // DEC-NNNN, required when kind is 'decision'
  quote?: string
  retrieved?: string            // YYYY-MM-DD
}
```

**Deltas from the plan's sketch:**

- Added `'plain-foil'` to `Strategy`. The plan calls it a first-class answer but omitted it from the union.
- Added `ruleset`, so a resolution round-trips into a share link without the caller tracking it.
- Added optional `family`, so the ladder visual renders as context under `unresolved` without the UI re-deriving it.
- Added optional `ruleId`.
- `sources` is `[]` under `unresolved`, never absent.

`resolve()` never throws for an unknown card name; an unrecognised name returns `unresolved` with no `card`-derived context. The Phase 3 sweep over all 6,376 names asserts this.

### 10.1 Explanation templating

`explanation` is authored per rule as data. The engine interpolates a fixed placeholder set and nothing else:

`{card}` `{family}` `{lowest}` `{highest}` `{count}` `{excludedCount}`

No conditionals, no loops, no expressions. If a ruling needs prose the templates cannot express, it belongs in an override with a literal explanation.

---

## 11. Worked examples

### Foil Rune full helm - `ladder-down`

```json
// families.json
{
  "id": "full-helm",
  "label": "Full helms",
  "kind": "ladder",
  "tags": ["armour"],
  "actions": ["wear"],
  "rungs": [
    { "tier": "bronze", "members": ["Bronze full helm"] },
    { "tier": "iron",   "members": ["Iron full helm"] },
    { "tier": "steel",  "members": ["Steel full helm"] },
    { "tier": "mithril","members": ["Mithril full helm"] },
    { "tier": "adamant","members": ["Adamant full helm"] },
    { "tier": "rune",   "members": ["Rune full helm"] }
  ]
}
```

```json
// rules.json -> rules[]
{
  "id": "armour-ladder-down",
  "strategy": "ladder-down",
  "applies": { "familyTags": ["armour"] },
  "explanation": "A foil armour piece unlocks that piece and every tier of it below. {card} covers {count} tiers down to {lowest}. Tiers above stay locked.",
  "confidence": "sourced",
  "sources": [
    { "kind": "brief", "label": "Project brief - downward unlocks", "quote": "Rune full helm -> all full helms Rune and below" }
  ]
}
```

Resolves to `ladder-down`, unlocks all six full helms with `wear`, `excluded: []` (rune is the top rung).

### Foil Iron ore - the product boundary

```json
// families.json
{
  "id": "ore",
  "label": "Ores",
  "kind": "ladder",
  "tags": ["resource"],
  "actions": ["mine", "smelt"],
  "rungs": [
    { "tier": "copper", "members": [{ "card": "Copper ore", "produces": "Bronze bar" }] },
    { "tier": "tin",    "members": [{ "card": "Tin ore",    "produces": "Bronze bar" }] },
    { "tier": "iron",   "members": [{ "card": "Iron ore",   "produces": "Iron bar" }] }
  ]
}
```

`smelt` is a transformation action and Iron bar is not in the unlock set, so the product-boundary caveat fires naming Iron bar. The player gets the verbs on iron and below, and is told plainly they still need the Iron bar card.

### Foil Raw trout - `state-pair` beating `ladder-down`

```json
// state-pairs.json
{
  "id": "trout",
  "label": "Trout",
  "kind": "cook",
  "states": [
    { "card": "Raw trout", "role": "unprocessed", "actions": ["catch"] },
    { "card": "Trout",     "role": "processed",   "actions": ["cook"] }
  ]
}
```

```json
// rules.json -> rules[]
{
  "id": "state-pair-both-states-only",
  "strategy": "state-pair",
  "applies": { "statePairKinds": ["cook", "clean"] },
  "explanation": "A foil on an item with a processed and unprocessed form unlocks both forms of {card} and nothing else. It does not descend the ladder.",
  "confidence": "sourced",
  "sources": [
    { "kind": "decision", "label": "State pairs beat downward unlocks", "decision": "DEC-0001" }
  ]
}
```

Raw trout is also in a fish ladder. Step 3 fires before step 4, so the answer is Raw trout + Trout, with the rest of the fish ladder reported as excluded.

### A family with no rule

A ladder exists, no `rules.json` entry selects it. Steps 3-7 all miss. Result: `unresolved`, `unlocks: []`, `excluded: []`, `family` populated so the ladder renders as neutral context. **Correct behaviour, not a bug.**

---

## 12. Validation

`npm run validate-rules` (Phase 2) enforces, and fails the build on any of:

**Schema**
1. All four data files validate against their schemas.
2. Every `rules.json` and `overrides.json` entry has a non-empty `sources`.
3. No rule declares `confidence: "undecided"`.

**Referential**
4. Every card name in any data file exists in `cards.json`, exact match. A typo here is a silent wrong answer.
5. Every family id and state-pair id referenced by a rule exists.
6. Every `familyTags` / `statePairKinds` value matches at least one family or pair.
7. Every `kind: "decision"` source names a `DEC-NNNN` that exists in `docs/decisions.md`.

**Structural**
8. No duplicate ids within a file.
9. No card appears twice within one ladder.
10. Ladder rung `tier` values are unique within their family.
11. No two rules match the same card at the same strategy and the same specificity (section 7.1).
12. An `annotate` override never raises confidence above what resolved.

**Reporting**
13. A coverage report: how many cards resolve to a strategy vs how many are `unresolved`. That number is a feature and goes on the About page.

---

## 13. Adding a ruling

The done-when for this phase. To add a ruling:

1. Record it in `docs/decisions.md` - ruling, rationale, source, date. It gets the next `DEC-NNNN`.
2. Add the factual data to `families.json` or `state-pairs.json` if it is not already there.
3. Add one entry to `rules.json`: `strategy`, `applies`, `explanation`, `confidence`, `sources` citing the decision or the external source.
4. Run `npm run validate-rules`.

No engine change. No new module. No test that needs rewriting beyond adding the case.

**What does require a code change** - deliberately small, deliberately listed:

| Change | Why it is code |
|---|---|
| A new action verb | The `Action` enum is closed so the UI can render a badge for every value. One enum entry, one label, one icon. |
| A new strategy | A new module in `src/rules/` and a position in the resolution order. |
| The NPC hierarchy data model | Declared unspecified in 6.6. Needs a shape before it needs rules. |
| A ruling where the unlock *set* differs by ruleset | Section 5 fixes rulesets to caveats and action availability. If a source demands otherwise, that is a spec revision with a recorded decision. |
| Changing the resolution order | It is the spec, not configuration. |

---

## 14. Open items

- The Reddit extreme-cardlocked-ironman thread has still not been read; `extreme` is defined from the osrscardexchange framing alone and capped at `contested`. DEC-0004.
- Cosmetic tiers - Gilded, `(t)`/`(g)`, White - deferred to Phase 7. DEC-0003.
- Whether a foil trimmed variant unlocks the trimmed variants of lower tiers. Undecided, and downstream of the cosmetic question.
- The NPC hierarchy data model. Section 6.6, Phase 7.
- Whether the ruleset toggle persists in `localStorage`. UI concern, Phase 4/5.
