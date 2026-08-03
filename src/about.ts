import './style.css'
import { CAMPS_SOURCE, GUIDELINE_LINE, RESOLUTION_ORDER } from './ui/copy.ts'
import { esc } from './ui/html.ts'
import { renderShell } from './ui/shell.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderShell(
  { current: 'about' },
  `
    <h2 class="page-title">About</h2>
    <p class="guideline" role="note">${esc(GUIDELINE_LINE)}</p>

    <section class="result__section">
      <h2 class="result__heading">What this is</h2>
      <p class="about__body">
        The OSRS TCG RuneLite plugin unlocks in-game items behind cards pulled from booster packs.
        Cards have a rare <strong>foil</strong> variant, and there is no agreed answer for what a foil does. This tool
        answers that for a specific item: what it unlocks and what it does not.
      </p>
      <p class="about__body">
        Some items either only unlock <strong>themselves</strong> (which I class as a solo unlock) or <strong>undecided</strong> where a decision has not officially been made.
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
