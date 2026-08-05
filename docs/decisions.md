# Decisions

Append-only log. Every ruling in `data/rules.json` that is not lifted straight from an external source cites an entry here by id.

## Format

Newest entries go at the **bottom**. Ids are sequential and never reused.

```
### DEC-NNNN - Short title

**Status:** Active | Superseded by DEC-NNNN | Deferred
**Date:** YYYY-MM-DD

**Ruling.** What was decided, stated so it can be implemented without interpretation.

**Rationale.** Why. Including what was rejected and why it lost.

**Source.** Who or what decided it, with a link where one exists.
```

**Entries are never edited or deleted.** A decision that turns out wrong gets a new entry that supersedes it; the old entry has its `Status` line updated to point at the successor, and nothing else about it changes. The reasoning behind a wrong call is worth as much as the call.

A `Deferred` entry records that a question was raised and deliberately left open. It is not a placeholder to be filled in later - the eventual answer gets its own id.

Referenced from data as:

```json
{ "kind": "decision", "label": "Short title", "decision": "DEC-0001" }
```

---

### DEC-0001 - State pairs unlock both states only, and beat downward unlocks

**Status:** Active
**Date:** 2026-07-30

**Ruling.** A foil on an item that has an unprocessed and a processed form unlocks **both forms of that item and nothing else**. It does not descend any ladder the item also belongs to. Foil Raw trout unlocks Raw trout and Trout, not fish below it. Foil Grimy guam leaf unlocks Grimy guam leaf and Guam leaf, not herbs below it.

In the engine this fixes `state-pair` above `ladder-down` in the resolution order.

**Rationale.** An item in a state pair is one item in two forms, not two rungs of a progression - unlocking the cooked form is finishing the item you pulled, not advancing down a ladder. Letting the ladder also fire would turn a single fish into most of the fishing skill, which is the kind of over-reach that costs the app its credibility.

This supersedes the osrscardexchange claim that a foil fish unlocks all fish caught the same way. That claim is recorded as community input, not as an adopted rule.

Rejected: running both strategies and unioning them. It makes the answer depend on curation order and leaves no way to say "the pair stopped the descent", which is exactly what the player needs to see.

**Source.** the maintainer, project brief. Recorded in `phased_plan.md` under "Rules decided so far - State pairs". Contradicts [osrscardexchange - Foil cards: what people say](https://www.osrscardexchange.com/blog/foil-cards-what-people-say).

---

### DEC-0002 - Unsourced cases resolve to `unresolved`, enforced by schema

**Status:** Active
**Date:** 2026-07-30

**Ruling.** `sources` is a required, non-empty field on every `rules.json` and `overrides.json` entry. An unsourced rule fails schema validation and cannot ship. Any card with no matching sourced rule resolves to `unresolved`, which is a designed output state with its own presentation, not an error.

The engine has no fallback heuristic and no default strategy. Absence of data produces `unresolved`, always.

**Rationale.** The governing principle of the project, made mechanical. Leaving it as a guideline means it erodes under pressure to raise coverage; making it a schema error means it cannot. A confidently wrong ruling destroys the app's reason to exist, while an honest "not decided yet" is still more useful than what a player has today.

**Source.** the maintainer, project brief. `phased_plan.md`, "Governing principle: do not invent rules".

---

### DEC-0003 - Cosmetic tiers deferred to Phase 7

**Status:** Deferred
**Date:** 2026-07-30

**Ruling.** Whether a stat-identical cosmetic reskin - Gilded, trimmed `(t)`/`(g)`, White - is its own ladder rung or a sibling on its base rung is **not decided**. No rule may assume either answer.

Consequences fixed now:

- The schema expresses both. A rung holds an array of members, so siblings sit together; a separate rung expresses the other answer. Rung placement is the ruling.
- A member may carry `cosmeticOf: "<card>"` as a factual marker that it is a reskin of that card. The marker records game data and does not by itself decide placement.
- Phase 2 reproduces TheSeahorsie's four ladders **exactly as written**, which places Gilded on its own rung above Rune for pickaxes. That is a faithful transcription of the only written source, not an adopted answer to this question.
- Foil trimmed variants unlocking lower trimmed variants stays undecided, downstream of this.

**Rationale.** The two answers give materially different output and there is no source that settles it. TheSeahorsie orders Gilded above Rune, but Gilded is a Rune-stat reskin, so the ordering may be describing rarity or prestige rather than progression - which reading is right is exactly the judgement call the project refuses to make in a build phase.

Deferring costs little because the mechanism is neutral: settling it later is a data edit and a new decision entry, with no engine change. Deciding now would bake a guess into 74+ metal families.

Rejected: adopting siblings on the grounds that stats are what matter. Defensible, but it would make Phase 2 unable to reproduce TheSeahorsie's pickaxe ladder, and breaking the only written spec on a hunch is the failure mode this project exists to avoid.

**Source.** the maintainer, this session. Input: [User:TheSeahorsie/TCG_Foil_Rules](https://oldschool.runescape.wiki/w/User:TheSeahorsie/TCG_Foil_Rules), which orders pickaxes `Crystal > 3rd age > Dragon > Gilded > Rune`.

---

### DEC-0004 - `extreme` defined from the osrscardexchange framing only

**Status:** Superseded by DEC-0034
**Date:** 2026-07-30

**Ruling.** The `extreme` ruleset is defined as: the unlock set is unchanged, but any interaction with a locked source is forbidden, so acquisition verbs on not-yet-unlocked cards are unavailable and the player cannot gather-then-bank ahead of the unlock. `standard` permits gather-then-bank.

`extreme` ships at `confidence: "contested"`, which caps every result under that ruleset at `contested`.

**Rationale.** The [Reddit extreme-cardlocked-ironman thread](https://www.reddit.com/r/2007scape/comments/1v2ozlz/extreme_cardlocked_ironman_ruleset_osrs_tcg/) is the primary source and Reddit blocks tooling from fetching it. Rather than leave `extreme` undefined - which would return `unresolved` for every card under that ruleset and make the toggle useless - it is defined from the secondhand summary that *is* sourced, and flagged as contested so the output never claims more authority than the source supports.

Rejected: defining it from inference about how ironman rulesets usually work. That is inventing a rule.

**Source.** [osrscardexchange - Foil cards: what people say](https://www.osrscardexchange.com/blog/foil-cards-what-people-say), the ruleset-dependent camp. Decision to proceed on that basis alone: the maintainer, this session.

**Open.** The Reddit thread still needs a manual read. When it is read, a new entry either confirms this definition and raises confidence, or supersedes it.

---

### DEC-0005 - Resource unlocks grant verbs, not downstream products

**Status:** Active
**Date:** 2026-07-30

**Ruling.** A foil resource unlocks the relevant verbs for that resource and everything below it, and does **not** unlock the item those verbs produce. Foil Iron ore grants mine and smelt on iron ore and below; the player still needs the Iron bar card to do anything with the bar.

Mechanically: when a resolution grants a transformation action (`smelt`, `smith`, `cook`, `craft`, `fletch`) on a card whose product is a card outside that resolution's own unlock set, the engine attaches the product-boundary caveat and the result view shows it as a boundary rather than a footnote.

**Rationale.** From the brief. Pinned as its own entry because it is the mechanism the whole action vocabulary exists to serve - without it the app is a list of item names, and a player would reasonably read "unlocks iron" as covering the bar.

Deriving the caveat from the action class rather than authoring it per rule keeps it correct in both directions: it fires for foil Iron ore, and correctly stays silent for foil Raw trout, where `cook` produces Trout and Trout is already in the unlock set.

**Source.** the maintainer, project brief. `phased_plan.md`, "Rules decided so far - From the project brief".

---

### DEC-0006 - Cosmetic tiers resolved: White and Gilded are their own rungs

**Status:** Active (supersedes the deferral in DEC-0003)
**Date:** 2026-07-31

**Ruling.** White armour is its own rung, sitting `Black < White < Mithril`, in every metal-tier armour ladder where a White piece exists: full helm, platebody, platelegs, plateskirt, kiteshield, sq shield, chainbody, med helm, boots, gloves, longsword, 2h sword, dagger, mace, battleaxe, claws, halberd. A foil White piece unlocks White and everything below (Black downward); a foil Black piece does not unlock White.

Gilded is its own rung above Rune (`Rune < Gilded`, below Dragon where a Dragon tier exists), in every family where a Gilded piece exists: full helm, kiteshield, chainbody, med helm, boots, platebody, platelegs, plateskirt, sq shield, 2h sword, and the three dragonhide armour pieces (body, chaps, vambraces). A foil Gilded piece unlocks Gilded and everything below, down to bronze.

Trimmed `(t)` armour would unlock the full trimmed set rather than descending - but no `(t)` cards exist anywhere in `Card.json`, so this half of the ruling has no data to apply to and is recorded for when the plugin adds them.

**Rationale.** This is the question DEC-0003 deferred, settled directly by the maintainer rather than inferred from a forum page - per the maintainer's instruction on 2026-07-31, no ruling in this project cites public-forum material as its source going forward. Existing forum-sourced rules already shipped (the four TheSeahorsie ladders, the ruleset definitions) are left as they are; only new rulings are affected.

The mechanism needed no engine change: `armour-ladder-down` and `weapon-ladder-down` already select by `familyTags: ["armour"/"weapon"]`, so adding the White and Gilded rungs to the existing family data is sufficient - this decision is what licenses that data edit, per DEC-0003's own wording that "rung placement is the ruling".

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0007 - Dragonhide armour ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Dragonhide armour (body, chaps, vambraces) descends the colour tier the same way metal armour descends: `Green < Blue < Red < Black < Gilded` (Gilded per DEC-0006, where it exists). A foil piece unlocks that colour and every colour below it, for that piece only.

This is new `families.json` ladder data (three new families, tagged `armour`), not a new rule - `armour-ladder-down` already covers any family tagged `armour`.

**Rationale.** Same shape as the brief's own worked example (a metal-tier piece progression), just gated on this decision because the brief's wording is about metal tiers specifically and dragonhide wasn't in Phase 2's built-out list.

The god-alignment recolours of Black d'hide body (Ancient, Armadyl, Bandos, Guthix, Saradomin, Zamorak) are left out of the ladder - they are cosmetic minigame rewards with no established rank relative to Black or each other, and ruling on them without a source would be a guess. They stay `unresolved`.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0008 - Elemental/catalytic rune ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The elemental and catalytic rune ladder (`Air < Mind < Water < Earth < Fire < Body < Cosmic < Chaos < Astral < Nature < Law < Death < Blood < Soul < Wrath`) descends. A foil rune unlocks every rune below it in this order.

New `rules.json` entry selecting the existing `rune` family by explicit id.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0009 - Combination runes form their own descending ladder

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Combination runes (Mist, Dust, Mud, Smoke, Steam, Lava) unlock other combination runes and follow the downward unlock rule among themselves - they do not connect to the elemental rune ladder (DEC-0008) or unlock their component elemental runes. Rung order is fixed by their Runecrafting level requirement: `Mist (6) < Dust (10) < Mud (13) < Smoke (15) < Steam (19) < Lava (23)`.

New `families.json` ladder family `combination-rune`, plus a new `rules.json` entry selecting it by explicit id.

**Rationale.** the maintainer's ruling explicitly rejects the "breaks down into components" reading that a combination rune's dual nature might suggest - the wiki confirms there is no in-game mechanism to physically split one back into its two elemental runes, so `components` would have had no factual basis anyway. Runecrafting level is used as the ordering key because it is the only factual, game-derived tier signal available; the pairing itself (which two elements) is not an ordering.

**Source.** the maintainer, this session (2026-07-31). Runecrafting levels: OSRS Wiki, Combination runes.

---

### DEC-0010 - Plank ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The plank ladder (`Plank < Oak plank < Teak plank < Mahogany plank`) descends. A foil plank unlocks every plank below it.

New `rules.json` entry selecting the existing `plank` family by explicit id.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0011 - Unenchanted jewellery ladders descend, by piece type

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Each unenchanted jewellery ladder - ring, necklace, amulet, bracelet - descends independently by gem tier (`gold < opal < jade < ... < zenyte`, per the existing family data). A foil piece unlocks every piece of the *same* type below it: foil Diamond ring unlocks rings below diamond, not necklaces or amulets. Enchanted jewellery is out of scope - these families already hold only the unenchanted base pieces.

New `rules.json` entry selecting `ring`, `necklace`, `amulet`, `bracelet` by explicit id.

**Rationale.** The brief's downward-unlock rule is stated for metal armour/weapon tiers; jewellery is a different item shape (a gem set into a mould, not a material reforged), so it needed its own ruling rather than inheriting the brief's rule by analogy. The maintainer's ruling makes it explicit rather than assumed.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0012 - State-pair rule widened to cut gems and tanned hides

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The state-pair rule (DEC-0001: both states unlocked, no ladder descent) is widened from `cook`/`clean` to also cover `cut` (uncut gem / cut gem, 10 pairs) and `tan` (raw hide / tanned leather, 6 pairs including the three dragonhide-to-dragon-leather pairs and cowhide-to-leather). A foil Uncut diamond unlocks Uncut diamond and Diamond, not other gems; a foil Cowhide unlocks Cowhide and Leather, not other hides.

Mechanically: `state-pair-both-states-only`'s `applies.statePairKinds` gains `"cut"` and `"tan"`. No new rule, no engine change.

**Rationale.** DEC-0001 was scoped to `cook` and `clean` because that was as far as the worked example went at the time, not because `cut` and `tan` were considered and excluded. The maintainer confirms the same reasoning applies: a gem or a hide with two forms is one item finished, not a rung descended. This also means the standalone `gem` ladder and the jewellery ladders (DEC-0011) never compete with this rule in practice for cut/uncut cards, since state-pair is checked before ladder-down in the resolution order.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0013 - Named community sets unlock as a group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil piece of any of the following sets unlocks every other piece in that same set. Each is its own group - membership does not cross between sets.

- **Wilderness rings:** Ring of the gods, Treasonous ring, Tyrannical ring.
- **Graceful outfit:** Graceful hood, top, legs, gloves, boots, cape. (The Graceful crafting kit is a separate recolour item, not a set piece - only the default-colour pieces are cards at all.)
- **Skilling outfits**, each its own group: Angler (hat, top, waders, boots), Lumberjack (hat, top, legs, boots), Prospector (helmet, jacket, legs, boots), Rogue (mask, top, trousers, gloves, boots), Farmer's (strawhat, jacket, boro trousers, boots), Pyromancer (hood, garb, robe, boots), Zealot's (helm, robe top, robe bottom, boots), Carpenter's (helmet, shirt, trousers, boots), Smiths (tunic, trousers, gloves, boots), Shayzien (hood, scarf, banner).
- **3rd age**, split by combat style into four separate groups: melee (platebody, platelegs, plateskirt, kiteshield, full helmet, longsword, cloak), range (range coif, range top, range legs, bow, vambraces), mage (robe top, robe, mage hat, wand, amulet), druidic (druidic cloak, druidic robe bottoms, druidic robe top, druidic staff). 3rd age axe and pickaxe are excluded - they stay in the existing `seahorsie-ladders` ladder-down rule, unaffected.
- **Crystal armour:** Crystal helm, Crystal body, Crystal legs.
- **Crystal weapons:** Bow of faerdhinen, Blade of saeldor.
- **Void Knight equipment:** Void knight gloves, Void knight robe, Void knight top, Void mage helm, Void melee helm, Void ranger helm (any one helm interchangeable with the other two for set purposes).
- **Elite void:** Elite void robe, Elite void top - kept as its own group, separate from regular Void Knight equipment, since the helms and gloves are shared between the two tiers rather than duplicated.

New `families.json` `kind: "set"` entries, tagged `community-set`, plus one new `rules.json` entry with `strategy: "group"` selecting `familyTags: ["community-set"]`.

**Rationale.** These are all cases TheSeahorsie's page gestures at generically ("if the item is part of a group, unlock the group") but per the maintainer's instruction this round no ruling cites that page - each grouping here is the maintainer's own call, made item by item rather than inferred from the forum wording. 3rd age's split into four groups rather than one, and the amulet/cloak/vambraces assignment to mage/melee/range respectively, and Elite void's separation from regular Void, are all judgement calls the maintainer made explicitly rather than obvious lookups.

Godswords (hilt + blade as `components`) were raised and put on hold - not decided this round.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0014 - Camdozaal vault lockboxes unlock as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Simple lockbox, Elaborate lockbox, and Ornate lockbox unlock each other as a flat group - any one unlocks the other two, direction does not matter. Forgotten lockbox (from Yama's vaults, a different reward entirely despite the shared name) is not part of this group and stays `unresolved`.

New `families.json` `kind: "set"` entry tagged `community-set` - the existing `community-set-group` rule (DEC-0013) already covers it, no new rule needed.

**Rationale.** the maintainer's own account holds the Ornate lockbox as a foil; the question of what it should unlock surfaced this ruling directly. Initially read as a possible downward-unlock ladder (Simple < Elaborate < Ornate, matching the wiki's display order), the maintainer confirmed it is a flat group instead - the three are reward-tier variants of the same container, not a stat progression.

**Source.** the maintainer, this session (2026-07-31). Card check: OSRS Wiki, Camdozaal Vault.

---

### DEC-0015 - Achievement diary tiered reward items descend, as a general principle

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Every achievement-diary reward item that ships in four numbered tiers (Easy/Medium/Hard/Elite, represented in `Card.json` as `<item> 1`..`<item> 4`) follows the same downward-unlock rule as metal armour: a foil of a higher tier unlocks that tier and every tier below it. This is a **general principle**, not a per-item ruling - it covers every card series of this shape, named or not.

Confirmed series, all four tiers present in `Card.json`: Rada's blessing, Explorer's ring, Desert amulet, Fremennik sea boots, Ardougne cloak, Falador shield, Karamja gloves, Kandarin headgear, Morytania legs, Varrock armour, Wilderness sword, Western banner.

New `families.json` ladder families (12), tagged `diary-reward`, plus one new `rules.json` entry (`diary-reward-ladder-down`) selecting that tag.

**Rationale.** Raised via Rada's blessing specifically; the maintainer's ruling was stated as covering the whole shape rather than that one item, which is why this entry lists every matching series found in the shipped card data rather than adding them one at a time.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0016 - The Barronite mace network: two separate flat groups, not one chain

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Two unrelated flat groups, not a `components` chain:

- **Barronite mace crafting components**, among themselves only: Barronite guard, Barronite handle, Barronite head. A foil of one unlocks the other two. None of the three unlock the assembled Barronite mace, and the mace does not unlock them - the mace is a one-way, non-reversible assembly (confirmed: it cannot be broken back down in-game, only exchanged for currency).
- **Barronite mace and its reward-pool siblings**, a separate flat group of seven: Barronite mace, Ancient globe, Ancient astroscope, Ancient carcanet, Ancient ledger, Ancient treatise, Imcando hammer. Any one of the seven unlocks all the others.

New `families.json` `kind: "set"` entries (`barronite-components`, `barronite-mace-rewards`), both tagged `community-set` - no new rule needed, DEC-0013's rule already covers the tag.

**Rationale.** This is the case that ruled out `components` as the mechanism generally, not just for godswords (still on hold): a whole and its parts are not automatically a two-way relationship even when the parts are the only way to obtain the whole. The maintainer's ruling keeps possession (the crafting materials) and completion-reward pool (the finished set of Fossil Island unlock items) as genuinely separate questions.

**Source.** the maintainer, this session (2026-07-31). Component list: OSRS Wiki, Barronite mace.

---

### DEC-0017 - Fire cape / Infernal cape descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Infernal cape unlocks Fire cape below it; Fire cape does not unlock Infernal cape. The TzHaar Fight Cave cape has no card in `Card.json`, so this is a two-rung ladder, not three.

New `families.json` ladder family `fire-infernal-cape`, plus a new `rules.json` entry (`fire-cape-ladder-down`) selecting it by explicit id.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0018 - Fremennik rings unlock as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Berserker ring, Archers ring, Warrior ring, and Seers ring - the four same-tier Fremennik combat rings - unlock each other as a flat group.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0019 - Barbarian Assault reward equipment unlocks as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The eight Barbarian Assault reward-shop equipment pieces unlock each other as a flat group: Fighter hat, Ranger hat, Healer hat, Runner hat, Fighter torso, Penance skirt, Runner boots, Penance gloves.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0020 - Obsidian armour unlocks as a flat group; cape and Toktz- weapons excluded

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Obsidian helmet, Obsidian platebody, and Obsidian platelegs unlock each other as a flat group. Obsidian cape is explicitly excluded (it is a Fire cape recolour, not part of this set). The Toktz- weapons (Toktz-xil-ak, Toktz-mej-tal, Toktz-xil-ek, Toktz-ket-xil) are excluded and shelved, not ruled on this round.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** the maintainer, this session (2026-07-31).

---

### DEC-0021 - Avernic defender joins the defender ladder; Mooleta explicitly excluded

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Avernic defender is the new top rung on the existing `defender` ladder, above Dragon: a foil Avernic defender unlocks the whole ladder down to Bronze. Mooleta - a shield-slot off-hand item the OSRS Wiki groups under "defenders" in its infobox template - is explicitly **not** part of this ladder; it is a mechanically distinct item (an "Other" category on the wiki's own defenders template, not part of the bronze-to-dragon-to-avernic tier chain) and stays `unresolved`. The Avernic defender hilt and the Dragon/Rune defender ornament kits are also excluded, as components/cosmetics not ruled on this round.

This is a data-only change - the `defender` family is already tagged `armour`, so the existing `armour-ladder-down` rule already covers it; no new `rules.json` entry needed.

**Rationale.** Mooleta's wiki categorisation is a trap for exactly this kind of ruling: it presents as a defender but isn't one mechanically (different stats, different acquisition, the wiki's own template marks it "Other"). Recording the exclusion explicitly, rather than leaving it silently absent, is the point - a future session should not assume it belongs just because a card search turns it up next to "defender".

**Source.** the maintainer, this session (2026-07-31). Mooleta confirmed via OSRS Wiki as wiki-adjacent but not part of the tier chain.

---

### DEC-0022 - NPC hierarchy, first case: a foil boss unlocks the boss plus its uniques

**Status:** Active (first case only - the general NPC hierarchy data model remains unspecified, per rules-spec section 6.6)
**Date:** 2026-07-31

**Ruling.** A foil of a boss NPC, or a foil of one of that boss's unique drops, unlocks the boss and every one of its uniques as a flat group. Ruled as a general principle ("this applies to every boss in the game"), but built out for one boss only this round: **General Graardor**, unlocking General Graardor, Bandos chestplate, Bandos tassets, Bandos boots, Bandos hilt, Godsword shard 1, Godsword shard 2, and Godsword shard 3. The three Godsword shards are included even though they are not exclusive to Graardor - all four Godwars Dungeon generals drop them - because the maintainer confirmed they should be, on the reading that Graardor is still a valid source for them, not that they belong to him alone.

What a foil of a *unique item itself* unlocks (as opposed to a foil of the boss) was raised and explicitly deferred - "we will come back to" - so is not decided beyond following the same flat-group membership recorded here.

Mechanically, this needed no `npc-hierarchy` engine work at all: it is expressed as an ordinary `kind: "set"` family (`boss-general-graardor`) tagged `boss-group`, with one new `rules.json` entry (`boss-group`) selecting that tag via the existing `group` strategy. This is a deliberate choice, not a resolution of section 6.6 - `npc-hierarchy` remains unspecified, and this ruling works around that gap rather than filling it: it says nothing about NPC variant hierarchy (Pets > Boss > Superior > Normal), horizontal unlocks, or any boss whose uniques should NOT include the boss itself.

**Rationale.** The full NPC/boss domain is explicitly out of MVP scope and project-sized on its own (phased_plan.md, "Monster and NPC domain"). Rather than leave a real, concrete case on the table because the general model isn't built, this ruling establishes the pattern - boss + uniques as a `boss-group`-tagged set - that future sessions can repeat per boss without more engine work, while leaving the harder questions (variant hierarchy, what a foil unique alone grants, whether every boss's group should include the boss itself) genuinely open.

**Source.** the maintainer, this session (2026-07-31). Uniques list: OSRS Wiki, General Graardor.

---

### DEC-0024 - Tiered utility items descend like armour and weapons

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Six ladder families that had no rule now descend under the ordinary downward-unlock reading: `cannonball`, `coffin`, `locks`, `nails`, `limbs` and `keel-parts`. A foil of one unlocks that tier and every tier below it in the same family, and nothing above.

**Rationale.** Each is a metal-tier progression with the same shape as the armour and weapon ladders already covered by DEC-0002's downward reading. Nothing about them argues for different treatment, and leaving them unresolved was an accident of coverage rather than a judgement that they were hard. They are given their own `families` selectors rather than a shared tag because they carry no common tag today and inventing one would imply a category that does not otherwise exist.

**Source.** the maintainer, this session (2026-07-31), ruling each family in turn.

---

### DEC-0025 - Keys unlock across eyelet colours at their own tier

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil key unlocks every eyelet colour of a key at that same tier, and nothing above or below. A foil Bronze key black unlocks the bronze key in all five colours (black, brown, crimson, purple, red). The tiers are bronze, steel, black, silver, gold.

This replaces the five per-colour ladder families (`key-black`, `key-brown`, `key-crimson`, `key-purple`, `key-red`) with five per-tier set families (`keys-bronze`, `keys-steel`, `keys-black`, `keys-silver`, `keys-gold`), each tagged `key-tier`, selected by one `group` rule.

**Rationale.** The colour is an eyelet variant, not a progression step - the five colours at a tier are the same key. Modelling them as five colour ladders made the tier the thing you climb and the colour the thing you are locked into, which is backwards. Restructuring the data was preferred over adding a new `tier-group` strategy to the engine: the existing `group` strategy already expresses "these unlock together" exactly, and a new strategy would have needed spec, engine and validator work to say the same thing. The per-colour ladders are removed rather than left in place, because a ladder no rule descends is the failure mode DEC-0026 was written to stop.

**Source.** the maintainer, this session (2026-07-31): "so it goes bronze, steel, black, silver, gold. Any of these keys unlocks all of its colours".

---

### DEC-0026 - A state pair reports a stopped ladder only when a rule would have descended it

**Status:** Active (amends rules-spec section 6.2)
**Date:** 2026-07-31

**Ruling.** When a `state-pair` resolution looks for the ladder it stopped, it considers only ladders that a `ladder-down` rule actually selects. A ladder family that exists as factual ordering but that no rule descends is not reported: no `family` context, no `excluded` list.

In practice this means foil Zenyte, Uncut ruby, Grimy torstol and Green dragonhide now answer with their two states alone. The gem, herb, dragonhide and dragon-leather ladders are no longer drawn beneath them.

**Rationale.** Section 6.2's excluded list exists so a player can see what the pair cost them - "the player needs to see that the state pair stopped the descent". That justification only holds where a descent would otherwise have happened. The gem, herb, dragonhide and dragon-leather families carry no `ladder-down` rule at all, so nothing was ever going to descend and the pair stopped nothing.

Reporting them anyway produced a screen that contradicted itself: foil Zenyte drew the full ten-rung gem ladder with nine rungs marked "still locked", implying nine gems were forfeited, while the unlock section directly below it said "On Uncut zenyte, and nothing else". The partner card was pushed into that footnote precisely because it is not a member of the ladder being drawn. Both statements were generated from the same correct unlock set; only the framing was wrong.

The precedence of `state-pair` over `ladder-down` (DEC-0001) is untouched. Raw trout still stops a fish ladder if one is ever given a rule, and the excluded list still fills in that case. What changed is only which ladders count as stopped.

**Source.** the maintainer, this session (2026-07-31): "this logic shouldnt even be touching them, it should just be state pair for all gems, cut or uncut", and the same for herbs.

---

### DEC-0027 - Godswords unlock the godsword, its hilt, all shards, and the blade, as components

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil godsword (Bandos, Armadyl, Saradomin or Zamorak) unlocks the godsword itself, its own hilt, all three godsword shards, and the assembled Godsword blade. A foil of a shard or the blade alone does not unlock the godsword back - see DEC-0028 for what a foil hilt alone does, which is a different answer.

Modelled as a `components` family per god (`bandos-godsword`, `armadyl-godsword`, `saradomin-godsword`, `zamorak-godsword`), replacing the previous `bandos-hilt-group` `set` family, which existed for Bandos only and left the other three gods with no rule at all. The `hilt-group` rule and tag are retired; a new `godsword-components` rule selects the four families via a shared `godsword` tag through the existing `components` strategy.

**Rationale.** The three shards (and the blade assembled from them) are the same physical items across all four gods - shard 1 is not a Bandos shard or an Armadyl shard, it is a shard. Modelling each god as a `group` (`set`) family containing the shards, as the old Bandos-only entry did, works only in isolation: once a second god-family also lists the same shard cards as members, `matchFamily`'s tag-based lookup returns whichever candidate family sorts first alphabetically, not the one the player actually foiled toward. `components` sidesteps this by design - rules-spec 6.4 fires it only when the searched card is the *whole*, so a foil shard or blade never resolves through this rule at all, and the four-way collision never happens. What a bare foil shard or blade unlocks by itself is not decided by this ruling and falls to `unresolved`.

Ancient godsword and Ancient hilt are excluded here. Whether they follow the same shard-combination mechanic as the four GWD generals is uncertain and not investigated as part of this ruling.

**Source.** the maintainer, this session (2026-07-31): "Godswords unlock the godsword, respective hilt and all shards", clarified to include the assembled Godsword blade card alongside the shards.

---

### DEC-0028 - A foil godsword hilt unlocks only itself and the godsword

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil godsword hilt (Bandos, Armadyl, Saradomin or Zamorak) unlocks itself and the completed godsword only - not the shards, not the Godsword blade. This is narrower than what a foil of the completed godsword grants (DEC-0027): the relationship is not symmetric.

Modelled as a second `components` family per god (`bandos-hilt-godsword`, `armadyl-hilt-godsword`, `saradomin-hilt-godsword`, `zamorak-hilt-godsword`), each with the hilt as `whole` and the godsword as its only `part`. A new `godsword-hilt-components` rule selects these via a `godsword-hilt` tag. The hilt is the `whole` of this family and a `part` of its god's `godsword` family from DEC-0027 at the same time; `matchFamily` filters composite candidates to where the searched card equals that family's `whole`, so the two families do not collide - foiling the hilt matches only the hilt-family, foiling the godsword matches only the godsword-family.

**Rationale.** the maintainer's phrasing was explicit and asymmetric: "a foil godsword hilt unlocks the hilt and godsword, not the blades" against "a foil godsword would unlock the godsword, hilt and blades" - two different unlock sets depending on which card is foiled, not one mutual set. This is a deliberate departure from the symmetric shape every other `components` family in this dataset has used so far (Barronite mace, DEC-0016) and is worth naming as its own decision rather than folding into DEC-0027, since a future session reading DEC-0027 alone would otherwise reasonably assume the hilt granted everything the godsword does.

A foil shard or foil Godsword blade alone is still not decided and still resolves `unresolved`.

**Source.** the maintainer, this session (2026-07-31): "I would say a foil godsword hilt unlocks the hilt and godsword, not the blades. A foil godsword would unlock the godsword, hilt and blades." "Blades" confirmed to mean both the three shards and the separate Godsword blade card.

---

### DEC-0029 - Enchanted jewellery unlocks itself, its unenchanted base, and every charge tier

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil enchanted jewellery item (e.g. Amulet of glory, Ring of wealth) unlocks: itself, the unenchanted base item it was made from (e.g. Sapphire amulet), and every charge variant of that same enchanted item (uncharged through to its highest charge count). It does not descend the wider gem-tier ladder (DEC-0011) - enchantment breaks that ladder.

No cards of this shape exist in the current plugin dataset yet, so this rule is not yet instantiated in `data/rules.json`. It is recorded now so the shape is settled before such cards are added.

**Rationale.** Enchanted jewellery is a distinct item line from its unenchanted base once enchanted, but charge count is cosmetic to what the item unlocks, not a separate tier - all charges of the same enchanted item are the same card family. Unlike unenchanted jewellery, enchantment does not chain to other gems' enchanted versions.

**Source.** the maintainer, this session (2026-07-31): "Itself, unenchanted base and all charged values, i.e. 1 charge, 2 charges etc."

---

### DEC-0030 - Trimmed and gilded armour form their own descending sets, separate from the plain ladder

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil trimmed (t) armour piece unlocks the trimmed set - that piece and every trimmed tier below it - not the plain ladder. A foil gilded (g) piece unlocks the gilded set the same way. Trimmed and gilded each form their own independent descending ladder, mirroring the plain armour-ladder-down shape (DEC-0007 / `armour-ladder-down`) but not chaining into it or into each other.

No (t) or (g) cards exist in the current plugin dataset, so this rule is not yet instantiated in `data/rules.json`. Recorded now so the shape is settled before such cards are added.

**Rationale.** Supersedes the "moot and unanswered" framing this question had under DEC-0003/`trimmed-variants`. Trim and gild are their own progression, not a plain-armour with a coat of paint, so they get their own ladder rather than inheriting or feeding the plain one - consistent with how Cosmetic tiers (White/Gilded, DEC-0006) were already treated as their own rungs.

**Source.** the maintainer, this session (2026-07-31): "trimmed and gilded items unlock their respective set."

---

### DEC-0031 - A foil boss unique, on its own, unlocks the same boss group as foiling the boss

**Status:** Superseded by DEC-0036
**Date:** 2026-07-31

**Ruling.** Foiling one of a boss's unique drops unlocks the same `boss-group` as foiling the boss card itself - the relationship is symmetric, matching DEC-0022. This was already the engine's behaviour (the `group` strategy matches on family membership, not on which member card was foiled) since uniques are listed as members of the `boss-group`-tagged family alongside the boss; this entry confirms it's the intended ruling rather than an accident of the implementation.

**Rationale.** Resolves the question left open at DEC-0022. Bosses and their uniques are a single named set either way you enter it, consistent with how every other `group` family in this dataset behaves (community sets, DEC-0013; Camdozaal lockboxes, DEC-0014).

**Source.** the maintainer, this session (2026-07-31): "Unlocks the whole boss group."

---

### DEC-0032 - NPC hierarchy ranks do not cascade; each rank unlocks only itself and its recolour set

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The Pet -> Boss -> Superior -> Normal npc order from TheSeahorsie's page is a resolution-order ranking, not an unlock ladder. Foiling an NPC at a given rank does **not** unlock the ranks below it - a foil pet does not unlock its boss, a foil boss does not unlock its superior or normal forms, and so on. Each rank unlocks only itself plus its horizontal recolour siblings at that same rank (e.g. foiling one Elemental wizard colour unlocks the other Elemental wizard colours, all still Normal-rank; it does not touch the superior variant).

Horizontal recolour sets are a flat `group` (unordered, symmetric) - foiling any one recolour unlocks every recolour in that set, same mechanics as DEC-0013/DEC-0022. Per the source, a recolour set does not include that NPC's superior variant; the superior sits in its own recolour set (if it has one) at its own rank.

**Engine implication.** This removes the need for a distinct `npc-hierarchy` strategy with cross-rank logic. Recolour sets can be modelled as ordinary `kind: "set"` / `group`-strategy families, scoped per rank - a `normal-wizard-colours` set is independent of a `superior-wizard-colours` set for the same base NPC, and neither reaches the boss. The `npc-hierarchy` strategy slot in `rules-spec.md` 6.6 and the resolution order (7.7) can be dropped once this lands, in favour of routing recolour sets through the existing `group` step. Boss + uniques (DEC-0022/DEC-0031) already follow this same flat-group shape and don't need to change.

This ruling settles the *shape*; it does not populate the ~1,227 monster cards or their recolour/rank groupings into `data/families.json` - that data-entry work is still outstanding and tracked separately.

**Rationale.** A cascading ladder across pet/boss/superior/normal would mean a foil pet (the rarest, hardest-to-get form) unlocks everything, which does not match how the community actually plays it and was never claimed by the source - the source only ever states an order, not a grant. Treating each rank as its own flat group is the narrower, more defensible reading and reuses machinery the engine already has, rather than adding new cross-rank strategy code for a claim the source doesn't make.

**Source.** the maintainer, this session (2026-07-31): "Each rank unlocks only itself (+ recolours)"; "Yes, flat group" for horizontal recolour unlocks. TheSeahorsie's page confirms the rank order and the horizontal-unlock/superior-exclusion wording (fetched 2026-07-31): "Pets -> Boss -> Superior -> Normal npc"; "Npc's unlock horizontally if they have any"; horizontal unlock does not apply "if you obtained the superior variant instead."

---

### DEC-0033 - DEC-0029 implemented: enchanted jewellery mapped to unenchanted bases

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Corrects an aside in DEC-0029, which assumed no enchanted-jewellery cards existed yet - they do. 27 `components` families were added (tag `enchanted-jewellery`, one rule `enchanted-jewellery-components` selecting all of them), each mapping an enchanted item to the unenchanted gem item it is created from via the standard Enchant spells:

| Gem | Ring | Necklace | Amulet | Bracelet |
|---|---|---|---|---|
| Sapphire | Ring of recoil | Games necklace | Amulet of magic | Bracelet of clay |
| Emerald | Ring of dueling | Binding necklace | Amulet of defence | Castle wars bracelet |
| Ruby | Ring of forging | Digsite pendant | Amulet of strength | Inoculation bracelet |
| Diamond | Ring of life | Phoenix necklace | Amulet of power | Abyssal bracelet |
| Dragonstone | Ring of wealth | Skills necklace (base: Dragon necklace) | Amulet of Glory | Combat bracelet |
| Onyx | *(excluded, see below)* | Berserker necklace | Amulet of fury | Regen bracelet |
| Zenyte | Ring of suffering | Necklace of anguish | Amulet of torture | Tormented bracelet |

**Exception.** Ring of stone (from Onyx ring, per Lvl-6 Enchant) is excluded. Onyx ring is not present in the plugin's card dataset, so no `parts` entry can reference it - the schema requires every referenced card to exist in `cards.json`. Ring of stone therefore has no rule yet and resolves `unresolved` until this is revisited.

The charge-tier half of DEC-0029's ruling (foiling one charge count unlocks all others of the same enchanted item) is not encoded in data: none of these items have separate per-charge cards in the current dataset (e.g. no "Amulet of glory (1)"), so it stays moot in practice, same as the trimmed-variant situation before DEC-0030.

**Rationale.** One `components` family per enchanted item, selected by a shared `enchanted-jewellery` tag, mirrors the godsword pattern (DEC-0027) rather than writing 27 near-identical rule entries.

**Source.** OSRS Wiki, fetched 2026-07-31: [Amulet of glory](https://oldschool.runescape.wiki/w/Amulet_of_glory) ("The amulet of glory is a dragonstone amulet that has been enchanted... the Lvl-5 Enchant spell"); [Lvl-1 Enchant](https://oldschool.runescape.wiki/w/Lvl-1_Enchant), [Lvl-2 Enchant](https://oldschool.runescape.wiki/w/Lvl-2_Enchant), [Lvl-3 Enchant](https://oldschool.runescape.wiki/w/Lvl-3_Enchant), [Lvl-4 Enchant](https://oldschool.runescape.wiki/w/Lvl-4_Enchant), [Lvl-5 Enchant](https://oldschool.runescape.wiki/w/Lvl-5_Enchant), [Lvl-6 Enchant](https://oldschool.runescape.wiki/w/Lvl-6_Enchant), [Lvl-7 Enchant](https://oldschool.runescape.wiki/w/Lvl-7_Enchant) (List of items tables, base -> enchanted result per gem).

---

### DEC-0034 - `extreme`'s definition drops the unread Reddit thread; osrscardexchange stands alone as its source

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Supersedes DEC-0004's rationale, not its ruling - the `extreme` ruleset definition itself is unchanged (unlock set same as `standard`; any interaction with a locked source is forbidden; `confidence: "contested"`). What changes is the citation: the Reddit extreme-cardlocked-ironman thread is dropped from the project entirely rather than carried as an unread "primary source, still needs reading" reference. [osrscardexchange - Foil cards: what people say](https://www.osrscardexchange.com/blog/foil-cards-what-people-say) is now the sole, sufficient source for this ruleset's definition.

**Rationale.** The thread lives on reddit.com, which this project's tooling cannot fetch (blocked by policy, confirmed again this session across direct fetch, a raw JSON endpoint, and two Reddit-mirror sites) and which nobody has manually read since DEC-0004 was written. Carrying an unreadable citation and an open item that can never close on its own is worse than not citing it - it implies a verification path that doesn't exist. `extreme` stays `contested` on its own terms: it is one community reading among several (DEC-0004's `standard`/`extreme`/`plain-foil` three-way split), not because a second source is still pending.

If someone reads the Reddit thread by hand in the future and it says something different, that is new information and gets its own decision entry - this entry closes the "still needs a manual read" loop, it does not pre-empt a future correction.

**Source.** the maintainer, this session (2026-07-31): "Ignore the reddit thread, remove it entirely from this project, we're not relying on it."

---

### DEC-0035 - A foil monster collection-log drop unlocks every unique for that monster

**Status:** Superseded by DEC-0036
**Date:** 2026-07-31

**Ruling.** Extends DEC-0022/DEC-0031's boss + uniques logic to every monster with a collection log, not bosses alone: a foil of any collection-log drop item unlocks every unique tied to that monster's log, as a flat symmetric `group` (foiling any one unique, or the monster itself if it has its own card, reaches every member of the same set). This does not fold ordinary/common drops (drops shared across many monsters, not log-gated) into this shape - only collection-log-tracked uniques count as members of a given monster's set.

This settles the shape; it does not populate specific monster `boss-group`/collection-log `set` families beyond General Graardor (DEC-0022) - that data-entry work is tracked alongside the wider monster/NPC card population (see DEC-0032).

**Rationale.** Generalises the one worked case (General Graardor) into a general principle rather than leaving every other monster's uniques to be ruled on individually later. Matches the existing `group` strategy exactly, so no new engine work is needed - only data entry, same as DEC-0032's recolour sets.

**Source.** the maintainer, this session (2026-07-31): "A foil of a monsters collection log unlocks all uniques for that monster."

---

### DEC-0036 - Correction: a foil boss unique does not unlock the boss, only its sibling uniques

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Supersedes the symmetric framing of DEC-0031 and DEC-0035. The boss-to-unique relationship is one-directional, not symmetric:

- Foiling the **boss** unlocks the boss and every one of its unique drops (unchanged from DEC-0022/DEC-0027's shape - a `components` relationship, boss as `whole`, uniques as `parts`).
- Foiling a **unique drop on its own** unlocks only the *other* uniques from the same boss - not the boss itself. This is its own flat `group` among just the uniques.

General Graardor's unique set also gains **Bandos hilt**, which the original DEC-0022 implementation omitted - foiling General Graardor now unlocks Graardor + Bandos chestplate + Bandos tassets + Bandos boots + Bandos hilt (5 cards, not 4). Kree'arra, Commander Zilyana, and K'ril Tsutsaroth (added this session per DEC-0035) get the same composite + uniques-group pair.

**Exception, already covered elsewhere.** Godsword hilts (Bandos/Armadyl/Saradomin/Zamorak hilt) are each the `whole` of their own `components` family (DEC-0028: hilt unlocks hilt + assembled godsword only). Since `components` resolves before `group` in the strategy order, foiling one of these hilts follows DEC-0028, not this entry's uniques-group - it does not additionally unlock its boss's other armour uniques. This is intentional, not an oversight: DEC-0028 is a specific, already-reasoned ruling for hilts and takes precedence.

**Rationale.** Caught by hands-on testing: foiling Saradomin sword was unlocking Commander Zilyana, which does not match how the community or the maintainer actually reads it - a unique drop proves you can get that unique, not that you've fought the boss enough to be considered to have "unlocked" it in the collection-log sense the boss card represents. The asymmetry mirrors the godsword/hilt shape (DEC-0027/0028) that was already precedent in this dataset: a whole grants its parts, but a part alone does not imply the whole.

**Engine/data implication.** Every `boss-group`-tagged `set` family becomes two families: a `composite` (tag `boss`, boss as `whole`, uniques as `parts`) and a `set` (tag `boss-uniques`, uniques only, boss excluded). Two rules replace the old single `boss-group` rule: `boss-components` (strategy `components`) and `boss-uniques-group` (strategy `group`).

**Source.** the maintainer, this session (2026-07-31), from testing: "Saradomin sword unlocks the boss, it should only unlock the unique drops. General graador should unlock the bandos hilt too."

---

### DEC-0037 - Brutal, normal, and baby chromatic dragons form a descending ladder per colour

**Status:** Active
**Date:** 2026-07-31

**Ruling.** For each of the four chromatic dragon colours (red, green, blue, black), the baby, normal, and brutal variants form a three-rung `ladder-down` family, lowest to highest: baby -> normal -> brutal. Foiling the brutal variant unlocks brutal + normal + baby. Foiling the normal variant unlocks normal + baby (not brutal). Foiling the baby variant unlocks only itself. Four families (`red-dragon-line`, `green-dragon-line`, `blue-dragon-line`, `black-dragon-line`), tag `chromatic-dragon-line`, one shared rule.

This is a different, unrelated ladder to `metallic-dragons` (DEC-0032's flat recolour set of bronze/iron/steel/mithril/adamant/rune) - chromatic and metallic dragons are separate lines with no interaction between them.

**Rationale.** Caught by hands-on testing: baby and brutal variants of the same colour were unresolved, with no rule connecting them to their normal-tier counterpart. The maintainer specified the exact shape - normal unlocks baby too, brutal unlocks both - which is the standard `ladder-down` shape already used throughout this dataset (armour, weapons, cannonballs, etc.), just applied to a monster line instead of an item line.

**Source.** the maintainer, this session (2026-07-31): "Red, Green, Blue, black etc dragons should unlock their baby variants too. Brutal variants of the above dragons unlocks the normal dragon and baby dragon variant."

---

### DEC-0038 - Boss-unique scope policy, and ten more bosses added under the DEC-0036 shape

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Establishes the scope policy for what counts as a "unique" in a boss's `boss`/`boss-uniques` family pair (DEC-0036): pets and jars (and other collection-log trophies of that kind) **are** included as members; tertiary drops that aren't boss-identity items - clue scrolls, brimstone keys, mutagens, key-master teleports - are **not**. Items that merely happen to drop from the boss but are common across many other monsters (e.g. Dragon 2h sword, Dragon pickaxe, Dragon med helm, Mystic robes, Rune warhammer/longsword) are excluded regardless of rarity - they are not boss-identity uniques.

Under this policy and the DEC-0036 shape (boss `composite`: whole=boss, parts=uniques; paired `set` of just the uniques for DEC-0036's sibling-group behaviour), ten more bosses were added, each verified against the OSRS Wiki's own drop tables:

- **Corporeal Beast**: Spirit shield, Holy elixir, Spectral/Arcane/Elysian sigil, Jar of spirits, Pet dark core.
- **Zulrah**: Tanzanite fang, Magic fang, Serpentine visage, Uncut onyx, Jar of swamp, Pet snakeling.
- **Vorkath**: Dragonbone necklace, Draconic visage, Skeletal visage, Vorkath's head, Jar of decay, Vorki.
- **Cerberus**: Primordial/Pegasian/Eternal crystal, Smouldering stone, Jar of souls, Hellpuppy.
- **Kraken**: Kraken tentacle, Jar of dirt, Pet kraken.
- **Thermonuclear smoke devil**: Occult necklace, Smoke battlestaff, Jar of smoke, Pet smoke devil.
- **Alchemical Hydra**: Hydra's eye/fang/heart, Hydra tail, Hydra leather, Hydra's claw, Jar of chemicals, Ikkle hydra.
- **Sarachnis**: Sarachnis cudgel, Jar of eyes, Sraracha.
- **Callisto and Artio** (share one loot pool, two boss cards): Claws of callisto, Voidwaker hilt, Callisto cub, plus Tyrannical ring (via the boss only, see exception below).
- **Venenatis and Spindel** (share one loot pool): Fangs of venenatis, Voidwaker gem, Venenatis spiderling, plus Treasonous ring (via the boss only).
- **Vet'ion and Calvar'ion** (share one loot pool): Skull of vet'ion, Voidwaker blade, Vet'ion jr., plus Ring of the gods (via the boss only).

**Exception - the three wilderness rings.** Tyrannical ring, Treasonous ring, and Ring of the gods are each a `part` of their boss's `composite` family (so foiling the boss still unlocks the ring), but are deliberately left out of the paired `boss-uniques` sibling `set` for that boss. All three rings already belong to the existing `wilderness-rings` community set (DEC-0013/0018), which unlocks them symmetrically among themselves. Adding them to a second `set` family under a different tag would put a card in two `group`-strategy set families at once - `validate-rules`' ambiguity check (section 11) would catch this and fail the build, since a `part` of a composite can appear in unlimited families with no conflict, but a `set` membership cannot be split across two same-strategy rules. Leaving the wilderness-rings ruling as the sole authority for those three rings' sibling behaviour was the simpler, non-conflicting choice, rather than re-opening DEC-0013/0018 to merge the two groups.

**Rationale.** The tertiary-exclusion policy mirrors the general/common-drop exclusion already implicit in DEC-0035/0036 ("not common/shared drops"); pets and jars are boss-identity trophies in the same spirit as armour/weapon uniques, so they're treated the same way rather than carved out as a separate category. The wilderness boss pairs sharing one family pair per boss card (not per pair) keeps each boss individually foilable while the identical unique item set is reused rather than duplicated as data.

**Source.** the maintainer, this session (2026-07-31): "boss uniques unlock the jars and pets but no tertiary items"; approved each boss and the wilderness-pair shape as proposed. OSRS Wiki drop tables, fetched 2026-07-31, for [Corporeal Beast](https://oldschool.runescape.wiki/w/Corporeal_Beast), [Zulrah](https://oldschool.runescape.wiki/w/Zulrah), [Vorkath](https://oldschool.runescape.wiki/w/Vorkath), [Cerberus](https://oldschool.runescape.wiki/w/Cerberus), [Kraken](https://oldschool.runescape.wiki/w/Kraken), [Thermonuclear smoke devil](https://oldschool.runescape.wiki/w/Thermonuclear_smoke_devil), [Alchemical Hydra](https://oldschool.runescape.wiki/w/Alchemical_Hydra), [Sarachnis](https://oldschool.runescape.wiki/w/Sarachnis), [Callisto](https://oldschool.runescape.wiki/w/Callisto), [Artio](https://oldschool.runescape.wiki/w/Artio), [Venenatis](https://oldschool.runescape.wiki/w/Venenatis), [Vet'ion](https://oldschool.runescape.wiki/w/Vet%27ion).

---

### DEC-0039 - Voidwaker's three pieces form a cross-boss assembly group, taking precedence over the boss-uniques group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Voidwaker hilt (Callisto/Artio), Voidwaker blade (Vet'ion/Calvar'ion), and Voidwaker gem (Venenatis/Spindel) each come from a different wilderness boss pair, but assemble into one weapon (Voidwaker). Foiling any of the four cards (the three pieces or the assembled Voidwaker) unlocks all four, as a flat symmetric `group` - crossing boss lines, unlike anything else ruled on so far.

This takes precedence over the ordinary boss-uniques sibling behaviour (DEC-0036/0038) for the three piece cards specifically: foiling Voidwaker hilt unlocks the Voidwaker assembly, not Claws of callisto/Callisto cub. Mechanically this needed no engine change - the `voidwaker-assembly` family is selected by an explicit rule (`rules.json` names the family by id, not by tag), and explicit selection already beats a tag-based ("broad") match per the existing resolution-order rule (docs/rules-spec.md section 7.1). The boss-uniques-group rule still selects each boss's other uniques normally.

**Rationale.** A player who foils one Voidwaker piece cares about assembling the weapon, not about the specific boss that happened to drop that piece - the three pieces are one item's components in every practical sense, closer to the godsword/Barronite mace component patterns (DEC-0016/0027) than to an ordinary boss-uniques sibling set.

**Source.** the maintainer, this session (2026-07-31): "Yes, chain them" - "Foiling one Voidwaker piece unlocks all 3 pieces + assembled Voidwaker, mirroring the godsword shard pattern."

---

### DEC-0040 - Five more bosses added under the DEC-0036/0038 shape

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Under the same policy as DEC-0038 (pets/jars/trophies included; tertiary and common cross-monster drops excluded), the following bosses were added, verified against the OSRS Wiki:

- **Nex**: Ancient hilt, Nihil horn, Torva full helm, Torva platebody, Torva platelegs, Zaryte vambraces, Nexling.
- **The Nightmare and Phosani's Nightmare** (share one loot pool, two boss cards): Nightmare staff, Inquisitor's great helm/hauberk/plateskirt/mace, Eldritch orb, Harmonised orb, Volatile orb, Little nightmare, Jar of dreams.
- **Skotizo**: Dark totem base/middle/top, the assembled Dark totem, Dark claw, Jar of darkness, Skotos. (Shield left half and Uncut onyx excluded - both are shared with other sources; see the onyx note below.)
- **Dawn and Dusk** (Grotesque Guardians, share one loot pool, two boss cards): Granite maul, Granite gloves, Granite ring, Granite hammer, Black tourmaline core, Jar of stone, Noon.

**Known inconsistency, left as-is.** Uncut onyx was included in Zulrah's unique set under DEC-0038, but it also drops from Skotizo (and other sources) - it isn't actually Zulrah-exclusive either, by the same "not common/shared drops" policy DEC-0038 itself states. The maintainer chose to leave Zulrah's entry as already shipped rather than revise it, and Uncut onyx is excluded from Skotizo's set to avoid a two-boss-uniques-set membership conflict. A future session tightening boss-unique accuracy should revisit whether Uncut onyx belongs in Zulrah's set at all.

**Source.** the maintainer, this session (2026-07-31): approved each boss as proposed; "Yes, leave Zulrah as-is" on the onyx inconsistency. OSRS Wiki drop tables, fetched 2026-07-31, for [Nex](https://oldschool.runescape.wiki/w/Nex), [The Nightmare](https://oldschool.runescape.wiki/w/The_Nightmare), [Skotizo](https://oldschool.runescape.wiki/w/Skotizo), [Grotesque Guardians](https://oldschool.runescape.wiki/w/Grotesque_Guardians).

---

### DEC-0041 - Duke Sucellus, The Leviathan, The Whisperer, and Vardorvis added; their shared drops form a cross-boss group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The four Desert Treasure II bosses each get a `boss`/`boss-uniques` pair for their exclusive drops:

- **Duke Sucellus**: Eye of the duke, Magus vestige, Frozen tablet, Ice quartz, Baron.
- **The Leviathan**: Leviathan's lure, Venator vestige, Scarred tablet, Smoke quartz, Lil'viathan.
- **The Whisperer**: Siren's staff, Bellator vestige, Sirenic tablet, Shadow quartz, Wisp.
- **Vardorvis**: Ultor vestige, Strangled tablet, Blood quartz, Butch. (Executioner's axe head is not present in the plugin's card dataset at all, so it is left out entirely - not even unresolved-by-omission, there is no card to resolve.)

All four bosses also share five items - Virtus mask, Virtus robe top, Virtus robe bottom, Chromium ingot, Awakener's orb - which drop from any of the four. These form their own cross-boss `dt2-shared-drops` group (mirroring DEC-0039's Voidwaker shape exactly): foiling any of the 5 shared items unlocks all 5, regardless of which of the four bosses is thought of as the source. Selected by an explicit rule (`dt2-shared-drops-group`, naming the family by id), so it takes precedence over each boss's own `boss-uniques-group` broad match, the same mechanism as DEC-0039.

**Rationale.** Same reasoning as DEC-0039: a player foiling Virtus mask cares about the shared armour line, not which specific boss is credited, so a cross-boss shared group is the more honest shape than arbitrarily assigning it to one boss's set or duplicating it across four.

**Source.** the maintainer, this session (2026-07-31): "Shared pool, like Voidwaker" for the DT2 items; approved each boss as proposed. OSRS Wiki drop tables, fetched 2026-07-31, for [Duke Sucellus](https://oldschool.runescape.wiki/w/Duke_Sucellus), [The Leviathan](https://oldschool.runescape.wiki/w/The_Leviathan), [The Whisperer](https://oldschool.runescape.wiki/w/The_Whisperer), [Vardorvis](https://oldschool.runescape.wiki/w/Vardorvis).

---

### DEC-0042 - Zalcano, Scorpia, Scurrius, and Giant Mole added; Long bone/Curved bone kept separate from either boss's uniques

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Four more bosses added under the DEC-0036/0038 policy:

- **Zalcano**: Crystal tool seed, Zalcano shard, Smolcano.
- **Scorpia**: Scorpia's offspring (pet) only. Odium shard 3 and Malediction shard 3 also drop here but are deliberately deferred - both also drop from Revenants, and assembling them into Odium/Malediction wards is a wider cross-monster network that needs its own ruling rather than a guess folded into this entry.
- **Scurrius**: Scurrius' spine, Scurry (pet).
- **Giant Mole**: Mole skin, Baby mole (pet).

**Exception.** Long bone and Curved bone are excluded from both Scurrius's and Giant Mole's unique sets - corrected mid-proposal by the maintainer, who pointed out both items drop from most monsters in the game, not from either boss specifically. They instead form their own small flat `group` (`long-curved-bone`, tag `bone-pair`): foiling either one unlocks the other, independent of any boss.

**Rationale.** Keeps the "not common/shared drops" policy from DEC-0038 honest - Long bone/Curved bone looked boss-flavoured (both Scurrius and Giant Mole are rodent-adjacent) but are mechanically ordinary widespread drops, so tying them to either boss's identity would have been wrong. The Odium/Malediction shard deferral follows the same discipline: better to ship Scorpia with just its pet than guess at a cross-monster ward-assembly rule under time pressure.

**Source.** the maintainer, this session (2026-07-31): approved Zalcano and the pet-only Scorpia; "Long Bone and curved bone shouldn't be unlocks from bosses as these can be dropped from the majority of monsters in the game. However a foil long or foil curved would unlock both." OSRS Wiki drop tables, fetched 2026-07-31, for [Zalcano](https://oldschool.runescape.wiki/w/Zalcano), [Scorpia](https://oldschool.runescape.wiki/w/Scorpia), [Scurrius](https://oldschool.runescape.wiki/w/Scurrius), [Giant Mole](https://oldschool.runescape.wiki/w/Giant_Mole).

---

### DEC-0043 - Obor, Bryophyta, the Dagannoth Kings, Chaos Elemental, Kalphite Queen, and King Black Dragon added; Dragon pickaxe recognised as a real shared unique across nine bosses

**Status:** Active
**Date:** 2026-07-31

**Ruling.**

- **Obor**: Hill giant club only - the chest reward behind Obor's key. Giant champion scroll and Ensouled giant head excluded, both globally obtainable, not Obor-specific.
- **Bryophyta**: Bryophyta's essence (the chest reward behind Bryophyta's key) and Bryophyta's staff (a direct rare drop). Same exclusions as Obor.
- **Dagannoth Rex**: Berserker ring, Warrior ring. **Dagannoth Prime**: Seers ring, Mud battlestaff. **Dagannoth Supreme**: Archers ring, Seercull. Dagannoth bones deliberately excluded - the maintainer confirmed it's not boss-exclusive enough to count. The four combat rings are already governed by the existing `fremennik-rings` community set (DEC-0013/0018): each ring is a `part` of its king's `boss` composite (so foiling the king still unlocks its rings), but no `boss-uniques` sibling set was created for any of the three kings, since removing the ring(s) each king would otherwise share leaves too few items (0 or 1) to form a valid set.
- **Chaos Elemental**: Pet chaos elemental, Dragon pickaxe.
- **Kalphite Queen**: Kq head, Jar of sand, Kalphite princess, Dragon pickaxe.
- **King Black Dragon**: Kbd heads, Prince black dragon, Dragon pickaxe, Draconic visage.

**Correction: Dragon pickaxe is a real cross-boss unique, not a common drop.** DEC-0038 originally excluded Dragon pickaxe from the wilderness boss pairs' unique sets, treating it as ordinary Rare-Drop-Table filler. The maintainer corrected this: Dragon pickaxe is added as a `part` to nine bosses' composites - Chaos Elemental, Callisto, Artio, Venenatis, Spindel, Vet'ion, Calvar'ion, Kalphite Queen, and King Black Dragon - so foiling any of these nine now also unlocks Dragon pickaxe. It is deliberately **not** added to any `boss-uniques` sibling set, since a single card cannot belong to more than one `group`-strategy set without an ambiguity failure (the same constraint as the wilderness rings, DEC-0038) - with it shared across nine bosses, no single boss's sibling set can claim it. Foiling Dragon pickaxe directly therefore still resolves `unresolved` for now, same as a godsword shard foiled alone (DEC-0027) - only foiling one of the nine bosses unlocks it.

**Similarly, Draconic visage** is added as a `part` of King Black Dragon's composite (it does drop there) without duplicating it into a new King Black Dragon uniques set, since it is already the authority via Vorkath's uniques set (DEC-0038).

**Rationale.** Dagannoth bones and the ring-sharing situation follow the same discipline established for wilderness rings and DT2 items: a composite's `parts` list can safely reference a card governed elsewhere, but a `set`'s `members` list cannot, so the sibling-group behaviour always defers to whichever ruling already owns that card. Obor/Bryophyta's exclusions keep faith with the "not globally obtained" boundary the maintainer drew explicitly this session.

**Source.** the maintainer, this session (2026-07-31): "both giants drop respective keys, these keys unlock the chest... These two items should be unlocked when a foil obor or foil bryophyta card is opened. Champion scroll and ensouled heads should not be included as these are globally obtained items"; "yes to all apart from the bones" (Dagannoth Kings); "add dragon pick too, infact add it to all bosses that drop it: Chaos Elemental Callisto Vet'ion Venenatis Artio Calvar'ion Spindel Kalphite Queen King Black Dragon"; "Include the staff too" (Bryophyta's staff). OSRS Wiki drop tables, fetched 2026-07-31, for [Obor](https://oldschool.runescape.wiki/w/Obor), [Bryophyta](https://oldschool.runescape.wiki/w/Bryophyta), [Dagannoth Kings](https://oldschool.runescape.wiki/w/Dagannoth_Kings), [Chaos Elemental](https://oldschool.runescape.wiki/w/Chaos_Elemental), [Kalphite Queen](https://oldschool.runescape.wiki/w/Kalphite_Queen), [King Black Dragon](https://oldschool.runescape.wiki/w/King_Black_Dragon).

---

### DEC-0044 - Barrows brothers and Hespori added; Wintertodt and Tempoross rewards grouped without a boss anchor

**Status:** Active
**Date:** 2026-07-31

**Ruling.**

- **The six Barrows brothers** (Ahrim, Dharok, Guthan, Karil, Torag, Verac) each get a `boss`/`boss-uniques` pair for their own 4-piece armour/weapon set. Barrows gloves is excluded from all six - a shared chest reward across every brother, not brother-specific, same reasoning as the wilderness rings/DT2 items.
- **Hespori**: Bottomless compost bucket, Tangleroot, Attas seed, Iasor seed, Kronos seed. The other three seeds on its drop table (White lily, Magic, Spirit, Redwood tree) are excluded - they're also obtainable from the Managers' zone reward shop and other farming sources, so not Hespori-exclusive; Attas/Iasor/Kronos are, per the maintainer.
- **Wintertodt** and **Tempoross** have no monster/boss card in this plugin's dataset at all - there is nothing to foil that represents "the boss", so neither gets a `boss` composite. Their rewards instead form two plain `minigame-reward-group`-tagged `set` families with no boss anchor: `wintertodt-rewards` (Tome of fire, Bruma torch, Burnt page, Phoenix, Dragon axe) and `tempoross-rewards` (Tome of water, Dragon harpoon, Fish barrel, Soaked page, Tackle box, Tiny tempor).

**Note on Dragon axe.** It is also the second-highest rung of the existing `axe` ladder family. Since `ladder-down` resolves before `group` in the strategy order, foiling Dragon axe itself still resolves via the axe ladder, not the Wintertodt group - but foiling any other Wintertodt reward still correctly lists Dragon axe as one of its unlocks, since `group` lists a family's members factually rather than re-resolving each one. Not a conflict, just an asymmetry worth naming.

**Rationale.** New pattern needed here: DEC-0036's `components` shape depends on a boss card to be the `whole`. Wintertodt and Tempoross don't have one, so a flat, un-anchored `group` (mirroring how community sets like the Pyromancer outfit already work) is the correct fallback rather than inventing a fake boss card or leaving the items disconnected.

**Source.** the maintainer, this session (2026-07-31): "Yes, all 6, gloves excluded" (Barrows); "yes but add attas, iasor and kronos seeds, they only come from hespori" (Hespori); "Tome of fire, bruma torch, burnt pages, pheonix and dragon axe should be their own group. Tome of water, dragon harpoon, fish barrel, soaked page, tackle box, tiny tempor from their own group too" (Wintertodt/Tempoross). OSRS Wiki, fetched 2026-07-31, for [Barrows](https://oldschool.runescape.wiki/w/Barrows), [Wintertodt](https://oldschool.runescape.wiki/w/Wintertodt), [Tempoross](https://oldschool.runescape.wiki/w/Tempoross), [Hespori](https://oldschool.runescape.wiki/w/Hespori).

---

### DEC-0045 - TzTok-Jad and TzKal-Zuk unlock their gauntlet's wave monsters, not the cape reward; Phantom Muspah and Sol Heredit added normally

**Status:** Active
**Date:** 2026-07-31

**Ruling.** TzTok-Jad (Fight Caves) and TzKal-Zuk (Inferno) break from the DEC-0036 boss/uniques shape: the maintainer specified that foiling either unlocks the **wave monsters fought to reach them**, not the Fire cape / Infernal cape reward or Tokkul currency. Both capes are already governed by the existing `fire-infernal-cape` ladder (DEC-0017) regardless.

- **TzTok-Jad**'s composite `parts`: Tz-Kih, Tz-Kek, Tok-Xil, Yt-MejKot, Ket-Zek, Yt-HurKot (the Fight Caves wave monsters).
- **TzKal-Zuk**'s composite `parts`: Jal-Nib, Jal-MejRah, Jal-Ak, Jal-AkRek-Xil, Jal-AkRek-Mej, Jal-AkRek-Ket, Jal-ImKot, Jal-Xil, Jal-Zek, JalTok-Jad, Yt-HurKot, Jal-MejJak (the Inferno wave monsters, per the OSRS Wiki's own Inferno page - not guessed from name patterns). Yt-HurKot appears in both lists (it's a healer-type enemy present in both encounters) - no conflict, since a card can be a `part` of more than one composite family with no ambiguity.

Neither gets a `boss-uniques` sibling set - this isn't a loot relationship, so DEC-0036's asymmetric unique-drop shape doesn't apply here at all.

Phantom Muspah and Sol Heredit (Colosseum) follow the ordinary DEC-0036/0038 shape instead:

- **Phantom Muspah**: Ancient essence, Frozen cache, Ancient icon, Venator shard, Muphin.
- **Sol Heredit**: Dizana's quiver, Tonalztics of ralos, Sunfire splinters, Echo crystal, Sunfire fanatic helm/cuirass/chausses, Smol heredit.

**Rationale.** Fight Caves and Inferno are not "kill a boss, get loot" encounters in the collection-log-unique sense every other entry so far has used - the entire point of foiling Jad/Zuk, per the maintainer, is proving you fought through their gauntlet, so the unlock should represent the fight itself. This is a genuinely new relationship shape (composite `parts` = prerequisite encounter monsters, not drop-table items), reusing the same `components` strategy/engine mechanics with no code change, just a different kind of fact being recorded.

**Source.** the maintainer, this session (2026-07-31): "foil jad unlocks the fights caves monsters, not the fire cape or tokkul. Foil zuk, unlocks the infernal fight monsters, not the cape or tokkul"; approved Phantom Muspah and Sol Heredit as proposed. OSRS Wiki, fetched 2026-07-31, for [Fight Caves](https://oldschool.runescape.wiki/w/Fight_Caves), [Inferno](https://oldschool.runescape.wiki/w/Inferno), [Phantom Muspah](https://oldschool.runescape.wiki/w/Phantom_Muspah), [Sol Heredit](https://oldschool.runescape.wiki/w/Sol_Heredit).

---

### DEC-0046 - The three raids added: Chambers of Xeric, Theatre of Blood, Tombs of Amascut

**Status:** Active
**Date:** 2026-07-31

**Ruling.**

- **Chambers of Xeric** (`boss-great-olm`, whole = Great Olm): Dexterous prayer scroll, Arcane prayer scroll, Twisted buckler, Dragon hunter crossbow, Dinh's bulwark, Ancestral hat/robe top/robe bottom, Dragon claws, Elder maul, Kodai wand, Twisted bow, Olmlet. (An initial pass excluded a "Kodai insignia" that turned out not to exist in this plugin's card dataset - the maintainer corrected the actual reward name to Kodai wand, which does exist and is now included.)
- **Theatre of Blood** (`boss-verzik-vitur`, whole = Verzik Vitur): Avernic defender hilt, Justiciar faceguard/chestguard/legguards, Ghrazi rapier, Sanguinesti staff, Scythe of vitur, Lil' zik.
- **Tombs of Amascut**: the unique roll happens once at the end of the raid (after the Warden fight), not per path-boss (Ba-Ba, Kephri, Akkha, Zebak) - so both `Elidinis' Warden` and `Tumeken's Warden` composites share one `toa-uniques` set: Masori mask/body/chaps, Osmumten's fang, Tumeken's shadow, Elidinis' ward, Lightbearer, Tumeken's guardian. The maintainer scoped this to armour/weapon/pet only - Thread of elidinis, Breach of the scarab, Eye of the corruptor, Jewel of the sun, and Jewel of amascut (tertiary reward-track items) are deliberately excluded.

**Note on Dragon claws.** Also the top rung of the existing `claws` metal-tier ladder (`ladder-down`, which resolves before `group`) - same harmless asymmetry as Dragon axe in DEC-0044: foiling Dragon claws directly still goes through the ladder, but it still shows correctly as an unlock from Great Olm's other uniques.

**Rationale.** Theatre of Blood and Chambers of Xeric are single-boss raids so they follow the ordinary DEC-0036 shape without modification. Tombs of Amascut needed the same "two whole cards, one shared set" shape already established for the wilderness pairs and Grotesque Guardians (DEC-0038/0040), since its two final-phase NPCs are fought together and share one loot roll.

**Source.** the maintainer, this session (2026-07-31): approved Great Olm ("yes but with kodai insignia too", then corrected to "it's kodai wand"), Verzik Vitur, and Tombs of Amascut ("Yes, but armour/weapon/pet only"). OSRS Wiki, fetched 2026-07-31, for [Chambers of Xeric](https://oldschool.runescape.wiki/w/Chambers_of_Xeric), [Ancient chest](https://oldschool.runescape.wiki/w/Ancient_chest), [Theatre of Blood](https://oldschool.runescape.wiki/w/Theatre_of_Blood), [Tombs of Amascut](https://oldschool.runescape.wiki/w/Tombs_of_Amascut).

---

### DEC-0047 - Yama, Amoxliatl, The Hueycoatl, and Doom of Mokhaiotl added

**Status:** Active
**Date:** 2026-07-31

**Ruling.**

- **Yama**: Soulflame horn, Oathplate helm, Oathplate chest, Oathplate legs, Yami. Narrower than initially proposed - the maintainer dropped Dossier, Forgotten lockbox, and Oathplate shards from the set.
- **Amoxliatl**: Glacial temotli, Pendant of ates, Moxi. The moon-key tooth half is excluded - shared tertiary drop across several Varlamore bosses, not Amoxliatl-exclusive.
- **The Hueycoatl**: Dragon hunter wand, Hueycoatl hide, Tome of earth, Soiled page, Huberte. Same moon-key exclusion as Amoxliatl.
- **Doom of Mokhaiotl**: Mokhaiotl cloth, Eye of ayak, Avernic treads, Dom.

All four follow the ordinary DEC-0036/0038 `boss`/`boss-uniques` pair shape with no cross-boss sharing.

**Source.** the maintainer, this session (2026-07-31): "Yama, Soulflame horn, Oathplate helm/chest/legs, Yami" (trimming the original proposal); "Amoxliatl - Glacial Temotli, Moxi, Pendant of ates, Moxi. Hueycoatl - Hueycoatl hide, Tome of earth, dragon hunter wand, soiled page, Huberte"; approved Doom of Mokhaiotl as proposed. OSRS Wiki, fetched 2026-07-31, for [Yama](https://oldschool.runescape.wiki/w/Yama), [Amoxliatl](https://oldschool.runescape.wiki/w/Amoxliatl), [The Hueycoatl](https://oldschool.runescape.wiki/w/The_Hueycoatl), [Doom of Mokhaiotl](https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl).

---

### DEC-0048 - Araxxor, The Gauntlet, and the Moons of Peril added; Fragment of Seren confirmed to have no unique drops

**Status:** Active
**Date:** 2026-07-31

**Ruling.**

- **Araxxor**: Noxious pommel, Noxious point, Noxious blade, Araxyte fang, Nid.
- **The Gauntlet**: Crystalline Hunllef (normal) and Corrupted Hunllef (corrupted) share one loot pool - `gauntlet-uniques`: Crystal weapon seed, Crystal armour seed, Enhanced crystal weapon seed, Youngllef. Gauntlet cape is excluded from both - a guaranteed completion reward from Corrupted Hunllef, not part of the RNG unique table, same reasoning as the Jad/Zuk cape exclusion in DEC-0045.
- **Moons of Peril**: three fully independent bosses, no sharing between them. Blood Moon: Blood moon helm/chestplate/tassets, Dual macuahuitl. Blue Moon: Blue moon helm/chestplate/tassets, Blue moon spear. Eclipse Moon: Eclipse moon helm/chestplate/tassets, Eclipse atlatl, Atlatl dart.
- **Fragment of Seren**: checked and confirmed to have no unique/rare drop table at all on the OSRS Wiki - skipped, not an oversight.

**Rationale.** The Gauntlet's cape exclusion extends the Jad/Zuk precedent (DEC-0045) to another "prove you finished it" completion reward, rather than treating every guaranteed reward as if it were a rare drop-table roll.

**Source.** the maintainer, this session (2026-07-31): approved Araxxor and the Moons of Peril as proposed; "Exclude Gauntlet cape" for The Gauntlet. OSRS Wiki, fetched 2026-07-31, for [Araxxor](https://oldschool.runescape.wiki/w/Araxxor), [The Gauntlet](https://oldschool.runescape.wiki/w/The_Gauntlet), [Moons of Peril](https://oldschool.runescape.wiki/w/Moons_of_Peril), [Fragment of Seren](https://oldschool.runescape.wiki/w/Fragment_of_Seren).

---

### DEC-0049 - Chaos Fanatic and Crazy archaeologist added, closing the Odium/Malediction shard deferral from DEC-0042; each of the three shard-dropping bosses is self-contained

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Closes the deferral from DEC-0042. Odium shard 1/Malediction shard 1 come from Chaos Fanatic, Odium shard 2/Malediction shard 2 from Crazy archaeologist, Odium shard 3/Malediction shard 3 from Scorpia. The maintainer explicitly rejected a Voidwaker-style cross-boss assembly group for the two wards: **foiling one of the three bosses unlocks only that boss's own shard pair, not the other two bosses' shards and not the assembled Odium ward / Malediction ward.**

- **Chaos Fanatic**: Ancient staff, Odium shard 1, Malediction shard 1. (Pet chaos elemental also drops here but is excluded - already governed by Chaos Elemental's uniques set, DEC-0043.)
- **Crazy archaeologist**: Fedora, Odium shard 2, Malediction shard 2.
- **Scorpia**: Scorpia's offspring, Odium shard 3, Malediction shard 3 (extends the pet-only entry from DEC-0042).

Each of the three gets its own ordinary `boss`/`boss-uniques` pair - no shared/explicit cross-boss family is created this time, unlike Voidwaker (DEC-0039) or the DT2 items (DEC-0041). The assembled wards (Odium ward, Malediction ward) are not referenced anywhere and stay `unresolved` if foiled directly - a deliberate scope boundary, not an oversight.

With this, the maintainer confirmed the session's boss/raid pass is complete: further monster-side rules (Dark beast and other slayer-category monsters, the Revenants/ancient-emblem network, etc.) are explicitly out of scope here and will be handled separately as slayer-monster rules, not as bosses.

**Rationale.** Mirrors the "not every shared drop implies a cross-monster relationship" lesson from Uncut onyx (DEC-0040) - three monsters happening to drop pieces of the same craftable item doesn't automatically mean foiling one should reveal the others, and the maintainer drew that line explicitly here rather than defaulting to the Voidwaker precedent.

**Source.** the maintainer, this session (2026-07-31): "A foil of any of the 3 bosses, unlocks that bosses specific shard drops, not the others. They should only unlock the shards, nothing else"; "Let's finish off bosses specifically. Monsters like dark best[beast] are slayer monsters, these shouldn't be tackled right now. They will be handled differently." OSRS Wiki, fetched 2026-07-31, for [Chaos Fanatic](https://oldschool.runescape.wiki/w/Chaos_Fanatic), [Crazy archaeologist](https://oldschool.runescape.wiki/w/Crazy_archaeologist), [Odium ward](https://oldschool.runescape.wiki/w/Odium_ward), [Malediction ward](https://oldschool.runescape.wiki/w/Malediction_ward).

---

### DEC-0050 - Individual item pass begins, alphabetical; anniversary/birthday event reward sets and the abyssal dyes grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Starts a new pass over the ~5,100 unresolved non-monster item cards, working alphabetically by name (no real OSRS item ID exists in this dataset - see DEC-0032's data-entry note). The maintainer confirmed the general principle for this pass: bosses unlock their full uniques table, but foiling an individual unique from a boss's table does not unlock the rest of that table - the existing `boss`/`boss-uniques` asymmetry (DEC-0036) already encodes this and nothing changes there; this just states the same principle applies going forward for item-level rulings.

First batch, four small cosmetic reward groups (new `event-reward-group` family tag, reusing the `group` strategy - no boss/minigame anchor, same shape as `minigame-reward-group` from DEC-0044):

- **20th anniversary set**: boots, bottom, cape, gloves, hat, necklace, top (7 pieces).
- **25th anniversary set**: 5x5 hat, helmet, skeleton tabard, warrior tabard (4 pieces, kept as one group rather than two pairs).
- **10th birthday set**: balloons, cape.
- **Abyssal dyes**: blue, green, red.

4th birthday hat has no sibling item in this dataset to group with, so it stays `unresolved` - no rule authored, not an oversight.

**Rationale.** These are official one-time event cosmetics handed out together, not drop-table loot, so the community-set/minigame-reward-group precedent (DEC-0013/0044) applies directly - no boss card exists to anchor a `components` family, so a flat `group` is correct.

**Source.** the maintainer, this session (2026-08-02): confirmed alphabetical ordering (no item-ID data available) and items-only scope; "go through every available item in the JSON set and explicitly state what each item unlocks. Bosses unlock their full uniques table, however an individual unique from a boss table wouldn't unlock the same items" (restating DEC-0036); approved all four groups as proposed, all Recommended options.

---

### DEC-0051 - Dragon masks and the Alchemist's outfit grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.**

- **Dragon masks** (Bronze, Iron, Steel, Mithril, Adamant, Rune, Black, Red, Green, Blue, Lava): flat `group` - the maintainer rejected a metal-tier `ladder-down` reading, since they're cosmetic drops from their matching dragons, not a smithing progression. Foiling any one unlocks all eleven.
- **Alchemist's outfit**: Prescription goggles, Alchemist labcoat, Alchemist pants, Alchemist gloves, Alchemist's amulet. Alchemist's signet is deliberately excluded per the maintainer. Prescription goggles is the actual head-slot piece of this outfit in the dataset (there is no card named "Alchemist goggles").

Both use the existing `community-set-group` rule/tag (DEC-0013) - no new rule needed.

**Source.** the maintainer, this session (2026-08-02): "Flat group" for dragon masks; "Prescription Goggles, labcoat, pants, gloves and amulet" for the Alchemist set, explicitly excluding the signet.

---

### DEC-0052 - Ancient ceremonial robes, Ankou's outfit, the Antisanta costume, and the Ancient pages grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.**

- **Ancient ceremonial robes**: boots, gloves, legs, mask, top - all 5 grouped.
- **Ankou's outfit**: gloves, mask, socks, top, leggings - all 5 grouped. The monster cards Ankou and Dark Ankou are out of scope (monster category).
- **Antisanta costume**: boots, gloves, jacket, mask, pantaloons - grouped. Antisanta's coal box excluded per the maintainer - a prop, not a costume piece.
- **Ancient pages**: the four numbered pages (1-4) grouped. The unrelated unnumbered "Ancient page" card is a different item and left alone.

All four use the existing `community-set-group` rule/tag (DEC-0013).

**Source.** the maintainer, this session (2026-08-02): approved Ancient ceremonial, Ankou's outfit, and the numbered Ancient pages as proposed (all Recommended); "Group the 5 costume pieces only" for Antisanta, excluding the coal box.

---

### DEC-0053 - 18lb shot and 22lb shot grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** 18lb shot and 22lb shot (ballista ammunition) grouped as a two-item set - foiling either unlocks both. Uses the existing `community-set-group` rule/tag.

**Note on process.** This session initially proposed the next several items (18lb shot onward, plus a large batch of god-themed armour sets) in bundled multi-item AskUserQuestion calls. The maintainer stopped this and confirmed the process must go back to strictly one item at a time in alphabetical order, per the original session brief - resuming that discipline from here on.

**Source.** the maintainer, this session (2026-08-02): "Group with 22lb shot".

---

### DEC-0054 - 4th birthday hat grouped with Birthday balloons

**Status:** Active
**Date:** 2026-08-02

**Ruling.** 4th birthday hat and Birthday balloons grouped as a two-item event set. Uses the existing `event-reward-group` rule/tag (DEC-0050).

**Source.** the maintainer, this session (2026-08-02): "group with birthday balloons".

---

### DEC-0055 - Grand Library of Prifddinas readable books grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** 15 readable-book cards grouped as the Grand Library of Prifddinas set: A dear friend, Eastern discovery, The great divide, Crazed scribbles, Ode to eternity, Crystal singing for beginners, On leprechauns, Bloody diary, The eight clans, Soggy journal, Ebrill's journal, Stained journal, The living statues, The spurned demon, Legends of the mountain. Uses the existing `community-set-group` rule/tag.

The maintainer's full 27-title list included 12 books not present as cards in this dataset at all (Prifddinas' History, Eastern Settlement, The Journal of Randas, Book on Baxtorian, Cadarn Lineage, Big Book of Bangs, Edern's Journal, Gollwyn's Final Statement, Niff & Harry, The Truth Behind the Myth, Harmony (book), The Tale of Iban) - those are simply excluded from the group since they can't be referenced.

**Source.** the maintainer, this session (2026-08-02): "unlocks all of these books within the grand library of prifddinas" followed by the 27-title list; confirmed grouping the 15 that exist as cards.

---

### DEC-0056 - Ablenkian's escape, Imafore's betrayal, and The weeping grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ablenkian's escape, Imafore's betrayal, and The weeping grouped as a readable-book set. Uses the existing `community-set-group` rule/tag.

Of the maintainer's original 6-title list, "The Fall of Imcandoria" and "Lutwidge and the Moonfly" don't exist as cards at all, and "Serafina's diary" doesn't exactly match the listed "The Tale of Serafina" (different title) - excluded rather than guessed.

**Source.** the maintainer, this session (2026-08-02): listed the 6 titles in response to the "A jester stick"/"A nice key"/"A powdered wig" prompts; confirmed grouping only the 3 exact matches.

---

### DEC-0057 - Super ranging, Super magic potion, and Absorption grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Super ranging, Super magic potion, and Absorption grouped as a raids-supply potion set. Overload was named by the maintainer too but does not exist as a card in this dataset, so it's excluded. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Super ranging Super magic potion Overload Absorption"; confirmed grouping the 3 that exist.

---

### DEC-0058 - Sacred ashes ladder added

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Sacred ashes": Fiendish ashes < Vile ashes < Malicious ashes < Abyssal ashes (lowest to highest). Uses the existing `resource-ladder-down` rule via the `resource` tag - foiling one unlocks it and every tier below.

Ashes, Infernal ashes, Eldritch ashes, and Ground ashes were in the dataset but not named by the maintainer as part of this ladder, so they're left out rather than guessed in.

**Source.** the maintainer, this session (2026-08-02): "would unlock abyssal ashes and below, laddered"; "Fiendish ashes < Vile ashes < Malicious ashes < Abyssal ashes" for the tier order.

---

### DEC-0059 - Sacred ashes ladder corrected (Infernal ashes added above Abyssal); Abyssal bludgeon added as a new assembled-weapon composite shape

**Status:** Active
**Date:** 2026-08-02

**Ruling.**

- **Correction to DEC-0058**: Infernal ashes sits above Abyssal ashes on the sacred-ashes ladder, not omitted - the maintainer caught this immediately after DEC-0058 landed. Ladder is now Fiendish < Vile < Malicious < Abyssal < Infernal (lowest to highest); foiling Infernal ashes unlocks everything below, foiling Abyssal ashes leaves Infernal locked/excluded.
- **Abyssal bludgeon**: new `components` composite, whole = Abyssal bludgeon, parts = Bludgeon axon, Bludgeon claw, Bludgeon spine. This is a genuinely new relationship shape - a weapon assembled from three drop pieces, not a boss-uniques or godsword-hilt relationship - so a new family tag `assembled-weapon` and matching rule were added (mirrors the `godsword-hilt` shape but grants the parts too, since here the parts have no other resolution of their own).

**Rationale.** The godsword-hilt shape (DEC-0028) deliberately does NOT grant the shards because they're independently useful/tradeable pieces the ruling wanted separate; the bludgeon's three parts have no independent existence outside assembling the bludgeon, so granting them alongside the whole is the correct read of the same "assembled from drops" pattern applied to a different case.

**Source.** the maintainer, this session (2026-08-02): "Infernal ashes sit above abyssal, so they would be locked still"; "Bludgeon axon, Bludgeon claw and Bludgeon spine" for Abyssal bludgeon's parts.

---

### DEC-0060 - Abyssal dagger added to the dagger ladder as its top rung

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Abyssal dagger added as the top rung of the existing `dagger` ladder, above Dragon dagger. Uses the existing `weapon-ladder-down` rule - no new rule needed.

**Source.** the maintainer, this session (2026-08-02): "This is an item that would qualify for the laddered rule, all daggers below would be unlocked."

---

### DEC-0061 - `unresolved` now unlocks the searched card itself

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Changed the `unresolved` strategy's behaviour (rules-spec.md section 8): it now returns `unlocks: [{ card, actions }]` for the searched card only, same shape as `plain-foil`, instead of `unlocks: []`. Nothing about any sibling card in the family is claimed either way - only the card the player actually pulled is unlocked. Applies to the deliberate-refusal override case too (`mode: "replace"`, `strategy: "unresolved"`), since it's built on the same `unresolved()` function.

**Code changes** (not data-only, spec-level):
- `src/rules/strategies/unresolved.ts`: `unlocks` now includes the searched card with its curated actions (falls back to `[]` if it has none), mirroring `plain-foil.ts`.
- `src/ui/ladder.ts`: `memberState` marks the searched card `unlocked` under the `unresolved` strategy while every other family member stays `context` (no ruling); tally text and caption updated to say so.
- `src/ui/result.ts`: `renderUnresolved` now also calls `renderUnlocks`, so a card with no family (or an unlock outside its family's members) still shows its own action badges.
- `docs/rules-spec.md` section 8 updated to describe the new `unlocks` shape.
- Test updates across `resolve.test.ts`, `precedence.test.ts`, and `result.test.ts` to match: unresolved cards now assert `unlocks.length === 1` (the card itself) instead of `0`.

**Rationale.** The maintainer's read: a foil is a foil regardless of whether a ruling exists for its wider family - not having decided what a Bronze full helm foil means for the rest of the full-helm ladder is no reason to also withhold Bronze full helm itself. This mirrors `plain-foil`'s "a foil unlocks at least the card it shows" position, just applied to the "no rule decided yet" case as well as the "ruleset says a foil is only itself" case.

**Source.** the maintainer, this session (2026-08-02): "On items that go 'unresolved' the UI should reflect this as only that item being unlocked rather than the 'undecided' message"; confirmed doing this as a code change now rather than deferring it.

---

### DEC-0062 - Abyssal tentacle grouped with Abyssal whip

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Abyssal tentacle grouped with Abyssal whip - foiling either unlocks both. There's no plain "Whip" card in this dataset, only Abyssal whip. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks normal whip".

---

### DEC-0062 - Split "solo item" out of the unresolved screen

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Corrects DEC-0061: the maintainer flagged that a card with genuinely nothing to relate it to (no family, no group, no state pair) is not the same situation as a card caught in a real undecided ladder/group debate, and the UI should not present both the same way. Split into two distinct presentations, both still `strategy: 'unresolved'` in the data model, distinguished by whether `resolution.family` is populated:

- **Has a family** (a ladder/group exists, no rule selects it yet): unchanged full undecided screen from DEC-0061/section 8 - ruling banner, undecided badge, neutral-context ladder, community camps.
- **No family at all ("solo item")**: new quiet treatment - a single-line statement that the card "has no known ladder, group, or state-pair relationship to any other card, so it simply unlocks itself," its own action badges if it has any, no undecided badge, no camps section. Tagged with a distinct `result--unresolved-solo` CSS class and `ruling--solo` on its explanation block so it's stylable separately from the real undecided screen.

**Code changes**: `src/ui/result.ts` (new `renderSoloItem`, exported `renderUnresolved` for direct testing, `renderResult`'s article class branches on family presence), `src/rules/index.ts` export surface unchanged, `docs/rules-spec.md` section 8 rewritten to describe the two presentations, tests in `result.test.ts` split into a solo-item block and a family-having full-screen block (the latter built from a synthetic resolution, since no shipped card is genuinely unresolved-with-family - every family carries a rule).

**Rationale.** Per the maintainer: "unresolved and solo item should be two separate categories. Unresolved is literally unresolved, solo item means an item that unlocks itself and nothing else." Showing "There is no agreed rule for this card yet" plus a "positions people hold" debate about e.g. Abyssal book - which has no sibling item to relate it to at all - misrepresented a non-question as an open one. The data-layer behaviour from DEC-0061 (the searched card is always unlocked) stays exactly right; only the UI framing needed to stop treating "nothing to relate this to" the same as "genuinely caught between camps."

**Source.** the maintainer, this session (2026-08-02): screenshot of the Abyssal book result showing the undecided banner, with "the section for undecided still appears when an item only unlocks itself, this needs to not show for single unlock items"; then, mid-implementation, "unresolved and solo item should be two separate categories. Unresolved is literally unresolved, solo item means an item that unlocks itself and nothing else" - correcting the first pass, which had collapsed the no-family case into a bare `renderUnlocks` call with no distinguishing copy at all.

---

### DEC-0063 - Demonic Pacts (Leagues) rewards grouped; general leagues-reward principle established

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Impish whistle, Demonic trident ornament kit, Demonic axe ornament kit, Demonic staff ornament kit, Demonic quill, and Demonic skin contract grouped as the Demonic Pacts league's reward set - foiling any one unlocks the rest. Uses the existing `community-set-group` rule/tag.

Of the maintainer's full 13-item Leagues VI reward list (from the GE price table), only these 6 exist as cards in this dataset - "Demonic skin sample" doesn't exist exactly but "Demonic skin contract" was confirmed as the same reward under a different name; the banner, the three Relic Hunter trophy tiers, the throne scroll, the Impish ritual scroll, and the demon butler scroll aren't cards here at all, so they're simply excluded.

**General principle (applies going forward, not just this league).** Leagues reward-shop items are scoped per league: a foil of any reward from a given league's shop unlocks every other reward from that same league's shop (that exists as a card), and nothing from any other league. This is the same `community-set-group` shape used for minigame/event reward groups elsewhere (DEC-0013/0044/0050) - each future league gets its own `community-set`-tagged `set` family as its rewards are worked through in the alphabetical item pass.

**Source.** the maintainer, this session (2026-08-02): "I've just unlocked impish whistle foil in game... it's a leagues 6 reward so this one (and any other leagues 6 reward) should unlock the other league 6 rewards. This rule goes for all leagues rewards for that specific league." - followed by the Domain of Despair/Demonic Pacts GE price table listing the 13 rewards; confirmed including Demonic skin contract despite the name mismatch.

---

### DEC-0064 - Accursed sceptre grouped with Thammaron's sceptre; the Blessed bones ladder added

**Status:** Active
**Date:** 2026-08-02

**Ruling.**

- **Accursed sceptre** grouped with **Thammaron's sceptre** - foiling either unlocks both. Uses the existing `community-set-group` rule/tag.
- **Blessed bones ladder** added, lowest to highest: Blessed bones < Blessed bat bones < Blessed big bones < Blessed zogre bones < Blessed babywyrm bones < Blessed babydragon bones < Blessed strykewyrm bones < Blessed wyrm bones < Sun-kissed bones < Blessed wyvern bones < Blessed dragon bones < Blessed drake bones < Blessed fayrg bones < Blessed lava dragon bones < Blessed raurg bones < Blessed frost dragon bones < Blessed hydra bones < Blessed ourg bones < Blessed superior dragon bones. Uses the existing `resource-ladder-down` rule via the `resource` tag.
  - Blessed dagannoth bones is skipped - it isn't a card in this dataset (only unblessed Dagannoth bones is).
  - Blessed bone statuette is deliberately excluded from the ladder, per the maintainer's explicit "not blessed bone statuette."

**Source.** the maintainer, this session (2026-08-02): "unlocks Thamarons sceptre" (confirmed correct spelling "Thammaron's sceptre" via screenshot after an initial not-found check); "I've also just unlocked blessed superior dragon bones which would ladder unlock the blessed bones below it, see screenshot, but not blessed bone statuette", followed by a wiki XP-rates table confirming the tier order and Sun-kissed bones' position; confirmed skipping Blessed dagannoth bones since it isn't a card here.

---

### DEC-0065 - Regular tree seeds laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Tree seeds", lowest to highest: Acorn < Willow seed < Maple seed < Yew seed < Magic seed. Uses the existing `resource-ladder-down` rule via the `resource` tag. Fruit tree and hardwood tree seeds are a separate ladder, deferred until the alphabetical item pass reaches them.

**Source.** the maintainer, this session (2026-08-02): "just unlocks acorn seeds as it's the lowest tree seed"; "Acorn > willow > maple > Yew > Magic for regular trees. There are fruit tree and hardwood trees but we'll cover those when we get to them."

---

### DEC-0066 - Canes laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Canes", lowest to highest: Black cane < Adamant cane < Rune cane < Dragon cane. Uses the existing `weapon-ladder-down` rule via the `weapon` tag.

**Source.** the maintainer, this session (2026-08-02): "There are 4 canes. Dragon > Rune > Adamant > Black."

---

### DEC-0067 - Adamant seeds grouped with Mithril seeds

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Adamant seeds and Mithril seeds grouped - foiling either unlocks both. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks mithril seeds and vice versa".

---

### DEC-0068 - Ore fragments laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Ore fragments", lowest to highest: Iron ore fragment < Silver ore fragment < Coal fragment < Gold ore fragment < Mithril ore fragment < Adamantite ore fragment < Runite ore fragment. Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): provided the full fragment tier table ("part of a tree") confirming the order and level requirements.

---

### DEC-0069 - Potion packs laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Potion packs", lowest to highest: Apprentice potion pack < Adept potion pack < Expert potion pack. Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): provided the resin-ratio table for the three packs; confirmed "Apprentice < Adept < Expert ladder" as the tier order.

---

### DEC-0070 - Aether rune added to the combination rune ladder

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Aether rune added as the top rung of the existing `combination-rune` ladder, above Lava rune. Uses the existing `combination-rune-ladder-down` rule - no new rule needed.

**Source.** the maintainer, this session (2026-08-02): "laddered combination rune" followed by the rune-creation level/component table confirming Aether (level 90) sits above the six standard combination runes (Mist through Lava, already laddered).

---

### DEC-0071 - Resin pastes grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Aga paste, Mox paste, and Lye paste grouped flat - foiling any unlocks all three. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "flat group with Mox and Lye paste".

---

### DEC-0072 - Potion mixes laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Potion mixes", lowest to highest by Herblore level: Attack mix < Antipoison mix < Relicym's mix < Strength mix < Restore mix < Energy mix < Defence mix < Agility mix < Combat mix < Prayer mix < Superattack mix < Anti-poison supermix < Fishing mix < Super energy mix < Hunting mix < Super str. mix < Magic essence mix < Super restore mix < Super def. mix < Antidote+ mix < Antifire mix < Ranging mix < Magic mix < Zamorak mix < Stamina mix < Extended antifire mix < Ancient mix < Super antifire mix < Extended super antifire mix. Uses the existing `resource-ladder-down` rule via the `resource` tag - a foil grants the `use` verb on that tier and below; each mix still needs its own ingredients to actually make.

**Source.** the maintainer, this session (2026-08-02): full Herblore level/XP table for all 29 mixes ("part of a tree"), confirming order and that "each potion still needs the relevant ingredients to make them."

---

### DEC-0073 - Potions laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Potions", 49 tiers lowest to highest by Herblore level: Imp repellent < Attack potion < Antipoison < Relicym's balm < Strength potion < Restore potion < Guthix balance < Energy potion < Defence potion < Agility potion < Combat potion < Prayer potion < Super attack < Superantipoison < Fishing potion < Super energy < Hunter potion < Goading potion < Super strength < Prayer regeneration potion < Super fishing potion < Super restore < Sanfew serum < Extreme energy potion < Super defence < Super hunter potion < Antidote+ < Antifire potion < Ranging potion < Magic potion < Stamina potion < Zamorak brew < Antidote++ < Bastion potion < Battlemage potion < Saradomin brew < Surge potion < Extended antifire < Ancient brew < Extended stamina potion < Anti-venom < Menaphite remedy < Armadyl brew < Super combat potion < Forgotten brew < Super antifire potion < Anti-venom+ < Extended anti-venom+ < Extended super antifire. Uses the existing `resource-ladder-down` rule via the `resource` tag - each tier still needs its own ingredients to make.

Deliberately excluded, per the maintainer: the 8 Divine-tier potions (they boost the same as their base potion with no degradation, a different mechanic), and non-drinkable herblore products - Haemostatic poultice/dressing (applied to a wound), Blamish oil (poured on a fishing rod), Compost potion (poured on compost), and Weapon poison/+/++  (applied to weapons, not drunk). Also excluded because they don't exist as cards in this dataset: Serum 207, Guthix rest tea, Goblin potion, Shrink-me-quick, and Magic essence (only "Magic essence mix," a separate item on the DEC-0072 potion-mix ladder, exists).

**Source.** the maintainer, this session (2026-08-02): full Herblore potion table with levels, ingredients and effects; "Potions are a tree, though divine pots and none pot items should not be included in the tree... an unlocked pot can be consumed but still need the items to create them"; clarified the non-pot exclusion as "exclude non drinkable items but poison related pots can be included"; confirmed the specific exclusion list (poultice/dressing, oil, compost potion, weapon poisons, Divine tier).

---

### DEC-0074 - Temple Trekking tomes grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** The 7 Temple Trekking skill tomes (Agility, Firemaking, Fishing, Mining, Slayer, Thieving, Woodcutting) grouped flat - foiling any one unlocks all 7. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks all temple trekking tomes" followed by the list of 7 skills.

---

### DEC-0075 - Elemental staves laddered (basic, battlestaves, mystic - three separate trees)

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Three separate `ladder-down` families, each lowest to highest Air < Water < Earth < Fire:

- **Basic elemental staves**: Staff of air < Staff of water < Staff of earth < Staff of fire.
- **Elemental battlestaves**: Air battlestaff < Water battlestaff < Earth battlestaff < Fire battlestaff.
- **Mystic elemental staves**: Mystic air staff < Mystic water staff < Mystic earth staff < Mystic fire staff.

Each uses the existing `weapon-ladder-down` rule via the `weapon` tag. The three tiers (basic/battlestaff/mystic) are kept as separate ladders rather than one combined one, per the maintainer.

**Source.** the maintainer, this session (2026-08-02): "there are 3 types of elemental staff, basic, battlestaves, mystic, each should be their own laddered tree from fire down to air" followed by the rune-provided/GE-price table confirming all 12 items and the air-water-earth-fire order.

---

### DEC-0076 - Elemental orbs laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Elemental orbs", lowest to highest by Magic level to charge: Water orb < Earth orb < Fire orb < Air orb. Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): "laddered with other orbs" followed by the obelisk/charge-spell Magic level table confirming the order (Water 56 < Earth 60 < Fire 63 < Air 66).

---

### DEC-0077 - Elemental rune packs laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Elemental rune packs", lowest to highest: Air rune pack < Water rune pack < Earth rune pack < Fire rune pack. Uses the existing `resource-ladder-down` rule via the `resource` tag. Same order as the elemental orb/staff ladders (DEC-0075/0076).

**Source.** the maintainer, this session (2026-08-02): "ladder: air > water> earth>fire" (initially read as highest-to-lowest, giving Fire as the lowest tier - corrected immediately after: "flip the order for those rune packs").

---

### DEC-0078 - Talismans laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Talismans", lowest to highest by Runecraft level: Air talisman < Elemental talisman < Mind talisman < Catalytic talisman < Water talisman < Earth talisman < Fire talisman < Body talisman < Cosmic talisman < Chaos talisman < Nature talisman < Law talisman < Blood talisman < Wrath talisman. Uses the existing `resource-ladder-down` rule via the `resource` tag.

Elemental talisman and Catalytic talisman are combination talismans sharing Runecraft levels 1 and 2 with Air and Mind respectively - each still gets its own tier rather than sharing a rung with its level-mate (corrected shortly after the initial pass, which had paired them). Death talisman is skipped - it isn't a card in this dataset.

**Source.** the maintainer, this session (2026-08-02): "laddered:" followed by the full Runecraft-level talisman table; then mid-turn, "also in the ladder:" adding Cosmic/Chaos/Nature/Law/Death/Blood/Wrath and the two combination talismans; confirmed skipping Death; then, after seeing the shared-rung result, "Air and mind should be their own tier, move the the others to their own tier" - splitting Elemental and Catalytic into their own rungs.

---

### DEC-0079 - 3rd age melee/range weapon and armor pieces moved from outfit groups into their metal-tier ladders

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Corrects an inconsistency the maintainer flagged: 3rd age gear was resolving via flat community-set outfit groups (foiling any piece unlocked the whole 3rd age outfit), while 3rd age axe/pickaxe were already correctly laddered as the top tier of their respective metal-tier ladders (per TheSeahorsie's source data). The maintainer's principle: every 3rd age piece that has a metal-tier progression below it should ladder, not group.

Added as the new top rung (above Dragon, or above Gilded/Dragon for the armour pieces) of their existing ladders:
- **3rd age longsword** → `longsword` ladder.
- **3rd age platebody** → `platebody` ladder.
- **3rd age platelegs** → `platelegs` ladder.
- **3rd age plateskirt** → `plateskirt` ladder.
- **3rd age kiteshield** → `kiteshield` ladder.
- **3rd age full helmet** → `full-helm` ladder.

**3rd age bow was already correctly on the `shortbow` ladder** (not longsword/longbow) per TheSeahorsie's sourced ladder data - confirmed via `validate-rules`'s seahorsie fidelity check, which caught an initial mistake of also adding it to `longbow` before this ruling landed. No change was needed there.

These 6 cards remain factual members of the `third-age-melee`/`third-age-range` community-set families for now (so those groups still list them correctly as unlocks when a *different* group member is foiled), but `ladder-down` resolves before `group` in the strategy order, so foiling one of these 6 directly now goes through its ladder - the same harmless asymmetry already documented for Dragon axe/claws (DEC-0044/0046). The outfit sets themselves will be pruned down to their remaining non-laddered pieces once the maintainer supplies tier data for the 3rd age wand, staff, cloak, coif, vambraces, amulet, mage hat, and robe pieces (in progress, see next decision).

**Source.** the maintainer, this session (2026-08-02): "Currently 3rd age pieces unlock the rest of the 3rd age set, this is inconsistent. 3rd age pieces should follow the laddering logic, so a third age sword unlocks all sword under it, a 3rd bow unlocks all bows below it"; confirmed extending this to platebody/platelegs/plateskirt/kiteshield/full helm since matching ladders already existed; "also start wand and staff. For the armour/robes etc these should be in a ladder too for their respective slot" (tier data pending).

---

### DEC-0080 - Wands laddered by Magic level, including 3rd age wand

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Wands", lowest to highest by Magic level to wield (per OSRS Wiki): Beginner wand (45) < Apprentice wand (50) < Teacher wand (55) < Master wand (60) < Dragon hunter wand (65) < 3rd age wand (65) < Kodai wand (80). Uses the existing `weapon-ladder-down` rule via the `weapon` tag.

Dragon hunter wand and 3rd age wand tie at 65 Magic - the maintainer rejected sharing one rung between them (screenshot flagged "never group items like this, they should be on their own row"), so each gets its own tier instead; Dragon hunter wand placed below 3rd age wand per the maintainer's tie-break call.

Kodai wand is also a member of the Chambers of Xeric uniques `group` (DEC-0046) - `ladder-down` resolves before `group`, so foiling Kodai wand directly now goes through this ladder instead, same asymmetry already documented for Dragon axe/claws. Foiling any *other* CoX unique still correctly lists Kodai wand as one of Great Olm's drops.

3rd age wand stays a factual member of the `third-age-mage` outfit group for now (harmless, since `ladder-down` resolves first - same deferred-pruning approach as DEC-0079) until the rest of that outfit's pieces (robes, mage hat, amulet) get their own ladders.

**Source.** the maintainer, this session (2026-08-02): screenshot of the OSRS Wiki wands table (Beginner/Apprentice/Teacher/Master, and the "Other wands" table with Dragon hunter wand/3rd age wand/Kodai wand), asking me to find each wand's Magic level and ladder them accordingly. Levels confirmed via the OSRS Wiki: Beginner wand (45), Apprentice wand (50), Teacher wand (55), Master wand (60), Dragon hunter wand (65), 3rd age wand (65), Kodai wand (80). Then, after seeing the tied rung rendered: "never group items like this, they should be on their own row"; "Dragon hunter wand below, 3rd age wand above" to break the tie.

---

### DEC-0081 - Coif, vambraces, mage hat, and mage robe pieces laddered; 3rd age cloak and amulet made solo items

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Continues DEC-0079/0080's principle of laddering 3rd age gear by its real-world material/magic-bonus progression instead of grouping it into outfit sets.

- **Coifs**: Coif < (Ancient/Armadyl/Bandos/Guthix/Saradomin/Zamorak coif, tied) < 3rd age range coif. Per the maintainer's correction - initially proposed as just Coif < 3rd age range coif (no god items), then broadened to include the god coifs after all.
- **Vambraces**: (Leather/Spiky/Black spiky/Blue spiky/Green spiky/Red spiky vambraces, tied) < Green d'hide < Blue d'hide < Red d'hide < Black d'hide < 3rd age vambraces < Zaryte vambraces. Gilded d'hide vambraces and Hueycoatl hide vambraces checked against the Wiki and excluded - neither matches the Black d'hide/3rd age tier cleanly (Gilded is a distinct lower-power F2P variant; Hueycoatl is a lateral "same ranged bonus, different secondary stat" reskin, not clearly above or below).
- **Mage hats**: (Black/Blue wizard hat, tied) < Mystic hat < (Infinity/Dark infinity/Light infinity hat, tied) < 3rd age mage hat. Ordered by Magic attack bonus per the OSRS Wiki (+2/+4/+6/+8).
- **Mage robe tops**: Mystic robe top < (Infinity/Dark infinity/Light infinity top, tied) < 3rd age robe top. No wizard-tier robe top exists as a card in this dataset, so the ladder starts at Mystic.
- **Mage robe bottoms**: (Black/Blue wizard robe, tied) < Mystic robe bottom < Infinity bottoms < 3rd age robe. Ordered by Magic attack bonus (+0/+15/+17/+19).

All five use the existing `armour-ladder-down` rule via the `armour` tag.

Ahrim's hood, Zuriel's hood, and Dagon'hai hat/robe pieces are excluded from the mage hat/robe ladders as boss/GWD-specific items, consistent with the "not god items" principle the maintainer set for these ladders.

**3rd age cloak and 3rd age amulet are solo items** - no lower tier exists for either, and the maintainer confirmed they should not group with the rest of the outfit. Removed from the `third-age-melee` and `third-age-mage` outfit sets respectively so they resolve `unresolved` (self-only, per DEC-0061/0062) rather than through the group.

**3rd age druidic cloak/robe bottoms/robe top/staff stay in the `third-age-druidic` outfit group as-is** - the maintainer confirmed "druidic can be left as a set," since 3rd age druidic staff has no Magic requirement at all (same stats as a Crozier) and there's no clean ladder for the druidic pieces to descend.

`third-age-range` keeps 3rd age range coif and 3rd age vambraces as factual members even though they now ladder independently - harmless, since `ladder-down` resolves before `group` (same deferred-pruning approach as DEC-0079/0080). 3rd age range top and 3rd age range legs still have no ladder, so the group remains load-bearing for them.

**Source.** the maintainer, this session (2026-08-02): "cloak, amulet solo, the rest unlock downwards but not god items like god dhide"; on coifs, "hmm maybe include god items then, so all god coifs below"; on vambraces, "all vambraces"; on the mage hat/robe proposal, "include all of those item[s]." OSRS Wiki, fetched 2026-08-02, for [Mystic hat](https://oldschool.runescape.wiki/w/Mystic_hat), [Magic armour](https://oldschool.runescape.wiki/w/Magic_armour) bonus tables, [3rd age vambraces](https://oldschool.runescape.wiki/w/3rd_age_vambraces), [Spiky vambraces](https://oldschool.runescape.wiki/w/Spiky_vambraces), [Zaryte vambraces](https://oldschool.runescape.wiki/w/Zaryte_vambraces), [Gilded d'hide vambraces](https://oldschool.runescape.wiki/w/Gilded_d%27hide_vambraces), [Hueycoatl hide vambraces](https://oldschool.runescape.wiki/w/Hueycoatl_hide_vambraces), [3rd age druidic staff](https://oldschool.runescape.wiki/w/3rd_age_druidic_staff).

---

### DEC-0082 - Tiaras laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Tiaras", lowest to highest by Crafting XP to make (per OSRS Wiki): Air (25) < Mind (27.5) < Water (30) < Earth (32.5) < Fire (35) < Body (37.5) < Cosmic (40) < Chaos (42.5) < Nature (45) < Law (47.5) < Death (50) < Blood (52.5) < Wrath (52.5). Uses the existing `resource-ladder-down` rule via the `resource` tag - a foil unlocks the wear verb on that tier and below; each tiara still needs a Tiara and the matching talisman to craft.

Blood and Wrath tiara tie at 52.5 XP - the maintainer broke the tie with Blood below, Wrath above, each on its own rung (no shared rungs, per the standing "never group items like this" rule from DEC-0080).

**Source.** the maintainer, this session (2026-08-02): "part of the runecrafting tiara ladder, unlocks ability to wear but still need respective items to craft" followed by the full Crafting XP/materials table for all 13 tiaras; "Blood below, Wrath above" for the tie-break.

---

### DEC-0083 - Bounty beaks grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Albatross beak, Frigatebird beak, Osprey beak, and Tern beak grouped flat - foiling any one unlocks all four. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks the other bounty beaks" with OSRS Wiki links to all four.

---

### DEC-0084 - Bounty feathers grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Albatross feather, Frigatebird feather, Osprey feather, and Tern feather grouped flat - foiling any one unlocks all four. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): OSRS Wiki links to all four bounty feathers.

---

### DEC-0085 - Alchemical hydra heads crafts grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Alchemical hydra heads, Hydra slayer helmet, and Stuffed hydra heads grouped flat - foiling any one unlocks the `craft` verb across all three. Hydra slayer helmet (i) is not a card in this dataset, so it's excluded.

**Correction on the product-boundary caveat.** The first pass used the generic `community-set-group` rule, which let the engine's default product-boundary logic fire the generic "you get the action, not what it makes" caveat - misleading here, since both crafted results (Hydra slayer helmet, Stuffed hydra heads) are already inside this same unlock set, not separate cards still to pull. Fixed with a dedicated `hydra-heads-craft-group` rule (new `hydra-heads-craft` family tag) that sets `grants.productBoundary: false` to suppress the generic caveat, plus a targeted `annotate` override on Alchemical hydra heads stating the one genuinely external requirement: crafting the Hydra slayer helmet also needs a Slayer helmet, which is not part of this unlock and has no rule of its own yet.

**Source.** the maintainer, this session (2026-08-02): "unlocks the slayer helm variants but still need the other items to craft them" with the crafting-requirements table for all three; then, after seeing the caveat rendered: "this isn't right for the alchemical hydra heads... Any of those means they're unlocked, the hydra slayer helm would still require the slayer helmet unlock."

---

### DEC-0086 - Mixology potions laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Mixology potions" (Mastering Mixology minigame), lowest to highest by Herblore level: Alco-augmentator < Mammoth-might mix < Liplack liquor (all three tied at level 60, ordered as the maintainer's table listed them, each on its own rung per the standing "never group items like this" rule) < Mystic mana amalgam (63) < Marley's moonlight (66) < Azure aura mix (69) < Aqualux amalgam (72) < Megalite liquid (75) < Anti-leech lotion (78) < Mixalot (81). Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks all mixology potions made in the minigame" with the full points/Herblore-level table for all 10.

---

### DEC-0087 - Teleport tablets laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Teleport tablets", lowest to highest by Construction level to make: Rimmington (1) < Taverley (10) < Pollnivneach (20) < Hosidius (25) < Rellekka (30) < Aldarin (35) < Brimhaven (40) < Yanille (50) < Prifddinas (70). Uses the existing `resource-ladder-down` rule via the `resource` tag. Trollheim teleport is not a card in this dataset, so it's excluded.

**Source.** the maintainer, this session (2026-08-02): "unlocks tablets below in a tree" with the full Construction-level table for all 10 tablets.

---

### DEC-0088 - Ambrosia and related consumables grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Nectar, Ambrosia, Blessed crystal scarab, Liquid adrenaline, Silk dressing, Smelling salts, and Tears of elidinis grouped flat - foiling any one unlocks all seven. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks: nectar, ambrosia, blessed crystal scarabs, liquid adrenaline, silk dressings, smelling salts, and tears of Elidinis."

---

### DEC-0089 - Broad bolts laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Broad bolts": Broad bolts < Amethyst broad bolts. Uses the existing `weapon-ladder-down` rule via the `weapon` tag. Unfinished broad bolt pack/Unfinished broad bolts are a different (unfletched) state, not included here.

**Source.** the maintainer, this session (2026-08-02): "unlocks broad bolts".

---

### DEC-0090 - Jewellery moulds grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Amulet mould, Bracelet mould, Holy mould, Necklace mould, Ring mould, Tiara mould, and Unholy mould grouped flat - foiling any one unlocks all seven. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks Amulet Bracelet Holy Necklace Ring Tiara Unholy".

---

### DEC-0091 - Fury amulets laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Fury amulets": Amulet of fury < Amulet of blood fury. Uses the existing `armour-ladder-down` rule via the `armour` tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks regular fury, laddered".

---

### DEC-0092 - Amulet of bounty added to the enchanted-jewellery composite model

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Amulet of bounty added as a `components` composite (whole = Amulet of bounty, parts = Opal amulet), same shape as the 27 existing enchanted-jewellery entries (DEC-0029/0033) which start at Sapphire tier - Opal/Jade/Red topaz tier items were never covered. No new rule needed; reuses `enchanted-jewellery-components`.

This started as a broader proposal to rework all charged jewellery into an uncharged/charged/dose-count grouping. Checked against the dataset: no jewellery item here has separate cards per charge state (Amulet of glory, Ring of dueling, Combat bracelet, etc. are each a single card covering every charge level), so there is nothing for that rework to act on. The maintainer's concrete example (Amulet of bounty unlocking Opal amulet and itself) turned out to match the existing components shape exactly - just a coverage gap at the Opal tier, not a new mechanism. No other Opal/Jade/Red topaz enchanted items were named, so none were added speculatively.

**Source.** the maintainer, this session (2026-08-02): "This type of item needs a rework. Jewellrey is technically a two 3 state item..."; after confirming no charge-state cards exist in this dataset, "so the amulet of bounty for example unlocks opal amulet and amulet of bounty. This applies to all jewellry that can be charged."

---

### DEC-0093 - Amulet of chemistry added to the enchanted-jewellery composite model

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Amulet of chemistry added as a `components` composite (whole = Amulet of chemistry, parts = Jade amulet), continuing DEC-0092's Opal/Jade-tier coverage. No new rule needed; reuses `enchanted-jewellery-components`.

**Source.** the maintainer, this session (2026-08-02): "again this unlocks itself and jade amulet".

---

### DEC-0094 - Amulet of eternal glory added as its own branch, separate from the Dragonstone amulet chain

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Amulet of eternal glory added as a `components` composite (whole = Amulet of eternal glory, parts = Amulet of Glory), tagged `enchanted-jewellery` so it reuses the existing rule. Deliberately does **not** chain further to Dragonstone amulet - Amulet of Glory already has its own separate `enchanted-jewellery` composite (whole = Amulet of Glory, parts = Dragonstone amulet, DEC-0029/0033), and `components` unlocks only a whole's *named* parts, not a part's own composite transitively - so this stays correctly scoped without any extra work.

An initial pass modeled this as a `ladder-down` family (Amulet of Glory < Amulet of eternal glory) instead, which would have been wrong: `ladder-down` resolves before `components` in the strategy order, so it would have silently hijacked every direct foil of Amulet of Glory away from its existing Dragonstone amulet unlock. Caught before landing and corrected to the composite shape.

**Source.** the maintainer, this session (2026-08-02): "unlocks amulet of glory but not dragonstone amulet, this is its own branch".

---

### DEC-0095 - Amy's saw added as a one-way upgrade of the basic Saw

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `components` composite (whole = Amy's saw, parts = Saw), with a new `upgrade-tool` family tag and matching rule - foiling Amy's saw unlocks both, but foiling the plain Saw does not unlock Amy's saw, per the maintainer. This is a new small relationship shape (a rare tool upgrade of a basic one), reusable for similar one-way tool-upgrade cases later in the alphabetical pass.

**Source.** the maintainer, this session (2026-08-02): "unlock regular saw but not the other way round".

---

### DEC-0096 - Amylase crystal grouped with Amylase pack

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Amylase crystal and Amylase pack grouped - foiling either unlocks both. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks amylase pack".

---

### DEC-0097 - Anchovy oil grouped with Anchovy paste

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Anchovy oil and Anchovy paste grouped - foiling either unlocks both. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks anchovy paste".

---

### DEC-0098 - Pizzas laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Pizzas", lowest to highest by Cooking level: Plain pizza (35) < Meat pizza (45) < Anchovy pizza (55) < Pineapple pizza (65). Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): "part of a tree" with the full Cooking level/XP/topping table for all 4 pizzas.

---

### DEC-0099 - God blessings grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Holy, Unholy, Peaceful, Honourable, War, and Ancient blessing (Saradomin/Zamorak/Guthix/Armadyl/Bandos/Zaros) grouped flat - foiling any one unlocks all six. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "all god blessings" with the GE price/god table for all 6.

---

### DEC-0100 - Ancient blood ornament kit added, applying to all three Torva pieces

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `components` composite (whole = Ancient blood ornament kit, parts = Torva full helm, Torva platebody, Torva platelegs) - foiling any of the four unlocks all four. New `ornament-kit` family tag and matching rule, since this is a genuinely new relationship shape (an ornament kit applying to several base armour pieces at once) not covered by any existing rule.

The crafted result (Sanguine torva full helm/platebody/platelegs) is **not** a card in this dataset, so it stays outside the unlock set and the product-boundary caveat fires generically ("whatever comes out is a separate card you still need to pull").

**Source.** the maintainer, this session (2026-08-02): "ability to wear blood torva, still need normal torva to craft it"; then the full crafting-requirements table confirming the kit applies to all three Torva pieces and the correct name is "Sanguine torva," not "Blood torva."

---

### DEC-0101 - God bracers grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak bracers grouped flat - foiling any one unlocks all six. No metal-tier bracers exist in this dataset to ladder against, and the maintainer confirmed no order among the six gods. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "unlocks bracers below it"; when asked for the tier order, "no order just unlocks those bracers then I guess."

---

### DEC-0102 - God chaps grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak chaps grouped flat - foiling any one unlocks all six. Same shape as the god bracers (DEC-0101) - no metal-tier chaps ladder applies to these 6, and the maintainer confirmed no order among them. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Group all 6 god chaps" (Recommended option).

---

### DEC-0103 - God cloaks grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak cloak grouped flat - foiling any one unlocks all six. Same shape as god bracers/chaps (DEC-0101/0102). Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Group all 6 god cloaks" (Recommended option).

---

### DEC-0104 - God coifs split out of the coif ladder into their own flat group; God croziers grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.**

- **Correction to DEC-0081**: the 6 god coifs (Ancient/Armadyl/Bandos/Guthix/Saradomin/Zamorak) are removed from the `coif` ladder and grouped flat instead - consistent with the god bracers/chaps/cloak treatment (DEC-0101-0103), since there's no real metal-tier relationship between the god coifs and the base Coif. The `coif` ladder now reads Coif < 3rd age range coif only.
- **God croziers**: Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak crozier grouped flat, same shape.

Both use the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "remove god coif from the coif tree and group all god coifs, yes group god croziers".

---

### DEC-0105 - Digsite unique artefacts grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Old symbol, Ancient symbol, Old coin, and Ancient coin grouped flat - foiling any one unlocks all four. Uses the existing `community-set-group` rule/tag. Clean necklace (also a unique Digsite find) is not a card in this dataset, so it's excluded. The much longer common/unremarkable finds table (Iron dagger, Bones, Coins, Broken arrow, Broken glass, Pottery, Jewellery, etc) is deliberately excluded - those are ordinary widespread drops, not Digsite-specific, per the "not common/shared drops" policy already established (DEC-0038/0040).

**Source.** the maintainer, this session (2026-08-02): "unlocks group of artifacts" with the full Digsite uncleaned-finds drop table; confirmed scoping to just the unique finds.

---

### DEC-0106 - God d'hide bodies grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak d'hide body grouped flat - foiling any one unlocks all six. Same shape as the other god-item groups (DEC-0101-0104). Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Group all god d'hide bodies" (Recommended option).

---

### DEC-0107 - God d'hide boots grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak d'hide boots grouped flat - foiling any one unlocks all six. Same shape as the other god-item groups. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Group all god d'hide boots" (Recommended option).

---

### DEC-0108 - God d'hide shields grouped

**Status:** Active
**Date:** 2026-08-02

**Ruling.** Ancient, Armadyl, Bandos, Guthix, Saradomin, and Zamorak d'hide shield grouped flat - foiling any one unlocks all six. Same shape as the other god-item groups. Uses the existing `community-set-group` rule/tag.

**Source.** the maintainer, this session (2026-08-02): "Group all god d'hide shields" (Recommended option).

---

### DEC-0109 - Ancient artefacts laddered

**Status:** Active
**Date:** 2026-08-02

**Ruling.** New `ladder-down` family "Ancient artefacts", lowest to highest by coin value: Ancient emblem (500k) < Ancient totem (1M) < Ancient statuette (2M) < Ancient medallion (4M) < Ancient effigy (8M) < Ancient relic (16M). Uses the existing `resource-ladder-down` rule via the `resource` tag.

**Source.** the maintainer, this session (2026-08-02): "laddered with the others" with the coins-given/GE-price table for all six artefacts.
