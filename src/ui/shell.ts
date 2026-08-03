// The page chrome both entries share: masthead, content well, footer.

const NAV = [
  { href: '/', label: 'Search', key: 'search' },
  { href: '/about.html', label: 'About', key: 'about' },
]

export function renderShell(
  options: { current: 'search' | 'about' },
  body: string,
): string {
  return `
    <div class="beta-banner">Beta - this tool is under active development - <strong>rulings may change</strong></div>

    <header class="site-header">
      <div class="site-header__inner">
        <a class="wordmark" href="/">
          <span class="wordmark__mark" aria-hidden="true">◆</span>
          <h1 class="wordmark__text">OSRS TCG <span class="wordmark__accent">Foil Checker</span></h1>
        </a>
        <nav class="site-nav" aria-label="Main">
          ${NAV.filter((item) => item.key !== options.current)
            .map((item) => `<a href="${item.href}">${item.label}</a>`)
            .join('')}
        </nav>
      </div>
    </header>

    <main class="app">${body}</main>

    <footer class="site-footer">
      <div class="feedback">
        <a class="button feedback__button feedback__button--go" href="https://discord.gg/9dzWV9upA" target="_blank" rel="noopener">
          Foil rule feedback
        </a>
        <a class="button feedback__button feedback__button--bug" href="https://discord.gg/x6MRPXxnr" target="_blank" rel="noopener">
          Report a website bug
        </a>
      </div>
      <p>
        Card data from the
        <a class="link" href="https://github.com/Azderi/osrs-tcg" target="_blank" rel="noopener">OSRS TCG plugin</a>.
        Item names and images from the
        <a class="link" href="https://oldschool.runescape.wiki/" target="_blank" rel="noopener">OSRS Wiki</a>.
      </p>
      <p>Not affiliated with Jagex. Every result here is a guideline, not a ruling.</p>
    </footer>
  `
}
