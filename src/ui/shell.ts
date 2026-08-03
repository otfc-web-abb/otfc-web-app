// The page chrome both entries share: masthead, content well, footer.

const NAV = [
  { href: '/', label: 'Search', key: 'search' },
  { href: '/about.html', label: 'About', key: 'about' },
]

/** Discord's own mark, drawn as a path so it needs no asset and inherits the
 *  button's colour. */
const DISCORD_MARK = `
  <svg viewBox="0 0 127 96" width="20" height="16" fill="currentColor" aria-hidden="true">
    <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
  </svg>`

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
      <a class="button discord-link" href="https://discord.gg/JBShZVaKg" target="_blank" rel="noopener">
        ${DISCORD_MARK}Join the Discord
      </a>

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
