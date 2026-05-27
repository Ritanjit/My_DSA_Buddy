import { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NavSection {
  id: string;
  title: string;
  children?: { id: string; title: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'about',
    title: 'About My DSA Buddy',
    children: [
      { id: 'why', title: 'Why I Built This' },
      { id: 'privacy', title: 'Privacy' },
    ],
  },
  {
    id: 'extension',
    title: 'Chrome Extension',
    children: [
      { id: 'installation', title: 'Installation' },
      { id: 'github-pat', title: 'GitHub PAT Setup' },
      { id: 'how-it-works', title: 'How It Works' },
      { id: 'extension-settings', title: 'Extension Settings' },
    ],
  },
  {
    id: 'contributing',
    title: 'Contributing',
    children: [
      { id: 'tech-stack', title: 'Tech Stack' },
      { id: 'monorepo', title: 'Monorepo Structure' },
      { id: 'get-involved', title: 'Get Involved' },
    ],
  },
];

export default function DocsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => (init[s.id] = true));
    return init;
  });
  const [activeId, setActiveId] = useState('about');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(top.target.getAttribute('data-section') || '');
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => observerRef.current!.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  function toggleSection(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function scrollTo(id: string) {
    const el = document.querySelector(`[data-section="${id}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function isActive(id: string) {
    return activeId === id;
  }

  function isParentActive(section: NavSection) {
    if (activeId === section.id) return true;
    return section.children?.some((c) => c.id === activeId) || false;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-[220px] flex-shrink-0">
          <nav className="sticky top-35 space-y-1">
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="mb-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="p-1 rounded hover:bg-[var(--color-surface-soft)] transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {expanded[section.id]
                      ? <Minus size={12} style={{ color: 'var(--color-muted)' }} />
                      : <Plus size={12} style={{ color: 'var(--color-muted)' }} />}
                  </button>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`text-left text-sm font-medium transition-colors cursor-pointer truncate ${
                      isParentActive(section) ? 'text-[var(--color-primary)]' : 'text-ink hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {section.title}
                  </button>
                </div>

                {expanded[section.id] && section.children && (
                  <div className="ml-6 mt-1 space-y-0.5 border-l border-[var(--color-hairline)] pl-3">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => scrollTo(child.id)}
                        className={`block w-full text-left text-xs py-1 transition-colors cursor-pointer ${
                          isActive(child.id) ? 'text-[var(--color-primary)] font-medium' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="mb-16" data-section="about">
            <h1 className="font-display text-ink text-4xl md:text-5xl leading-tight mb-4">My DSA Buddy</h1>
            <p className="text-body text-lg leading-relaxed text-justify">
              A strictly offline, local-first LeetCode dashboard and progress tracker. Built for developers who believe their data should stay on their machine.
            </p>
          </header>

          {/* Why I Built This */}
          <section className="mb-16" data-section="why">
            <h2 className="font-display text-ink text-2xl mb-6 pb-3 border-b border-[var(--color-hairline)]">Why I Built This ?</h2>
            <div className="space-y-4 text-body leading-relaxed text-justify">
              <p>
                Every LeetCode tracker out there wants your data. They want you to sign up, sync to their cloud, share your progress publicly, and feed their analytics pipeline. For a generation that grew up with "if the product is free, you are the product," this felt wrong.
              </p>
              <p>
                My DSA Buddy takes a different approach: <strong className="text-ink">your data never leaves your machine</strong>. There is no server, no account, no cloud sync. The dashboard runs on localhost. Your solutions are stored in a local SQLite database. The only network call this app ever makes is pushing your code to <em>your own</em> GitHub repository - only if you explicitly configure it.
              </p>
              <p>
                This is what privacy-first software looks like. Not a toggle buried in settings. Not a "we respect your privacy" banner. Just software that architecturally cannot leak your data because it never has access to a remote server in the first place.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="mb-16" data-section="privacy">
            <h2 className="font-display text-ink text-2xl mb-6 pb-3 border-b border-[var(--color-hairline)]">Privacy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="font-mono text-xs text-[var(--color-primary)] uppercase tracking-wider mb-1">Storage</div>
                <p className="text-sm text-ink font-medium">100% Local SQLite</p>
                <p className="text-xs text-muted mt-0.5">No cloud, no remote database</p>
              </div>
              <div>
                <div className="font-mono text-xs text-[var(--color-primary)] uppercase tracking-wider mb-1">Telemetry</div>
                <p className="text-sm text-ink font-medium">Zero</p>
                <p className="text-xs text-muted mt-0.5">No analytics, no tracking</p>
              </div>
              <div>
                <div className="font-mono text-xs text-[var(--color-primary)] uppercase tracking-wider mb-1">Network</div>
                <p className="text-sm text-ink font-medium">GitHub Push Only</p>
                <p className="text-xs text-muted mt-0.5">The single external call</p>
              </div>
            </div>
          </section>

          {/* Chrome Extension */}
          <section className="mb-16" data-section="extension">
            <h2 className="font-display text-ink text-2xl mb-6 pb-3 border-b border-[var(--color-hairline)]">Chrome Extension</h2>
            <p className="text-body leading-relaxed text-justify mb-8">
              The companion extension runs silently in the background while you solve problems on LeetCode. When you submit a solution and it's accepted, the extension captures your code and syncs it — no manual effort required.
            </p>
          </section>

          {/* Installation */}
          <section className="mb-16" data-section="installation">
            <h3 className="font-display text-ink text-lg mb-3">Installation</h3>
            <p className="text-body text-sm mb-4 text-justify">
              Until the extension is published on the Chrome Web Store, install it in developer mode:
            </p>
            <ol className="space-y-3 text-sm text-body mb-4 pl-1">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Clone the repository and run <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">pnpm build:ext</code> to generate the extension bundle in <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">apps/chrome-extension/dist</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Open Chrome and navigate to <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">chrome://extensions</code>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Enable <strong>Developer mode</strong> (top-right toggle).</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <span>Click <strong>Load unpacked</strong> and select the <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">dist</code> folder.</span>
              </li>
            </ol>
          </section>

          {/* GitHub PAT Setup */}
          <section className="mb-16" data-section="github-pat">
            <h3 className="font-display text-ink text-lg mb-3">GitHub PAT Setup</h3>
            <p className="text-body text-sm mb-4 text-justify">
              To push solutions to GitHub, you need a Personal Access Token with <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">repo</code> scope:
            </p>
            <ol className="space-y-3 text-sm text-body mb-4 pl-1">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Go to <strong>GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Generate a new token with the <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">repo</code> scope selected.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-surface-soft)] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Paste the token into the <a href="/settings" className="text-[var(--color-primary)] underline underline-offset-2">Settings page</a> under GitHub Configuration.</span>
              </li>
            </ol>
            <p className="text-xs text-muted">
              Your PAT is stored in the local SQLite database and is only used to authenticate with the GitHub API. It is never sent anywhere else.
            </p>
          </section>

          {/* How It Works */}
          <section className="mb-16" data-section="how-it-works">
            <h3 className="font-display text-ink text-lg mb-3">How It Works</h3>
            <div className="space-y-4 text-sm text-body">
              <div className="flex gap-4 items-start">
                <div className="font-mono text-xs text-muted w-16 flex-shrink-0 pt-0.5">Detect</div>
                <p className="text-justify">The content script monitors the LeetCode page. When you click <strong>Submit</strong> and the result shows <strong>Accepted</strong>, it captures your solution code, language, and problem metadata.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="font-mono text-xs text-muted w-16 flex-shrink-0 pt-0.5">Push</div>
                <p className="text-justify">The background worker pushes your solution to your GitHub repository using the Contents API. Files are organized by topic: <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">{`problems/{topic}/{slug}.md`}</code>.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="font-mono text-xs text-muted w-16 flex-shrink-0 pt-0.5">Sync</div>
                <p className="text-justify">After pushing, the extension sends a POST to <code className="font-mono text-xs bg-[var(--color-surface-soft)] px-1.5 py-0.5 rounded">localhost:4321/api/sync</code> to update your local dashboard with the new solve.</p>
              </div>
            </div>
          </section>

          {/* Extension Settings */}
          <section className="mb-16" data-section="extension-settings">
            <h3 className="font-display text-ink text-lg mb-3">Extension Settings</h3>
            <div className="space-y-4 text-sm text-body">
              <div className="flex gap-4 items-start">
                <div className="font-mono text-xs text-ink font-medium min-w-[180px] flex-shrink-0 pt-0.5">Submit only new solutions</div>
                <p className="text-muted text-justify">When enabled, the extension only syncs a problem the first time you solve it. Subsequent accepted submissions for the same problem are ignored.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="font-mono text-xs text-ink font-medium min-w-[180px] flex-shrink-0 pt-0.5">Sync multiple submissions</div>
                <p className="text-muted text-justify">When enabled, every accepted submission is synced — even if you've already solved the problem before. Useful for tracking solution improvements over time.</p>
              </div>
            </div>
          </section>

          {/* Contributing */}
          <section className="mb-16" data-section="contributing">
            <h2 className="font-display text-ink text-2xl mb-6 pb-3 border-b border-[var(--color-hairline)]">Contributing</h2>
            <p className="text-body leading-relaxed text-justify mb-8">
              My DSA Buddy is open source under the MIT License. Whether you want to fix a bug, add a feature, or improve the documentation — contributions are welcome.
            </p>
          </section>

          {/* Tech Stack */}
          <section className="mb-16" data-section="tech-stack">
            <h3 className="font-display text-ink text-lg mb-4">Tech Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-xs text-[var(--color-primary)] uppercase tracking-wider mb-3">Dashboard</div>
                <ul className="space-y-2 text-sm text-body">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">Astro 5.x</strong> — SSR framework with island architecture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">React 19</strong> — Interactive UI components</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">Tailwind CSS 4.0</strong> — Utility-first styling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">better-sqlite3</strong> — Local database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">Motion</strong> — Animation library</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-mono text-xs text-[var(--color-primary)] uppercase tracking-wider mb-3">Extension</div>
                <ul className="space-y-2 text-sm text-body">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">Vite + CRXJS</strong> — Modern extension bundler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">Chrome Manifest V3</strong> — Latest extension platform</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">TypeScript</strong> — End-to-end type safety</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0"></span>
                    <span><strong className="text-ink">React 19</strong> — Popup UI</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monorepo Structure */}
          <section className="mb-16" data-section="monorepo">
            <h3 className="font-display text-ink text-lg mb-4">Monorepo Structure</h3>
            <p className="text-body text-sm mb-4 text-justify">
              The project uses <strong>pnpm workspaces</strong> with <strong>Turborepo</strong> for build orchestration. Both the dashboard and extension live in a single repository.
            </p>
            <div className="font-mono text-xs bg-[var(--color-surface-soft)] rounded-lg p-4 text-body leading-relaxed overflow-x-auto">
              <pre>{`my-dsa-buddy/
├── apps/web-dashboard/     # Astro + React (localhost:4321)
├── apps/chrome-extension/  # Vite + CRXJS (Manifest V3)
├── shared/                 # Shared types and utilities
├── turbo.json
└── pnpm-workspace.yaml`}</pre>
            </div>
          </section>

          {/* Get Involved */}
          <section className="mb-16" data-section="get-involved">
            <h3 className="font-display text-ink text-lg mb-4">Get Involved</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-lg bg-[var(--color-surface-soft)]">
              <div className="flex-1">
                <p className="text-ink font-medium mb-1">Ready to contribute?</p>
                <p className="text-sm text-muted">Check out the repository, pick an issue, and submit a pull request.</p>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--color-ink)] text-[var(--color-canvas)] hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                View on GitHub
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
