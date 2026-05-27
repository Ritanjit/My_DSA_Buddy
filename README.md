<p align="center">
  <img src="apps/chrome-extension/icons/icon-128.png" alt="My DSA Buddy" width="80" height="80" />
</p>

<h1 align="center">My DSA Buddy</h1>

<p align="center">
  <strong>A privacy-first, offline LeetCode dashboard and tracker for developers who own their data.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-cc785c?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/platform-localhost-181715?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/pnpm-workspace-f69220?style=flat-square" alt="pnpm" />
</p>

---

## Why My DSA Buddy?

Most LeetCode trackers send your data to remote servers, require accounts, or lock features behind paywalls. My DSA Buddy takes a different approach:

- **Your data never leaves your machine.** All progress is stored in a local SQLite database.
- **One external call.** The only network request is pushing solutions to *your* GitHub repo.
- **No accounts, no telemetry, no tracking.** Install and use — that's it.

---

## Features

### Local Web Dashboard (`localhost:4321`)

| Feature | Description |
|---------|-------------|
| **Progress Dashboard** | Circular progress rings, streak calendar, stats panel, category breakdown |
| **Company Roadmaps** | Pre-built roadmaps for Google, Amazon, Meta, Microsoft, Apple + custom |
| **Problem Browser** | Full problem list with filters by difficulty, topic, status, company |
| **Streak Tracking** | GitHub-style 365-day contribution heatmap with streak counters |
| **Dark Mode** | Full theme system with View Transition API circular reveal animation |
| **Data Import/Export** | Backup and restore your progress as JSON |

### Chrome Extension (Companion)

| Feature | Description |
|---------|-------------|
| **Auto-Detection** | Silently detects "Accepted" submissions on LeetCode |
| **GitHub Push** | Pushes solution code to your repo in structured markdown format |
| **Dashboard Sync** | Pings localhost to update your local database in real-time |
| **Bulk Sync** | "Sync All Solved to GitHub" button for batch operations |
| **Popup Stats** | Quick view of Easy/Medium/Hard counts and streak |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LeetCode.com                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Content Script (leetcode.ts)                             │  │
│  │  • Monitors submit button clicks                          │  │
│  │  • Detects "Accepted" via DOM observation                 │  │
│  │  • Extracts problem metadata & solution code              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    chrome.runtime.sendMessage
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Chrome Extension Service Worker                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  background.ts                                            │  │
│  │  • Receives PROBLEM_SOLVED from content script            │  │
│  │  • Pushes to GitHub API (PUT /repos/.../contents)         │  │
│  │  • Queues for localhost sync                              │  │
│  │  • Handles bulk SYNC_ALL_TO_GITHUB                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │                                    │
              ▼                                    ▼
┌──────────────────────┐            ┌──────────────────────────┐
│     GitHub API       │            │   localhost:4321          │
│  PUT solution files  │            │   POST /api/sync         │
│                      │            │                          │
│  (ONLY external      │            │  Astro + Node.js SSR     │
│   network call)      │            │  SQLite database         │
└──────────────────────┘            └──────────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9.x (`npm install -g pnpm`)
- [Google Chrome](https://www.google.com/chrome/) (for the extension)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope

### Installation

```bash
# Clone the repository
git clone https://github.com/Ritanjit/my-dsa-buddy.git
cd my-dsa-buddy

# Install dependencies
pnpm install

# Start both dashboard and extension in dev mode
pnpm dev
```

### Setting Up the Dashboard

```bash
# Start only the dashboard
pnpm dev:web

# Open in browser
# → http://localhost:4321
```

Navigate to **Settings** and configure your GitHub PAT and repository.

### Loading the Chrome Extension

1. Build the extension:
   ```bash
   pnpm build:ext
   ```
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select `apps/chrome-extension/dist/`
5. Click the extension icon → configure GitHub settings

### Verify It Works

1. Open any LeetCode problem
2. Submit a correct solution
3. Check the console for `[DSA Buddy] Accepted detected` logs
4. Verify the solution appears in your GitHub repo and dashboard

---

## Tech Stack

### Monorepo

| Tool | Purpose |
|------|---------|
| **pnpm** 9.x | Package manager with workspace support |
| **Turborepo** 2.5 | Build orchestration and caching |
| **TypeScript** 5.9 | End-to-end type safety |

### Web Dashboard (`apps/web-dashboard`)

| Technology | Purpose |
|------------|---------|
| **Astro** 5.x | SSR framework with island architecture |
| **@astrojs/node** | Node.js adapter for localhost hosting |
| **React** 19.x | Interactive UI components (islands) |
| **Tailwind CSS** 4.0 | Utility-first styling |
| **better-sqlite3** | Local file-based SQLite database |
| **csv-parse** | CSV file parsing for problem lists |
| **Motion** | Animation library |
| **Lucide React** | Icon library |

### Chrome Extension (`apps/chrome-extension`)

| Technology | Purpose |
|------------|---------|
| **Vite** 6.x | Build tool |
| **@crxjs/vite-plugin** | Chrome Extension bundling (Manifest V3) |
| **React** 19.x | Popup UI |
| **TypeScript** | Type-safe DOM scraping and messaging |

### Shared (`shared/`)

Shared TypeScript types, constants, and utilities consumed by both apps.

---

## Project Structure

```
my-dsa-buddy/
├── apps/
│   ├── web-dashboard/          # Astro + React local dashboard
│   │   ├── src/
│   │   │   ├── components/     # Astro + React island components
│   │   │   ├── pages/          # Routes and API endpoints
│   │   │   ├── lib/            # Database, utilities, data
│   │   │   └── hooks/          # React data-fetching hooks
│   │   ├── public/data/        # Static CSV problem lists
│   │   └── data/               # SQLite database (gitignored)
│   │
│   └── chrome-extension/       # Companion Chrome extension
│       ├── src/
│       │   ├── background.ts   # Service worker (GitHub + sync)
│       │   ├── content/        # LeetCode DOM monitoring
│       │   ├── popup/          # Extension popup UI
│       │   └── shared/         # Storage and messaging helpers
│       └── icons/              # Extension icons
│
├── shared/                     # Shared types, constants, utilities
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── package.json                # Workspace root
├── pnpm-workspace.yaml         # Workspace definitions
├── turbo.json                  # Turborepo pipeline
├── CLAUDE.md                   # Detailed architecture documentation
└── DESIGN.md                   # Design system specification
```

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both dashboard and extension in watch mode |
| `pnpm dev:web` | Start only the dashboard |
| `pnpm dev:ext` | Start only the extension (watch mode) |
| `pnpm build` | Build everything for production |
| `pnpm build:web` | Build only the dashboard |
| `pnpm build:ext` | Build only the extension |
| `pnpm start:local` | Run the production dashboard on localhost:4321 |
| `pnpm package:ext` | Build and zip extension for Chrome Web Store |
| `pnpm typecheck` | Type-check all workspaces |
| `pnpm lint` | Lint all workspaces |

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
GITHUB_PAT=          # Personal Access Token (repo scope)
GITHUB_REPO=         # owner/repo format
GITHUB_BRANCH=main   # Target branch
```

### GitHub PAT Setup

| Token Type | Required Permission |
|------------|-------------------|
| Classic (`ghp_*`) | `repo` scope |
| Fine-grained (`github_pat_*`) | Contents: Read and write |

---

## Data & Privacy

### What stays local

- All solved problem data (SQLite database)
- Streak and progress statistics
- User settings and preferences
- GitHub PAT (stored in Chrome extension storage)

### What leaves your machine

- **GitHub API only**: Solution files pushed to your own repository
- **Nothing else**: No analytics, no telemetry, no third-party services

### Data Storage

| Data | Location | Format |
|------|----------|--------|
| Problem lists | `apps/web-dashboard/public/data/*.csv` | Static CSV |
| User progress | `apps/web-dashboard/data/user.db` | SQLite |
| Extension state | `chrome.storage.local` | Key-value |

---

## GitHub Sync Format

Solutions are pushed to your repository in this structure:

```
your-repo/
└── problems/
    ├── array/
    │   └── two-sum.md
    ├── dynamic-programming/
    │   └── climbing-stairs.md
    └── trees/
        └── invert-binary-tree.md
```

Each solution file:

```markdown
---
problem_id: 1
title: Two Sum
difficulty: Easy
topics: [Array, Hash Table]
solved_at: 2026-05-27T14:30:00Z
language: python
url: https://leetcode.com/problems/two-sum/
---

## Solution

​```python
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, num in enumerate(nums):
            if target - num in seen:
                return [seen[target - num], i]
            seen[num] = i
​```
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code patterns and conventions
- Maintain TypeScript strict mode compliance
- Test changes with both the dashboard and extension
- Keep the local-first philosophy — no remote dependencies

---

## Roadmap

- [ ] Firefox extension support
- [ ] Problem notes and annotations
- [ ] Custom study plans with spaced repetition
- [ ] Solution comparison (multiple approaches per problem)
- [ ] Export to Anki flashcards
- [ ] Contest tracking and rating estimation

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [LeetCode](https://leetcode.com/) for the platform
- [Astro](https://astro.build/) for the web framework
- [CRXJS](https://crxjs.dev/) for Chrome Extension tooling
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for the local database

---

<p align="center">
  Built with care for developers who value privacy.<br/>
  <sub>All your data stays on your machine. Always.</sub>
</p>
