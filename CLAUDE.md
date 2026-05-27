# My DSA Buddy (Offline/Local-Only Edition)

## Project Overview

**My DSA Buddy** is a highly personal, secure, and **strictly offline/local-only** LeetCode dashboard and tracker. Designed for privacy-conscious developers, all data remains on the user's machine. It operates entirely on `localhost`, reading from local CSV files and a local SQLite database, ensuring no tracking or external data leakage.

The project operates on a **Monorepo Architecture** comprising two tightly integrated parts:
1. **Local Web Dashboard:** The primary UI running on `localhost:4321` where users view stats, manage company-wise roadmaps, track progress, and configure settings.
2. **Companion Chrome Extension:** A background tracker that detects "Accepted" LeetCode submissions, pushes the code to GitHub (the only external network call), and pings the local Dashboard to update the user's progress.

### Core Philosophy

- **100% Local-First** — No remote databases, no cloud sync, no server-side storage
- **Zero Telemetry** — No analytics, no tracking, no data collection
- **Open Source** — Full code transparency, MIT licensed
- **Single External Call** — GitHub push is the ONLY network request leaving the machine
- **Privacy by Design** — GitHub PAT stored locally, never transmitted to third parties

---

## Tech Stack & Architecture

### Monorepo Apps

| App | Technology | Version | Purpose |
|-----|------------|---------|---------|
| **Local Dashboard** | Astro | 5.x | SSR framework with island architecture |
| | `@astrojs/node` | - | Node.js adapter for local SSR hosting on localhost:4321 |
| | React | 19.x | Interactive UI components (islands) |
| | TypeScript | 5.9.x | End-to-end type safety |
| | Tailwind CSS | 4.0 | Utility-first styling via `@tailwindcss/vite` |
| | better-sqlite3 | 11.x | Local file-based SQLite database |
| | csv-parse | 5.x | CSV file parsing for problem lists |
| | Motion / Framer Motion | 12.x | Animation library for React |
| | Lucide React | 0.563+ | Icon library |
| | Lenis | 1.3.x | Smooth scroll experience |
| | @theme-toggles/react | 4.1.x | Animated theme toggle (sun/moon morph) |
| | clsx + tailwind-merge | - | Utility class merging |
| **Extension** | Vite + CRXJS | - | Modern build tool for Chrome Extensions |
| | TypeScript | 5.9.x | Type-safe DOM scraping and background workers |
| | React | 19.x | Popup UI components |

### Monorepo Tooling

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager with workspace support |
| **Turborepo** | Monorepo build orchestration and caching |

---

## Project Structure (pnpm Workspaces + Turborepo)

```
my-dsa-buddy/
├── package.json                      # Monorepo workspace root
├── pnpm-workspace.yaml               # Workspace definitions
├── turbo.json                        # Turborepo pipeline config
├── .gitignore
├── .env.example
├── CLAUDE.md
├── DESIGN.md
│
├── shared/                           # Shared code between dashboard & extension
│   ├── package.json
│   ├── types/
│   │   ├── problem.ts               # Problem interface & related types
│   │   ├── roadmap.ts               # Roadmap interface
│   │   ├── progress.ts              # Progress, DailyProgress, UserStats
│   │   ├── settings.ts              # UserSettings interface
│   │   └── index.ts                 # Barrel export
│   ├── constants/
│   │   ├── topics.ts                # DSA topic categories (Arrays, Trees, DP, etc.)
│   │   ├── companies.ts             # Company names and metadata
│   │   └── difficulty.ts            # Difficulty enum and colors
│   └── utils/
│       ├── formatters.ts            # Date, number, time formatters
│       └── validators.ts            # Input validation helpers
│
├── apps/
│   ├── web-dashboard/                # Astro + React Local Application
│   │   ├── package.json
│   │   ├── tsconfig.json             # Path aliases (@/*, @shared/*)
│   │   ├── astro.config.mjs          # @astrojs/node adapter, React, Tailwind v4
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── astro/            # Server-rendered Astro components
│   │   │   │   │   ├── SEO.astro
│   │   │   │   │   └── Footer.astro
│   │   │   │   ├── react/            # React island components
│   │   │   │   │   ├── navbar/       # FloatingNavbar, MobileBottomNav
│   │   │   │   │   ├── hero/         # LandingHero
│   │   │   │   │   ├── dashboard/    # ProgressOverview, StatsPanel, StreakCalendar,
│   │   │   │   │   │                 # CategoryBreakdown, RecentActivity
│   │   │   │   │   ├── roadmap/      # RoadmapCard, RoadmapGrid
│   │   │   │   │   ├── problems/     # ProblemCard, ProblemList, ProblemFilters
│   │   │   │   │   ├── sections/     # FeatureShowcase, HowItWorks, ProfessionalFooter
│   │   │   │   │   ├── settings/     # SettingsForm, GitHubConfig, ThemeConfig
│   │   │   │   │   ├── theme-toggle/ # ThemeToggle.tsx, ThemeInit.astro
│   │   │   │   │   ├── ui/           # Button, Card, Badge, Input, Modal, ProgressBar,
│   │   │   │   │   │                 # ProgressRing, Tooltip
│   │   │   │   │   └── contexts/     # DataContext, ToastContext
│   │   │   │   └── common/           # Shared component utilities
│   │   │   ├── layouts/
│   │   │   │   ├── BaseLayout.astro       # Main layout (ThemeInit, Navbar, Footer)
│   │   │   │   ├── LandingLayout.astro    # Landing page layout (simpler)
│   │   │   │   └── DashboardLayout.astro  # Dashboard layout (sidebar/widgets)
│   │   │   ├── pages/
│   │   │   │   ├── index.astro            # Landing page
│   │   │   │   ├── dashboard.astro        # Main dashboard
│   │   │   │   ├── roadmaps.astro         # Roadmap browser
│   │   │   │   ├── problems.astro         # Problem list
│   │   │   │   ├── settings.astro         # Settings page
│   │   │   │   ├── about.astro            # About page
│   │   │   │   └── api/                   # Astro API routes (localhost only)
│   │   │   │       ├── sync.ts            # POST — Extension sync endpoint
│   │   │   │       ├── problems.ts        # GET/POST — Problem CRUD
│   │   │   │       ├── progress.ts        # GET — Progress & stats
│   │   │   │       └── settings.ts        # GET/POST — User settings
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts              # cn(), formatDate(), truncateText()
│   │   │   │   ├── db.ts                 # SQLite connection & schema (better-sqlite3)
│   │   │   │   ├── csv-parser.ts         # CSV file reader for problem lists
│   │   │   │   └── data/
│   │   │   │       ├── navRoutes.ts      # Navigation configuration
│   │   │   │       ├── companies.ts      # Company metadata for UI
│   │   │   │       └── topics.ts         # Topic categories for UI
│   │   │   ├── hooks/
│   │   │   │   ├── useProblems.ts        # Fetch & manage problems
│   │   │   │   ├── useRoadmaps.ts        # Fetch & manage roadmaps
│   │   │   │   ├── useProgress.ts        # Progress stats & streaks
│   │   │   │   └── useSync.ts            # Sync status monitoring
│   │   │   └── globals.css               # Tailwind v4 + CSS variables + theme system
│   │   ├── public/
│   │   │   ├── data/                     # Static CSV problem lists
│   │   │   │   ├── google.csv
│   │   │   │   ├── amazon.csv
│   │   │   │   ├── meta.csv
│   │   │   │   ├── microsoft.csv
│   │   │   │   ├── apple.csv
│   │   │   │   └── neetcode-150.csv
│   │   │   ├── assets/
│   │   │   │   ├── logo/
│   │   │   │   └── icons/
│   │   │   └── favicon.svg
│   │   └── data/                         # Local DB files (gitignored)
│   │       ├── user.db                   # SQLite database
│   │       └── .gitkeep
│   │
│   └── chrome-extension/                 # Vite + CRXJS Companion Extension
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts                # CRXJS configuration
│       ├── manifest.json                 # Chrome Manifest V3
│       ├── src/
│       │   ├── background.ts             # Service Worker (GitHub push + localhost sync)
│       │   ├── content/
│       │   │   └── leetcode.ts           # Content script — detects "Accepted" submissions
│       │   ├── popup/
│       │   │   ├── Popup.tsx             # Extension popup UI
│       │   │   ├── popup.html
│       │   │   └── popup.css
│       │   └── shared/
│       │       ├── storage.ts            # chrome.storage wrapper
│       │       └── messaging.ts          # Extension ↔ Dashboard messaging
│       └── icons/
│           ├── icon-16.png
│           ├── icon-48.png
│           └── icon-128.png
```

---

## The Local Bridge: Extension ↔ Dashboard Communication

Because the dashboard is offline, the extension communicates exclusively with the user's local machine.

### Sync Flow (Sequence)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  LeetCode   │    │   Content    │    │  Background  │    │   Local      │
│  Page DOM   │    │   Script     │    │  Worker      │    │   Dashboard  │
└──────┬──────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                  │                   │                    │
       │ "Accepted" shown │                   │                    │
       │─────────────────>│                   │                    │
       │                  │                   │                    │
       │                  │ chrome.runtime    │                    │
       │                  │ .sendMessage()    │                    │
       │                  │──────────────────>│                    │
       │                  │                   │                    │
       │                  │                   │── GitHub API ──────────> (ONLY external call)
       │                  │                   │   PUT file to repo │
       │                  │                   │<─────────────────────── 201 Created
       │                  │                   │                    │
       │                  │                   │ POST localhost:4321│
       │                  │                   │ /api/sync          │
       │                  │                   │───────────────────>│
       │                  │                   │                    │ Update SQLite
       │                  │                   │                    │ Recalculate streak
       │                  │                   │<───────────────────│ 200 OK
       │                  │                   │                    │
```

### Step-by-Step

1. **Detection:** The `content/leetcode.ts` script monitors the LeetCode DOM. When the submit button is clicked and the "Accepted" text appears, it scrapes the code, problem title, difficulty, topics, and language.
2. **Internal Messaging:** The content script sends this data to the extension's isolated `background.ts` service worker via `chrome.runtime.sendMessage`.
3. **GitHub Sync:** The background worker uses the user's stored GitHub PAT to push the solution file to their repository via the GitHub Contents API.
4. **Local Dashboard Sync:** Upon successful GitHub push, the background worker sends a `POST` request to `http://localhost:4321/api/sync` with the problem data.
5. **Local Data Update:** The Astro API route receives the payload, updates the SQLite database, recalculates streaks and stats, and returns success. The dashboard UI reflects changes on next load or via polling.

---

## Security & Web Store Review Guidelines

### 1. Permission Scoping (`manifest.json`)

Restrict host permissions strictly to LeetCode, GitHub, and the user's local network:

```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "storage"],
  "host_permissions": [
    "https://leetcode.com/*",
    "https://api.github.com/*",
    "http://localhost:4321/*",
    "http://127.0.0.1:4321/*"
  ]
}
```

### 2. Authentication & Secrets

- User pastes their GitHub Personal Access Token (PAT) into the local dashboard Settings page
- PAT is stored in the local SQLite database (never leaves the machine)
- Extension retrieves PAT from localhost API when needed for GitHub push
- No OAuth servers required — 100% private

### 3. Privacy Policy

Include a clear Privacy Policy for the Chrome Web Store explaining:
- Extension only communicates with GitHub (user's own repo) and localhost
- No data is collected, stored remotely, or shared with third parties
- All user data remains on the local machine
- Source code is open and auditable

### 4. Content Security

- Content script only activates on `leetcode.com` pages
- No DOM modification — read-only scraping of submission results
- Background worker validates all data before processing
- API routes validate request origin (localhost only)

---

## Features Matrix

### Local Web Dashboard Features

| Feature | Page | Description |
|---------|------|-------------|
| **Landing Page** | `/` | Hero section, feature showcase, how-it-works, CTA |
| **Dashboard** | `/dashboard` | Progress overview, streak calendar, stats panel, category breakdown, recent activity |
| **Roadmaps** | `/roadmaps` | Company-wise roadmaps (Google, Amazon, Meta, etc.), custom roadmap builder |
| **Problems** | `/problems` | Full problem list with filters (difficulty, topic, status, company) |
| **Settings** | `/settings` | GitHub PAT config, theme preference, sync settings, data export/import |
| **About** | `/about` | Project info, open-source credits, privacy statement |

### Dashboard Widgets

| Widget | Description |
|--------|-------------|
| **Progress Overview** | Circular progress rings for Easy/Medium/Hard + total solved count |
| **Streak Calendar** | GitHub-style 365-day contribution heatmap |
| **Stats Panel** | Key metrics: total solved, current streak, longest streak, acceptance rate |
| **Category Breakdown** | Horizontal bar chart showing problems solved per DSA topic |
| **Recent Activity** | Chronological list of recently solved problems with metadata |
| **Company Progress** | Mini progress bars for each company roadmap |

### Extension Features

| Feature | Description |
|---------|-------------|
| **Silent Tracker** | Operates invisibly in the background on `leetcode.com` |
| **Submission Detection** | Detects "Accepted" state by monitoring DOM changes |
| **Code Scraping** | Extracts solution code, language, problem metadata |
| **GitHub Push** | Pushes solution to user's repo in structured format |
| **Local Bridge** | Pings `http://localhost:4321/api/sync` to update dashboard |
| **Deduplication** | Checks if exact solution already exists before syncing |
| **Popup UI** | Quick stats view, sync status, connection indicator |

---

## Data Management (Strictly Local)

### Static Problem Data (CSV Files)

Problem lists by company and category stored in `apps/web-dashboard/public/data/`:

**CSV Schema:**
```csv
problem_id,title,difficulty,topics,companies,url,frequency
1,Two Sum,Easy,"Array;Hash Table","Google;Amazon;Meta",https://leetcode.com/problems/two-sum/,95
```

| Field | Type | Description |
|-------|------|-------------|
| `problem_id` | number | LeetCode problem number |
| `title` | string | Problem title |
| `difficulty` | Easy/Medium/Hard | Difficulty level |
| `topics` | string (semicolon-separated) | DSA topics |
| `companies` | string (semicolon-separated) | Companies that ask this |
| `url` | string | LeetCode URL |
| `frequency` | number (0-100) | How frequently asked |

Parsed at runtime using Node.js `fs` and `csv-parse` modules.

### Dynamic User Data (SQLite)

User profiles, progress, and solved problems stored in local SQLite file (`apps/web-dashboard/data/user.db`):

**SQLite Schema:**

```sql
-- Solved problems tracking
CREATE TABLE solved_problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  topics TEXT,                    -- JSON array
  companies TEXT,                 -- JSON array
  status TEXT DEFAULT 'solved',
  solved_at TEXT NOT NULL,        -- ISO 8601 timestamp
  time_spent INTEGER,             -- minutes
  language TEXT,
  solution TEXT,                  -- user's solution code
  notes TEXT,
  url TEXT,
  github_path TEXT                -- path in user's repo
);

-- Daily progress for streak tracking
CREATE TABLE daily_progress (
  date TEXT PRIMARY KEY,          -- YYYY-MM-DD
  problems_solved INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,  -- minutes
  problem_ids TEXT                -- JSON array of problem_ids solved that day
);

-- User settings
CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT                      -- JSON-encoded value
);

-- Custom roadmaps
CREATE TABLE roadmaps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('company', 'topic', 'custom')),
  company TEXT,
  problem_ids TEXT,               -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Data Export/Import

- **Export:** Full SQLite dump to JSON for backup
- **Import:** Restore from JSON backup file
- **Reset:** Clear all user data (with confirmation)

---

## Navigation Structure

### Dashboard Navbar Links

| Label | Route | Icon (Lucide) |
|-------|-------|---------------|
| HOME | `/` | Home |
| DASHBOARD | `/dashboard` | LayoutDashboard |
| ROADMAPS | `/roadmaps` | Map |
| PROBLEMS | `/problems` | Code2 |
| SETTINGS | `/settings` | Settings |
| ABOUT | `/about` | Info |

### Mobile Bottom Nav (Primary)

| Label | Route | Icon |
|-------|-------|------|
| Home | `/` | Home |
| Dashboard | `/dashboard` | LayoutDashboard |
| Problems | `/problems` | Code2 |
| Roadmaps | `/roadmaps` | Map |

### Mobile Bottom Nav (Secondary — "More" menu)

| Label | Route |
|-------|-------|
| Settings | `/settings` |
| About | `/about` |

---

## Component Patterns

### React Islands (client:load / client:visible)

Interactive components hydrated as React islands:

| Directive | Components | Reason |
|-----------|-----------|--------|
| `client:load` | FloatingNavbar, ThemeToggle, Dashboard widgets, Forms | Immediate interactivity needed |
| `client:visible` | ProfessionalFooter, FeatureShowcase, HowItWorks | Lazy-load when scrolled into view |

### Astro Components (Server-rendered)

Static content rendered on server:
- SEO metadata
- Page layouts and structure
- Footer HTML structure

### Shared UI Primitives (`src/components/react/ui/`)

| Component | Variants |
|-----------|----------|
| Button | primary (coral), secondary (cream), ghost, icon |
| Card | cream, dark, elevated |
| Badge | difficulty (easy/medium/hard), status (solved/attempted/unsolved), topic |
| Input | text, search, textarea |
| ProgressBar | coral fill on cream/dark track |
| ProgressRing | circular SVG ring (Easy/Medium/Hard colors) |
| Modal | centered overlay with backdrop |
| Tooltip | positioned tooltip with arrow |

---

## Data Models (shared/types/)

### Problem

```typescript
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export interface Problem {
  id: number;                     // LeetCode problem number
  title: string;
  difficulty: Difficulty;
  topics: string[];               // Array, Binary Search, DP, etc.
  companies: string[];            // Google, Amazon, Meta, etc.
  status: ProblemStatus;
  solvedAt?: string;              // ISO 8601 timestamp
  timeSpent?: number;             // minutes
  language?: string;              // solution language
  solution?: string;              // user's solution code
  notes?: string;                 // personal notes
  url: string;                    // LeetCode URL
  githubPath?: string;            // path in user's repo
  frequency?: number;             // how frequently asked (0-100)
}
```

### Roadmap

```typescript
export type RoadmapType = 'company' | 'topic' | 'custom';

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  type: RoadmapType;
  company?: string;               // if type === 'company'
  problemIds: number[];           // LeetCode problem IDs
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
}
```

### Progress & Stats

```typescript
export interface DailyProgress {
  date: string;                   // YYYY-MM-DD
  problemsSolved: number;
  timeSpent: number;              // minutes
  problemIds: number[];           // problems solved that day
}

export interface UserStats {
  totalSolved: number;
  currentStreak: number;          // consecutive days
  longestStreak: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  byTopic: Record<string, number>;
  byCompany: Record<string, number>;
  lastSolvedAt?: string;          // ISO 8601
}
```

### Settings

```typescript
export interface UserSettings {
  githubPat?: string;             // Personal Access Token
  githubRepo?: string;            // owner/repo format
  githubBranch?: string;          // default: 'main'
  syncOnSolve: boolean;           // auto-sync when problem solved
  theme: 'light' | 'dark' | 'system';
  solutionFormat: 'markdown' | 'code-only';
  solutionPath: string;           // template: 'problems/{topic}/{slug}.md'
}
```

### Sync Payload (Extension → Dashboard)

```typescript
export interface SyncPayload {
  problemId: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  language: string;
  solution: string;
  solvedAt: string;               // ISO 8601
  url: string;
  githubPath?: string;            // where it was pushed in the repo
}
```

---

## Development & Execution Commands

Run from the root of the monorepo:

```bash
# Install dependencies across all workspaces
pnpm install

# Start both Astro Dashboard and Vite Extension in dev mode
pnpm dev

# Start only the dashboard
pnpm dev:web

# Start only the extension (watch mode)
pnpm dev:ext

# Build everything for production
pnpm build

# Build only the dashboard
pnpm build:web

# Build only the extension
pnpm build:ext

# Start the local Node.js server (production build)
# Runs the @astrojs/node output on localhost:4321
pnpm start:local

# Build Chrome Extension for Web Store upload (.zip)
pnpm package:ext

# Type-check all workspaces
pnpm typecheck

# Lint all workspaces
pnpm lint
```

### Turborepo Pipeline

```json
{
  "pipeline": {
    "dev": { "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "typecheck": {},
    "lint": {}
  }
}
```

---

## GitHub Sync Format

When the extension pushes a solved problem to the user's GitHub repo:

### File Structure in Repo

```
dsa-solutions/
├── arrays/
│   ├── two-sum.md
│   └── best-time-to-buy-and-sell-stock.md
├── dynamic-programming/
│   ├── climbing-stairs.md
│   └── coin-change.md
├── trees/
│   └── invert-binary-tree.md
└── README.md                    # Auto-generated index
```

### Solution File Format

```markdown
---
problem_id: 1
title: Two Sum
difficulty: Easy
topics: [Array, Hash Table]
companies: [Google, Amazon, Meta]
solved_at: 2026-05-27T14:30:00Z
language: python
url: https://leetcode.com/problems/two-sum/
---

## Solution

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
```

## Notes

(User's personal notes appear here if provided)
```

---

## Design System

See [DESIGN.md](./DESIGN.md) for the complete design system documentation. Key points:

- **Claude.com-inspired aesthetic** — Warm cream canvas, coral accents, serif display typography
- **Developer journal feel** — Scholarly but technical, like a curated coding notebook
- **Dark mode** — Full `[data-theme="dark"]` system with View Transition API circular reveal
- **Floating navbar** — Scroll-responsive pill transition (same behavior as Samaguri Satra Website)
- **JetBrains Mono** — Prominently used for stats, problem IDs, difficulty tags, code

---

## References

- [Astro + React Islands Template](../Astro%20+%20React%20Istands%20+%20TypeScript%20+%20Tailwind%20v4.0%20+%20FrontQL%20Template/README.md)
- [Samaguri Satra Website](../Samaguri%20Satra%20Website/) — Reference implementation for design system and component patterns
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [Astro Node.js Adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Dexie.js](https://dexie.org/) — Alternative if IndexedDB needed for extension
