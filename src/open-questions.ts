import './style.css'
import {
  CAMPS,
  CAMPS_SOURCE,
  DECISIONS_URL,
  DISAGREEMENT_MODES,
  DISCORD_URL,
  GUIDELINE_LINE,
  OPEN_QUESTIONS,
  SUGGEST_A_RULE_URL,
} from './ui/copy.ts'
import { esc } from './ui/html.ts'
import { renderShell } from './ui/shell.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = renderShell(
  { current: 'open-questions' },
  `
    <h2 class="page-title">Open questions</h2>
    <p class="guideline" role="note">${esc(GUIDELINE_LINE)}</p>

    <section class="result__section">
      <h2 class="result__heading">Disagreement is the normal case</h2>
      <p class="about__body">
        There is no official ruling on foils. Jagex never wrote one, the plugin does not define one,
        and the community has never converged on a single answer. Any tool that shows one confident
        result per card is hiding that, and hiding it is how you end up trusted right up until the
        moment someone checks.
      </p>
      <p class="about__body">
        So division is not a problem to be solved here. It is a thing to be shown. A card that reads
        as settled is settled because someone wrote down <em>why</em>, and that reasoning is public -
        not because everybody agrees.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">How disagreement shows up</h2>
      <p class="principles__lede">Three mechanisms, depending on how deep the split runs.</p>
      <ol class="steps">
        ${DISAGREEMENT_MODES.map(
          (mode, i) => `
          <li class="step">
            <span class="step__n" aria-hidden="true">${i + 1}</span>
            <p class="step__label">${esc(mode.label)}</p>
            <p class="step__body">${esc(mode.body)}</p>
          </li>
        `,
        ).join('')}
      </ol>
    </section>

    <section class="result__section">
      <h2 class="result__heading">The positions people hold</h2>
      <p class="principles__lede">
        Three camps show up in the community's own discussion of foils. None is treated as more
        correct than the others here - they are shown so a player can see where the disagreement is.
      </p>
      <ul class="principles">
        ${CAMPS.map(
          (c) => `
          <li class="principles__item">
            <p class="principles__label">${esc(c.label)}</p>
            <p class="principles__weight">${esc(c.weight)}</p>
            <p class="principles__body">${esc(c.body)}</p>
          </li>
        `,
        ).join('')}
      </ul>
      <p class="principles__source">
        Summarised from
        <a class="link" href="${esc(CAMPS_SOURCE.url)}" target="_blank" rel="noopener">${esc(CAMPS_SOURCE.label)}</a>.
      </p>
    </section>

    <section class="result__section">
      <h2 class="result__heading">What is still open</h2>
      <p class="principles__lede">
        Questions that have been raised and deliberately left unanswered. Each one is recorded as
        deferred rather than quietly dropped, and none of them will be answered in a hurry.
      </p>
      <ul class="principles">
        ${OPEN_QUESTIONS.map(
          (q) => `
          <li class="principles__item">
            <p class="principles__label">${esc(q.label)}</p>
            <p class="principles__weight">${esc(q.weight)}</p>
            <p class="principles__body">${esc(q.body)}</p>
          </li>
        `,
        ).join('')}
      </ul>
    </section>

    <section class="result__section">
      <h2 class="result__heading">How a ruling gets made</h2>
      <ul class="sources">
        <li class="sources__item">
          Every ruling is written down before it ships - what was decided, why, and what was rejected
          and why it lost. The reasoning behind a call is worth as much as the call.
        </li>
        <li class="sources__item">
          Entries are never edited or deleted. A ruling that turns out wrong gets superseded by a new
          one, and the original stays readable with a pointer to its replacement.
        </li>
        <li class="sources__item">
          Nothing ships without a source. A rule with no source fails validation and cannot be
          published, so gaps show as <strong>not decided yet</strong> instead of quietly becoming
          somebody's opinion.
        </li>
        <li class="sources__item">
          The final call rests with the maintainer. Community argument shapes it and regularly
          changes it, but a headcount does not decide it - "most people said so" is not a reason, and
          every answer here is supposed to have one.
        </li>
      </ul>
      <p class="principles__source">
        The full log lives in
        <a class="link" href="${esc(DECISIONS_URL)}" target="_blank" rel="noopener">docs/decisions.md</a>,
        one entry per ruling.
      </p>
    </section>

    <section class="result__section handoff">
      <h2 class="result__heading">Argue with it</h2>
      <p class="handoff__body">
        Disagreeing with a call here is useful, not rude. The Discord is where cases get argued out -
        a good argument changes rulings, and when it does, the change gets recorded with the
        reasoning attached. Bring the card and why you read it differently.
      </p>
      <div class="handoff__actions">
        ${
          DISCORD_URL
            ? `<a class="button button--primary" href="${esc(DISCORD_URL)}" target="_blank" rel="noopener">Take it to the Discord</a>`
            : ''
        }
        <a class="button" href="${esc(SUGGEST_A_RULE_URL)}" target="_blank" rel="noopener">Open a GitHub issue</a>
      </div>
    </section>
  `,
)
