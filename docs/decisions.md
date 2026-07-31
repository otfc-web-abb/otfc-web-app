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
