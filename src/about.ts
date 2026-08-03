import './style.css'
import { CAMPS_SOURCE, GUIDELINE_LINE, RESOLUTION_ORDER } from './ui/copy.ts'
import { esc } from './ui/html.ts'
import { renderShell } from './ui/shell.ts'

/**
 * Coverage as of the last `npm run validate-rules` run (DEC-0078, alphabetical item
 * pass). This is a hand-updated number, not a live computation - About is a separate,
 * lightweight Vite entry that should not pull in the ~2.6 MB rules dataset just to
 * count it. Re-check it whenever `data/` changes and update this line alongside.
 */
const COVERAGE = { resolved: 1491, total: 6376 }
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
        Cards have a rare foil variant, and there is no agreed answer for what a foil does. This tool
        answers that for a specific item: what it unlocks, what it does not, and how confident the
        community is about it.
      </p>
      <p class="about__body">
        A rule only ships with a stated source. Anything without one shows as
        <strong>not decided yet</strong> rather than a guess - being wrong is worse than being
        incomplete. Where the community is split,
        <a class="link" href="/open-questions.html">Open questions</a> sets out the positions.
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
        The rest show as <strong>unresolved</strong>. That number climbs as rules get worked out,
        never in a hurry to fill a gap.
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
      <h2 class="result__heading">Sources and attribution</h2>
      <p class="principles__lede">Card data and item names are credited in the footer.</p>
      <ul class="sources">
        <li class="sources__item">
          Resolution order and the explicit ladders, from
          <a class="link" href="https://oldschool.runescape.wiki/w/User:TheSeahorsie/TCG_Foil_Rules" target="_blank" rel="noopener">TheSeahorsie's TCG Foil Rules page</a>.
        </li>
        <li class="sources__item">
          The community camps, from
          <a class="link" href="${esc(CAMPS_SOURCE.url)}" target="_blank" rel="noopener">${esc(CAMPS_SOURCE.label)}</a>.
        </li>
      </ul>
    </section>
  `
)
