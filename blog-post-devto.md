---
title: I Got Tired of LeetCode Trackers Selling My Data, So I Built My Own
published: false
description: A 100% offline, local-first LeetCode dashboard and Chrome extension that never phones home. Open source, privacy-first, and looking for contributors.
tags: opensource, webdev, javascript, productivity
cover_image: [YOUR-COVER-IMAGE-URL]
---

> "Your coding journey is personal. Your data should be too."

---

## The Problem Nobody Talks About

Here's a question: when you solve a LeetCode problem at 2 AM, who else knows about it?

If you're using any of the popular LeetCode tracking tools, the answer is... a lot of people. Your solve history, your weak topics, your streak data, your pacing before interviews — all of it sitting on someone else's server, probably being used to "improve the product" (read: train models, sell insights, serve ads).

I was using three different tools to track my DSA progress. One required a Google login. Another synced to "the cloud" with no option to export. The third one just... disappeared one day. Along with six months of my progress data.

That was my breaking point.

---

## What If Your LeetCode Tracker Was Just... Yours?

I started building **My DSA Buddy** — a LeetCode dashboard that runs entirely on `localhost`. No accounts. No cloud. No telemetry. Your data lives in a SQLite file on your machine, and the only network request that ever leaves is pushing your solution to your own GitHub repo.

That's it. That's the entire privacy model.

```
External network calls: 1 (GitHub push to YOUR repo)
Data stored remotely: 0 bytes
Analytics/tracking: none
Third-party dependencies on user data: zero
```

### How It Works

The system has two parts that talk to each other locally:

1. **A local web dashboard** (Astro 5 + React 19) running on `localhost:4321`
2. **A Chrome extension** that silently detects "Accepted" submissions on LeetCode

When you solve a problem, the extension scrapes the solution, pushes it to your GitHub, and pings your local dashboard to update your stats. The dashboard never touches the internet.

---

## The Architecture (For the Nerds)

This is a **pnpm monorepo** with Turborepo orchestration. Here's the sync flow:

```
┌───────────┐  ┌─────────┐  ┌────────────┐  ┌───────────┐
│ LeetCode  │  │ Content │  │ Background │  │   Local   │
│  Page DOM │  │  Script │  │   Worker   │  │ Dashboard │
└─────┬─────┘  └────┬────┘  └─────┬──────┘  └─────┬─────┘
      │              │             │               │
      │ "Accepted"   │             │               │
      │─────────────>│             │               │
      │              │ sendMessage │               │
      │              │────────────>│               │
      │              │             │               │
      │              │             │─ GitHub API ─>│(ONLY external call)
      │              │             │  PUT solution │
      │              │             │<─ 201 ────────│
      │              │             │               │
      │              │             │ POST /api/sync│
      │              │             │──────────────>│
      │              │             │               │ Update SQLite
      │              │             │               │ Recalculate stats
      │              │             │<──────────────│ 200 OK
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Astro 5 (SSR, Node adapter) | Island architecture — only hydrate what's interactive |
| **UI** | React 19 islands | Component-driven dashboard widgets |
| **Styling** | Tailwind CSS v4.0 | Utility-first, CSS variables, zero runtime |
| **Database** | better-sqlite3 | Single file, zero config, fast reads |
| **Data Import** | csv-parse | Load company-wise problem lists from CSV |
| **Extension** | Vite + CRXJS (Manifest V3) | Modern build tooling for Chrome extensions |
| **Type Safety** | TypeScript 5.9 end-to-end | Shared types between dashboard and extension |
| **Monorepo** | pnpm workspaces + Turborepo | Shared code, parallel builds, caching |
| **Animations** | Motion (Framer Motion) | Smooth widget transitions |

### The Data Model

Everything lives in a local SQLite database. Here's the core:

```sql
CREATE TABLE solved_problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  topics TEXT,          -- JSON array
  companies TEXT,       -- JSON array
  solved_at TEXT NOT NULL,
  language TEXT,
  solution TEXT,
  github_path TEXT
);

CREATE TABLE daily_progress (
  date TEXT PRIMARY KEY,
  problems_solved INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  problem_ids TEXT      -- JSON array
);
```

No ORM. No migrations server. Just a `.db` file you can copy, back up, or delete. Your data, your rules.

---

## The Design: A Developer's Journal

I didn't want this to look like another gray SaaS dashboard. I wanted it to feel like opening your personal coding notebook.

The design system is inspired by **Claude.com's aesthetic** — warm cream canvas, coral accents, serif display typography. But adapted for a developer context:

- **Cream canvas** (#faf9f5) — warm, deliberate, not the cold gray of typical dev tools
- **Coral accent** (#cc785c) — progress bars, streak highlights, solved badges
- **Dark navy surfaces** (#181715) — code blocks, problem cards, stats panels
- **Cormorant Garamond** serif for headlines (the "journal" voice)
- **JetBrains Mono** prominently for stats, IDs, code (the "developer" signal)
- **Full dark mode** with View Transition API circular reveal animation

The result is something that feels like a curated study journal rather than a cluttered analytics tool.

```css
/* The design system in CSS variables */
@theme {
  --color-canvas: #faf9f5;
  --color-primary: #cc785c;
  --color-surface-dark: #181715;
  --color-difficulty-easy: #5db872;
  --color-difficulty-medium: #d4a017;
  --color-difficulty-hard: #c64545;
}
```

---

## What's Built (And What's Not — Yet)

I believe in being honest. Here's the current state:

### Done

- Complete design system (CSS variables, dark mode, component classes, animations)
- Full TypeScript type definitions (Problem, Roadmap, Progress, Settings, SyncPayload)
- Monorepo architecture with shared code between dashboard and extension
- Chrome extension skeleton (Manifest V3, content script, background worker, popup)
- Base layouts and landing page
- Extension-to-dashboard communication protocol

### In Progress

- Dashboard widgets (ProgressOverview, StreakCalendar, StatsPanel)
- SQLite database layer and API routes
- Problem list with filters (difficulty, topic, company, status)
- Company-wise roadmap cards

### Planned

- Full Chrome extension DOM extraction (LeetCode scraping)
- GitHub push integration
- Settings page (PAT config, theme, sync preferences)
- Data export/import
- Streak tracking and milestone badges

**This is where you come in.**

---

## Why Open Source This Early?

Because the best open-source projects aren't built by one person in isolation. They're shaped by the community from day one.

I'm releasing this now — architecture solid, design system complete, implementation in progress — because I want contributors who can:

- **Shape the UX** before it's locked in
- **Bring domain expertise** (LeetCode DOM structure, Chrome extension best practices, SQLite optimization)
- **Challenge my decisions** (Should I use Dexie.js instead of better-sqlite3 for the extension? Is Astro the right choice? Should the streak algorithm work differently?)

### Good First Issues

If you want to contribute, here are concrete starting points:

| Issue | Difficulty | Skills |
|-------|-----------|--------|
| Build the `ProgressRing` SVG component | Easy | React, SVG |
| Implement the streak calendar (365-day heatmap) | Medium | React, CSS Grid/SVG |
| Create the SQLite schema initialization script | Easy | SQL, Node.js |
| Build the `/api/sync` endpoint | Medium | Astro API routes, better-sqlite3 |
| Implement LeetCode DOM extraction (content script) | Hard | DOM APIs, Chrome Extensions |
| Add CSV problem list files (Google, Amazon, Meta) | Easy | Data collection |
| Build the floating navbar with scroll animation | Medium | React, CSS transitions |
| Dark mode theme toggle with View Transition API | Medium | React, CSS, Web APIs |

---

## Questions for the Community

I'd genuinely love feedback on these decisions. Drop a comment if you have thoughts:

**1. SQLite vs IndexedDB for the extension's local cache?**
Currently the dashboard uses better-sqlite3 (Node.js), but the extension might benefit from IndexedDB (via Dexie.js) for its own local state. Is the complexity worth it, or should the extension just always ping localhost?

**2. Is the "single external network call" philosophy too strict?**
Right now, GitHub push is the only thing that leaves your machine. But what about optional features like LeetCode API calls for problem metadata, or optional cloud backup? Should these exist as opt-in, or does that dilute the privacy promise?

**3. Astro SSR on localhost — overkill?**
I chose Astro with the Node adapter for island architecture and server-side data loading. But for a purely local app, would a Vite + React SPA with a separate Express API be simpler? What's your take?

**4. What features would make YOU switch from your current tracker?**
Seriously — what's the one thing that would make you actually use this daily?

---

## Try It / Contribute

```bash
# Clone and run locally
git clone [YOUR-REPO-URL]
cd my-dsa-buddy
pnpm install
pnpm dev

# Dashboard runs on localhost:4321
# Extension builds to apps/chrome-extension/dist/
```

**Links:**
- GitHub: [YOUR-REPO-URL]
- License: MIT
- Issues: [YOUR-REPO-URL]/issues

If this resonates with you — if you've ever felt uneasy about where your coding data goes — give it a star. Or better yet, pick an issue and submit a PR. The architecture is ready. The design system is ready. We just need builders.

---

> "Privacy isn't a feature. It's a right. Your DSA journey shouldn't require surrendering it."

Thanks for reading. Whether you contribute code, drop a suggestion in the comments, or just star the repo — it all helps. Let's build something that respects developers' data by default, not as an afterthought.

Happy grinding, and even happier data ownership.

---

*Built with Astro 5, React 19, TypeScript, Tailwind CSS v4.0, better-sqlite3, and a healthy distrust of "free" cloud services.*
