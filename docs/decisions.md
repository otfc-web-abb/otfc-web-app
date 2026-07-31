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

**Source.** Rhys, project brief. Recorded in `phased_plan.md` under "Rules decided so far - State pairs". Contradicts [osrscardexchange - Foil cards: what people say](https://www.osrscardexchange.com/blog/foil-cards-what-people-say).

---

### DEC-0002 - Unsourced cases resolve to `unresolved`, enforced by schema

**Status:** Active
**Date:** 2026-07-30

**Ruling.** `sources` is a required, non-empty field on every `rules.json` and `overrides.json` entry. An unsourced rule fails schema validation and cannot ship. Any card with no matching sourced rule resolves to `unresolved`, which is a designed output state with its own presentation, not an error.

The engine has no fallback heuristic and no default strategy. Absence of data produces `unresolved`, always.

**Rationale.** The governing principle of the project, made mechanical. Leaving it as a guideline means it erodes under pressure to raise coverage; making it a schema error means it cannot. A confidently wrong ruling destroys the app's reason to exist, while an honest "not decided yet" is still more useful than what a player has today.

**Source.** Rhys, project brief. `phased_plan.md`, "Governing principle: do not invent rules".

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

**Source.** Rhys and Claude, this session. Input: [User:TheSeahorsie/TCG_Foil_Rules](https://oldschool.runescape.wiki/w/User:TheSeahorsie/TCG_Foil_Rules), which orders pickaxes `Crystal > 3rd age > Dragon > Gilded > Rune`.

---

### DEC-0004 - `extreme` defined from the osrscardexchange framing only

**Status:** Active
**Date:** 2026-07-30

**Ruling.** The `extreme` ruleset is defined as: the unlock set is unchanged, but any interaction with a locked source is forbidden, so acquisition verbs on not-yet-unlocked cards are unavailable and the player cannot gather-then-bank ahead of the unlock. `standard` permits gather-then-bank.

`extreme` ships at `confidence: "contested"`, which caps every result under that ruleset at `contested`.

**Rationale.** The [Reddit extreme-cardlocked-ironman thread](https://www.reddit.com/r/2007scape/comments/1v2ozlz/extreme_cardlocked_ironman_ruleset_osrs_tcg/) is the primary source and Reddit blocks tooling from fetching it. Rather than leave `extreme` undefined - which would return `unresolved` for every card under that ruleset and make the toggle useless - it is defined from the secondhand summary that *is* sourced, and flagged as contested so the output never claims more authority than the source supports.

Rejected: defining it from inference about how ironman rulesets usually work. That is inventing a rule.

**Source.** [osrscardexchange - Foil cards: what people say](https://www.osrscardexchange.com/blog/foil-cards-what-people-say), the ruleset-dependent camp. Decision to proceed on that basis alone: Rhys, this session.

**Open.** The Reddit thread still needs a manual read. When it is read, a new entry either confirms this definition and raises confidence, or supersedes it.

---

### DEC-0005 - Resource unlocks grant verbs, not downstream products

**Status:** Active
**Date:** 2026-07-30

**Ruling.** A foil resource unlocks the relevant verbs for that resource and everything below it, and does **not** unlock the item those verbs produce. Foil Iron ore grants mine and smelt on iron ore and below; the player still needs the Iron bar card to do anything with the bar.

Mechanically: when a resolution grants a transformation action (`smelt`, `smith`, `cook`, `craft`, `fletch`) on a card whose product is a card outside that resolution's own unlock set, the engine attaches the product-boundary caveat and the result view shows it as a boundary rather than a footnote.

**Rationale.** From the brief. Pinned as its own entry because it is the mechanism the whole action vocabulary exists to serve - without it the app is a list of item names, and a player would reasonably read "unlocks iron" as covering the bar.

Deriving the caveat from the action class rather than authoring it per rule keeps it correct in both directions: it fires for foil Iron ore, and correctly stays silent for foil Raw trout, where `cook` produces Trout and Trout is already in the unlock set.

**Source.** Rhys, project brief. `phased_plan.md`, "Rules decided so far - From the project brief".

---

### DEC-0006 - Cosmetic tiers resolved: White and Gilded are their own rungs

**Status:** Active (supersedes the deferral in DEC-0003)
**Date:** 2026-07-31

**Ruling.** White armour is its own rung, sitting `Black < White < Mithril`, in every metal-tier armour ladder where a White piece exists: full helm, platebody, platelegs, plateskirt, kiteshield, sq shield, chainbody, med helm, boots, gloves, longsword, 2h sword, dagger, mace, battleaxe, claws, halberd. A foil White piece unlocks White and everything below (Black downward); a foil Black piece does not unlock White.

Gilded is its own rung above Rune (`Rune < Gilded`, below Dragon where a Dragon tier exists), in every family where a Gilded piece exists: full helm, kiteshield, chainbody, med helm, boots, platebody, platelegs, plateskirt, sq shield, 2h sword, and the three dragonhide armour pieces (body, chaps, vambraces). A foil Gilded piece unlocks Gilded and everything below, down to bronze.

Trimmed `(t)` armour would unlock the full trimmed set rather than descending - but no `(t)` cards exist anywhere in `Card.json`, so this half of the ruling has no data to apply to and is recorded for when the plugin adds them.

**Rationale.** This is the question DEC-0003 deferred, settled directly by Rhys rather than inferred from a forum page - per Rhys's instruction on 2026-07-31, no ruling in this project cites public-forum material as its source going forward. Existing forum-sourced rules already shipped (the four TheSeahorsie ladders, the ruleset definitions) are left as they are; only new rulings are affected.

The mechanism needed no engine change: `armour-ladder-down` and `weapon-ladder-down` already select by `familyTags: ["armour"/"weapon"]`, so adding the White and Gilded rungs to the existing family data is sufficient - this decision is what licenses that data edit, per DEC-0003's own wording that "rung placement is the ruling".

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0007 - Dragonhide armour ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Dragonhide armour (body, chaps, vambraces) descends the colour tier the same way metal armour descends: `Green < Blue < Red < Black < Gilded` (Gilded per DEC-0006, where it exists). A foil piece unlocks that colour and every colour below it, for that piece only.

This is new `families.json` ladder data (three new families, tagged `armour`), not a new rule - `armour-ladder-down` already covers any family tagged `armour`.

**Rationale.** Same shape as the brief's own worked example (a metal-tier piece progression), just gated on this decision because the brief's wording is about metal tiers specifically and dragonhide wasn't in Phase 2's built-out list.

The god-alignment recolours of Black d'hide body (Ancient, Armadyl, Bandos, Guthix, Saradomin, Zamorak) are left out of the ladder - they are cosmetic minigame rewards with no established rank relative to Black or each other, and ruling on them without a source would be a guess. They stay `unresolved`.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0008 - Elemental/catalytic rune ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The elemental and catalytic rune ladder (`Air < Mind < Water < Earth < Fire < Body < Cosmic < Chaos < Astral < Nature < Law < Death < Blood < Soul < Wrath`) descends. A foil rune unlocks every rune below it in this order.

New `rules.json` entry selecting the existing `rune` family by explicit id.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0009 - Combination runes form their own descending ladder

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Combination runes (Mist, Dust, Mud, Smoke, Steam, Lava) unlock other combination runes and follow the downward unlock rule among themselves - they do not connect to the elemental rune ladder (DEC-0008) or unlock their component elemental runes. Rung order is fixed by their Runecrafting level requirement: `Mist (6) < Dust (10) < Mud (13) < Smoke (15) < Steam (19) < Lava (23)`.

New `families.json` ladder family `combination-rune`, plus a new `rules.json` entry selecting it by explicit id.

**Rationale.** Rhys's ruling explicitly rejects the "breaks down into components" reading that a combination rune's dual nature might suggest - the wiki confirms there is no in-game mechanism to physically split one back into its two elemental runes, so `components` would have had no factual basis anyway. Runecrafting level is used as the ordering key because it is the only factual, game-derived tier signal available; the pairing itself (which two elements) is not an ordering.

**Source.** Rhys, this session (2026-07-31). Runecrafting levels: OSRS Wiki, Combination runes.

---

### DEC-0010 - Plank ladder descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The plank ladder (`Plank < Oak plank < Teak plank < Mahogany plank`) descends. A foil plank unlocks every plank below it.

New `rules.json` entry selecting the existing `plank` family by explicit id.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0011 - Unenchanted jewellery ladders descend, by piece type

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Each unenchanted jewellery ladder - ring, necklace, amulet, bracelet - descends independently by gem tier (`gold < opal < jade < ... < zenyte`, per the existing family data). A foil piece unlocks every piece of the *same* type below it: foil Diamond ring unlocks rings below diamond, not necklaces or amulets. Enchanted jewellery is out of scope - these families already hold only the unenchanted base pieces.

New `rules.json` entry selecting `ring`, `necklace`, `amulet`, `bracelet` by explicit id.

**Rationale.** The brief's downward-unlock rule is stated for metal armour/weapon tiers; jewellery is a different item shape (a gem set into a mould, not a material reforged), so it needed its own ruling rather than inheriting the brief's rule by analogy. Rhys's ruling makes it explicit rather than assumed.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0012 - State-pair rule widened to cut gems and tanned hides

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The state-pair rule (DEC-0001: both states unlocked, no ladder descent) is widened from `cook`/`clean` to also cover `cut` (uncut gem / cut gem, 10 pairs) and `tan` (raw hide / tanned leather, 6 pairs including the three dragonhide-to-dragon-leather pairs and cowhide-to-leather). A foil Uncut diamond unlocks Uncut diamond and Diamond, not other gems; a foil Cowhide unlocks Cowhide and Leather, not other hides.

Mechanically: `state-pair-both-states-only`'s `applies.statePairKinds` gains `"cut"` and `"tan"`. No new rule, no engine change.

**Rationale.** DEC-0001 was scoped to `cook` and `clean` because that was as far as the worked example went at the time, not because `cut` and `tan` were considered and excluded. Rhys confirms the same reasoning applies: a gem or a hide with two forms is one item finished, not a rung descended. This also means the standalone `gem` ladder and the jewellery ladders (DEC-0011) never compete with this rule in practice for cut/uncut cards, since state-pair is checked before ladder-down in the resolution order.

**Source.** Rhys, this session (2026-07-31).

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

**Rationale.** These are all cases TheSeahorsie's page gestures at generically ("if the item is part of a group, unlock the group") but per Rhys's instruction this round no ruling cites that page - each grouping here is Rhys's own call, made item by item rather than inferred from the forum wording. 3rd age's split into four groups rather than one, and the amulet/cloak/vambraces assignment to mage/melee/range respectively, and Elite void's separation from regular Void, are all judgement calls Rhys made explicitly rather than obvious lookups.

Godswords (hilt + blade as `components`) were raised and put on hold - not decided this round.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0014 - Camdozaal vault lockboxes unlock as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Simple lockbox, Elaborate lockbox, and Ornate lockbox unlock each other as a flat group - any one unlocks the other two, direction does not matter. Forgotten lockbox (from Yama's vaults, a different reward entirely despite the shared name) is not part of this group and stays `unresolved`.

New `families.json` `kind: "set"` entry tagged `community-set` - the existing `community-set-group` rule (DEC-0013) already covers it, no new rule needed.

**Rationale.** Rhys's own account holds the Ornate lockbox as a foil; the question of what it should unlock surfaced this ruling directly. Initially read as a possible downward-unlock ladder (Simple < Elaborate < Ornate, matching the wiki's display order), Rhys confirmed it is a flat group instead - the three are reward-tier variants of the same container, not a stat progression.

**Source.** Rhys, this session (2026-07-31). Card check: OSRS Wiki, Camdozaal Vault.

---

### DEC-0015 - Achievement diary tiered reward items descend, as a general principle

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Every achievement-diary reward item that ships in four numbered tiers (Easy/Medium/Hard/Elite, represented in `Card.json` as `<item> 1`..`<item> 4`) follows the same downward-unlock rule as metal armour: a foil of a higher tier unlocks that tier and every tier below it. This is a **general principle**, not a per-item ruling - it covers every card series of this shape, named or not.

Confirmed series, all four tiers present in `Card.json`: Rada's blessing, Explorer's ring, Desert amulet, Fremennik sea boots, Ardougne cloak, Falador shield, Karamja gloves, Kandarin headgear, Morytania legs, Varrock armour, Wilderness sword, Western banner.

New `families.json` ladder families (12), tagged `diary-reward`, plus one new `rules.json` entry (`diary-reward-ladder-down`) selecting that tag.

**Rationale.** Raised via Rada's blessing specifically; Rhys's ruling was stated as covering the whole shape rather than that one item, which is why this entry lists every matching series found in the shipped card data rather than adding them one at a time.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0016 - The Barronite mace network: two separate flat groups, not one chain

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Two unrelated flat groups, not a `components` chain:

- **Barronite mace crafting components**, among themselves only: Barronite guard, Barronite handle, Barronite head. A foil of one unlocks the other two. None of the three unlock the assembled Barronite mace, and the mace does not unlock them - the mace is a one-way, non-reversible assembly (confirmed: it cannot be broken back down in-game, only exchanged for currency).
- **Barronite mace and its reward-pool siblings**, a separate flat group of seven: Barronite mace, Ancient globe, Ancient astroscope, Ancient carcanet, Ancient ledger, Ancient treatise, Imcando hammer. Any one of the seven unlocks all the others.

New `families.json` `kind: "set"` entries (`barronite-components`, `barronite-mace-rewards`), both tagged `community-set` - no new rule needed, DEC-0013's rule already covers the tag.

**Rationale.** This is the case that ruled out `components` as the mechanism generally, not just for godswords (still on hold): a whole and its parts are not automatically a two-way relationship even when the parts are the only way to obtain the whole. Rhys's ruling keeps possession (the crafting materials) and completion-reward pool (the finished set of Fossil Island unlock items) as genuinely separate questions.

**Source.** Rhys, this session (2026-07-31). Component list: OSRS Wiki, Barronite mace.

---

### DEC-0017 - Fire cape / Infernal cape descends

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Infernal cape unlocks Fire cape below it; Fire cape does not unlock Infernal cape. The TzHaar Fight Cave cape has no card in `Card.json`, so this is a two-rung ladder, not three.

New `families.json` ladder family `fire-infernal-cape`, plus a new `rules.json` entry (`fire-cape-ladder-down`) selecting it by explicit id.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0018 - Fremennik rings unlock as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Berserker ring, Archers ring, Warrior ring, and Seers ring - the four same-tier Fremennik combat rings - unlock each other as a flat group.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0019 - Barbarian Assault reward equipment unlocks as a flat group

**Status:** Active
**Date:** 2026-07-31

**Ruling.** The eight Barbarian Assault reward-shop equipment pieces unlock each other as a flat group: Fighter hat, Ranger hat, Healer hat, Runner hat, Fighter torso, Penance skirt, Runner boots, Penance gloves.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0020 - Obsidian armour unlocks as a flat group; cape and Toktz- weapons excluded

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Obsidian helmet, Obsidian platebody, and Obsidian platelegs unlock each other as a flat group. Obsidian cape is explicitly excluded (it is a Fire cape recolour, not part of this set). The Toktz- weapons (Toktz-xil-ak, Toktz-mej-tal, Toktz-xil-ek, Toktz-ket-xil) are excluded and shelved, not ruled on this round.

New `families.json` `kind: "set"` entry tagged `community-set`, covered by the existing DEC-0013 rule.

**Source.** Rhys, this session (2026-07-31).

---

### DEC-0021 - Avernic defender joins the defender ladder; Mooleta explicitly excluded

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Avernic defender is the new top rung on the existing `defender` ladder, above Dragon: a foil Avernic defender unlocks the whole ladder down to Bronze. Mooleta - a shield-slot off-hand item the OSRS Wiki groups under "defenders" in its infobox template - is explicitly **not** part of this ladder; it is a mechanically distinct item (an "Other" category on the wiki's own defenders template, not part of the bronze-to-dragon-to-avernic tier chain) and stays `unresolved`. The Avernic defender hilt and the Dragon/Rune defender ornament kits are also excluded, as components/cosmetics not ruled on this round.

This is a data-only change - the `defender` family is already tagged `armour`, so the existing `armour-ladder-down` rule already covers it; no new `rules.json` entry needed.

**Rationale.** Mooleta's wiki categorisation is a trap for exactly this kind of ruling: it presents as a defender but isn't one mechanically (different stats, different acquisition, the wiki's own template marks it "Other"). Recording the exclusion explicitly, rather than leaving it silently absent, is the point - a future session should not assume it belongs just because a card search turns it up next to "defender".

**Source.** Rhys, this session (2026-07-31). Mooleta confirmed via OSRS Wiki as wiki-adjacent but not part of the tier chain.

---

### DEC-0022 - NPC hierarchy, first case: a foil boss unlocks the boss plus its uniques

**Status:** Active (first case only - the general NPC hierarchy data model remains unspecified, per rules-spec section 6.6)
**Date:** 2026-07-31

**Ruling.** A foil of a boss NPC, or a foil of one of that boss's unique drops, unlocks the boss and every one of its uniques as a flat group. Ruled as a general principle ("this applies to every boss in the game"), but built out for one boss only this round: **General Graardor**, unlocking General Graardor, Bandos chestplate, Bandos tassets, Bandos boots, Bandos hilt, Godsword shard 1, Godsword shard 2, and Godsword shard 3. The three Godsword shards are included even though they are not exclusive to Graardor - all four Godwars Dungeon generals drop them - because Rhys confirmed they should be, on the reading that Graardor is still a valid source for them, not that they belong to him alone.

What a foil of a *unique item itself* unlocks (as opposed to a foil of the boss) was raised and explicitly deferred - "we will come back to" - so is not decided beyond following the same flat-group membership recorded here.

Mechanically, this needed no `npc-hierarchy` engine work at all: it is expressed as an ordinary `kind: "set"` family (`boss-general-graardor`) tagged `boss-group`, with one new `rules.json` entry (`boss-group`) selecting that tag via the existing `group` strategy. This is a deliberate choice, not a resolution of section 6.6 - `npc-hierarchy` remains unspecified, and this ruling works around that gap rather than filling it: it says nothing about NPC variant hierarchy (Pets > Boss > Superior > Normal), horizontal unlocks, or any boss whose uniques should NOT include the boss itself.

**Rationale.** The full NPC/boss domain is explicitly out of MVP scope and project-sized on its own (phased_plan.md, "Monster and NPC domain"). Rather than leave a real, concrete case on the table because the general model isn't built, this ruling establishes the pattern - boss + uniques as a `boss-group`-tagged set - that future sessions can repeat per boss without more engine work, while leaving the harder questions (variant hierarchy, what a foil unique alone grants, whether every boss's group should include the boss itself) genuinely open.

**Source.** Rhys, this session (2026-07-31). Uniques list: OSRS Wiki, General Graardor.

---

### DEC-0024 - Tiered utility items descend like armour and weapons

**Status:** Active
**Date:** 2026-07-31

**Ruling.** Six ladder families that had no rule now descend under the ordinary downward-unlock reading: `cannonball`, `coffin`, `locks`, `nails`, `limbs` and `keel-parts`. A foil of one unlocks that tier and every tier below it in the same family, and nothing above.

**Rationale.** Each is a metal-tier progression with the same shape as the armour and weapon ladders already covered by DEC-0002's downward reading. Nothing about them argues for different treatment, and leaving them unresolved was an accident of coverage rather than a judgement that they were hard. They are given their own `families` selectors rather than a shared tag because they carry no common tag today and inventing one would imply a category that does not otherwise exist.

**Source.** Rhys, this session (2026-07-31), ruling each family in turn.

---

### DEC-0025 - Keys unlock across eyelet colours at their own tier

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil key unlocks every eyelet colour of a key at that same tier, and nothing above or below. A foil Bronze key black unlocks the bronze key in all five colours (black, brown, crimson, purple, red). The tiers are bronze, steel, black, silver, gold.

This replaces the five per-colour ladder families (`key-black`, `key-brown`, `key-crimson`, `key-purple`, `key-red`) with five per-tier set families (`keys-bronze`, `keys-steel`, `keys-black`, `keys-silver`, `keys-gold`), each tagged `key-tier`, selected by one `group` rule.

**Rationale.** The colour is an eyelet variant, not a progression step - the five colours at a tier are the same key. Modelling them as five colour ladders made the tier the thing you climb and the colour the thing you are locked into, which is backwards. Restructuring the data was preferred over adding a new `tier-group` strategy to the engine: the existing `group` strategy already expresses "these unlock together" exactly, and a new strategy would have needed spec, engine and validator work to say the same thing. The per-colour ladders are removed rather than left in place, because a ladder no rule descends is the failure mode DEC-0026 was written to stop.

**Source.** Rhys, this session (2026-07-31): "so it goes bronze, steel, black, silver, gold. Any of these keys unlocks all of its colours".

---

### DEC-0026 - A state pair reports a stopped ladder only when a rule would have descended it

**Status:** Active (amends rules-spec section 6.2)
**Date:** 2026-07-31

**Ruling.** When a `state-pair` resolution looks for the ladder it stopped, it considers only ladders that a `ladder-down` rule actually selects. A ladder family that exists as factual ordering but that no rule descends is not reported: no `family` context, no `excluded` list.

In practice this means foil Zenyte, Uncut ruby, Grimy torstol and Green dragonhide now answer with their two states alone. The gem, herb, dragonhide and dragon-leather ladders are no longer drawn beneath them.

**Rationale.** Section 6.2's excluded list exists so a player can see what the pair cost them - "the player needs to see that the state pair stopped the descent". That justification only holds where a descent would otherwise have happened. The gem, herb, dragonhide and dragon-leather families carry no `ladder-down` rule at all, so nothing was ever going to descend and the pair stopped nothing.

Reporting them anyway produced a screen that contradicted itself: foil Zenyte drew the full ten-rung gem ladder with nine rungs marked "still locked", implying nine gems were forfeited, while the unlock section directly below it said "On Uncut zenyte, and nothing else". The partner card was pushed into that footnote precisely because it is not a member of the ladder being drawn. Both statements were generated from the same correct unlock set; only the framing was wrong.

The precedence of `state-pair` over `ladder-down` (DEC-0001) is untouched. Raw trout still stops a fish ladder if one is ever given a rule, and the excluded list still fills in that case. What changed is only which ladders count as stopped.

**Source.** Rhys, this session (2026-07-31): "this logic shouldnt even be touching them, it should just be state pair for all gems, cut or uncut", and the same for herbs.

---

### DEC-0027 - Godswords unlock the godsword, its hilt, all shards, and the blade, as components

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil godsword (Bandos, Armadyl, Saradomin or Zamorak) unlocks the godsword itself, its own hilt, all three godsword shards, and the assembled Godsword blade. A foil of a shard or the blade alone does not unlock the godsword back - see DEC-0028 for what a foil hilt alone does, which is a different answer.

Modelled as a `components` family per god (`bandos-godsword`, `armadyl-godsword`, `saradomin-godsword`, `zamorak-godsword`), replacing the previous `bandos-hilt-group` `set` family, which existed for Bandos only and left the other three gods with no rule at all. The `hilt-group` rule and tag are retired; a new `godsword-components` rule selects the four families via a shared `godsword` tag through the existing `components` strategy.

**Rationale.** The three shards (and the blade assembled from them) are the same physical items across all four gods - shard 1 is not a Bandos shard or an Armadyl shard, it is a shard. Modelling each god as a `group` (`set`) family containing the shards, as the old Bandos-only entry did, works only in isolation: once a second god-family also lists the same shard cards as members, `matchFamily`'s tag-based lookup returns whichever candidate family sorts first alphabetically, not the one the player actually foiled toward. `components` sidesteps this by design - rules-spec 6.4 fires it only when the searched card is the *whole*, so a foil shard or blade never resolves through this rule at all, and the four-way collision never happens. What a bare foil shard or blade unlocks by itself is not decided by this ruling and falls to `unresolved`.

Ancient godsword and Ancient hilt are excluded here. Whether they follow the same shard-combination mechanic as the four GWD generals is uncertain and not investigated as part of this ruling.

**Source.** Rhys, this session (2026-07-31): "Godswords unlock the godsword, respective hilt and all shards", clarified to include the assembled Godsword blade card alongside the shards.

---

### DEC-0028 - A foil godsword hilt unlocks only itself and the godsword

**Status:** Active
**Date:** 2026-07-31

**Ruling.** A foil godsword hilt (Bandos, Armadyl, Saradomin or Zamorak) unlocks itself and the completed godsword only - not the shards, not the Godsword blade. This is narrower than what a foil of the completed godsword grants (DEC-0027): the relationship is not symmetric.

Modelled as a second `components` family per god (`bandos-hilt-godsword`, `armadyl-hilt-godsword`, `saradomin-hilt-godsword`, `zamorak-hilt-godsword`), each with the hilt as `whole` and the godsword as its only `part`. A new `godsword-hilt-components` rule selects these via a `godsword-hilt` tag. The hilt is the `whole` of this family and a `part` of its god's `godsword` family from DEC-0027 at the same time; `matchFamily` filters composite candidates to where the searched card equals that family's `whole`, so the two families do not collide - foiling the hilt matches only the hilt-family, foiling the godsword matches only the godsword-family.

**Rationale.** Rhys's phrasing was explicit and asymmetric: "a foil godsword hilt unlocks the hilt and godsword, not the blades" against "a foil godsword would unlock the godsword, hilt and blades" - two different unlock sets depending on which card is foiled, not one mutual set. This is a deliberate departure from the symmetric shape every other `components` family in this dataset has used so far (Barronite mace, DEC-0016) and is worth naming as its own decision rather than folding into DEC-0027, since a future session reading DEC-0027 alone would otherwise reasonably assume the hilt granted everything the godsword does.

A foil shard or foil Godsword blade alone is still not decided and still resolves `unresolved`.

**Source.** Rhys, this session (2026-07-31): "I would say a foil godsword hilt unlocks the hilt and godsword, not the blades. A foil godsword would unlock the godsword, hilt and blades." "Blades" confirmed to mean both the three shards and the separate Godsword blade card.
