import './style.css'
import { CAMPS_SOURCE, DISCORD_URL, GUIDELINE_LINE, RESOLUTION_ORDER, SUGGEST_A_RULE_URL } from './ui/copy.ts'
import { esc } from './ui/html.ts'
import { renderShell } from './ui/shell.ts'

/**
 * Coverage as of the last `npm run validate-rules` run (Phase 7 round 1 data). This
 * is a hand-updated number, not a live computation - About is a separate, lightweight
 * Vite entry that should not pull in the ~2.6 MB rules dataset just to count it.
 * Re-check it whenever `data/` changes and update this line alongside.
 */
const COVERAGE = { resolved: 790, total: 6376 }
const coveragePct = ((COVERAGE.resolved / COVERAGE.total) * 100).toFixed(1)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderShell(
  { current: 'about' },
  `
    <h2 class="page-title">About</h2>
    <p class="guideline" role="note">${esc(GUIDELINE_LINE)}</p>

    <section class="result__section">
      <h2 class="result__heading">What this is</h2>
      <p class="about__body">
        The OSRS TCG RuneLite plugin unlocks in-game items behind cards pulled from booster packs.
        Cards have a rare foil variant, and there is no single agreed answer for what a foil actually
        does. This tool answers that question for a specific item: what it unlocks, what it does not,
        why, and how confident the community is about it.
      </p>
      <p class="about__body">
        A rule only ships once it has a stated source - the project brief, a community source, or an
        explicit decision recorded with its rationale. Anything without a source shows honestly as
        <strong>not decided yet</strong>, rather than a guess. Being wrong is worse than being
        incomplete: a confidently wrong answer defeats the point of the tool, and an honest
        "undecided" is still more useful than what a player has today without it.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">Coverage right now</h2>
      <p class="coverage">
        <span class="coverage__pct">${coveragePct}%</span>
        <span class="coverage__of">${COVERAGE.resolved} of ${COVERAGE.total} cards resolve to a sourced ruling</span>
      </p>
      <div class="coverage__bar" role="img" aria-label="${coveragePct} per cent of cards have a sourced ruling">
        <div class="coverage__fill" style="width: ${coveragePct}%"></div>
      </div>
      <p class="about__body">
        The rest are honestly <strong>unresolved</strong>. That number climbs over time as rules get
        worked out deliberately, never in a hurry to fill a gap.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">Where people disagree</h2>
      <p class="about__body">
        Three camps show up in the community's own discussion of foils, and none is treated as more
        correct than the others here. That split, the questions still genuinely open, and how a
        ruling gets made and challenged all live on
        <a class="link" href="/open-questions.html">Open questions</a>.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">How a card gets resolved</h2>
      <p class="principles__lede">These are checked in order; the first one that matches wins.</p>
      <ol class="checked">
        ${RESOLUTION_ORDER.map(
          (step) => `
          <li class="checked__item">
            <span class="checked__label">${esc(step.label)}</span>
            <span class="checked__body">${esc(step.body)}</span>
          </li>
        `,
        ).join('')}
      </ol>
    </section>

    <section class="result__section">
      <h2 class="result__heading">Guidelines, not rulings</h2>
      <p class="about__body">
        Nothing here is gospel. Every result is a reasoned guideline meant to help a player reach a
        logical decision - player discretion, and your group's, applies throughout. Where a ruleset
        changes what's expected of you (whether you may gather-then-bank before an unlock, or not
        touch the source at all), that's stated on the result rather than folded silently into the
        answer.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">Sources and attribution</h2>
      <ul class="sources">
        <li class="sources__item">
          Card data comes from the
          <a class="link" href="https://github.com/Azderi/osrs-tcg" target="_blank" rel="noopener">OSRS TCG RuneLite plugin</a>
          by Azderi.
        </li>
        <li class="sources__item">
          Item names, images and examine text originate with the
          <a class="link" href="https://oldschool.runescape.wiki/" target="_blank" rel="noopener">Old School RuneScape Wiki</a>.
        </li>
        <li class="sources__item">
          The foil resolution order and explicit ladders (shortbow, longbow, pickaxe, axe) are
          transcribed from
          <a class="link" href="https://oldschool.runescape.wiki/w/User:TheSeahorsie/TCG_Foil_Rules" target="_blank" rel="noopener">TheSeahorsie's TCG Foil Rules page</a>.
        </li>
        <li class="sources__item">
          The three community camps on
          <a class="link" href="/open-questions.html">Open questions</a> are summarised from
          <a class="link" href="${esc(CAMPS_SOURCE.url)}" target="_blank" rel="noopener">${esc(CAMPS_SOURCE.label)}</a>.
        </li>
      </ul>
    </section>

    <section class="result__section handoff">
      <h2 class="result__heading">Suggest a rule</h2>
      <p class="handoff__body">
        Undecided cases get argued out in the community Discord, and settled rules get recorded with
        their reasoning. That's the place to bring a case that isn't covered yet - or one you think
        was called wrong. <a class="link" href="/open-questions.html">Open questions</a> covers how
        that works.
      </p>
      <div class="handoff__actions">
        ${
          DISCORD_URL
            ? `<a class="button button--primary" href="${esc(DISCORD_URL)}" target="_blank" rel="noopener">Suggest it in the Discord</a>`
            : ''
        }
        <a class="button" href="${esc(SUGGEST_A_RULE_URL)}" target="_blank" rel="noopener">Open a GitHub issue</a>
      </div>
    </section>
  `,
)
