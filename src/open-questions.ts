import './style.css'
import { CAMPS, CAMPS_SOURCE, DISAGREEMENT_MODES, GUIDELINE_LINE, OPEN_QUESTIONS } from './ui/copy.ts'
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
        There is no official ruling on foils - Jagex never wrote one, the plugin does not define one,
        and the community has never converged. So division is shown here rather than solved. A card
        that reads as settled is settled because someone wrote down <em>why</em>, not because
        everybody agrees.
      </p>
      ${
        OPEN_QUESTIONS.length > 0
          ? `<p class="principles__lede">
        Questions raised and deliberately left unanswered, recorded as deferred rather than dropped.
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
      </ul>`
          : `<p class="about__body">
        Nothing is sitting unanswered right now - every question raised so far has been ruled on or
        closed. This is where the next one gets listed.
      </p>`
      }
    </section>

    <section class="result__section">
      <h2 class="result__heading">The positions people hold</h2>
      <p class="principles__lede">
        Three camps, none treated as more correct than the others here.
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
      <h2 class="result__heading">How a ruling gets made</h2>
      <ul class="sources">
        <li class="sources__item">
          Every ruling is written down before it ships - what was decided, why, and what was rejected.
        </li>
        <li class="sources__item">
          Entries are never edited or deleted. A wrong ruling gets superseded, and the original stays
          readable with a pointer to its replacement.
        </li>
        <li class="sources__item">
          The final call rests with the maintainer. Community argument shapes it, but a headcount
          does not decide it.
        </li>
      </ul>
    </section>
  `
)
