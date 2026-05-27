# My DSA Buddy — Design System

## Overview

My DSA Buddy adapts the Claude.com design aesthetic — warm cream canvas, coral accents, and serif display typography — for a **developer DSA workspace**. The design maintains the editorial, literary feel but transforms it into a "developer journal" — scholarly yet technical, like a well-curated coding notebook.

The base atmosphere is a **tinted cream canvas** (`--color-canvas` — #faf9f5) — warm, deliberately not the cool gray-white of typical developer tools. Headlines run a **serif display** (Cormorant Garamond) at weight 500, paired with **Inter** body sans and **JetBrains Mono** for code/technical elements. The combination feels like a curated study journal, not a typical SaaS dashboard.

Brand voltage comes from the **cream + coral pairing** — coral (`--color-primary` — #cc785c) serves as the signature accent on progress indicators, streak highlights, solved badges, and CTAs. The dark navy surfaces (`--color-surface-dark` — #181715) provide contrast for code blocks, problem cards, stats panels, and terminal-like elements.

The system has three surface modes:
1. **Cream canvas** (`--color-canvas`) — default body floor, landing page, roadmap cards, settings
2. **Light cream cards** (`--color-surface-card`) — feature cards, problem category cards
3. **Dark navy surfaces** (`--color-surface-dark`) — code blocks, problem cards, stats panels, terminal elements

**Key Characteristics:**
- Warm cream canvas (#faf9f5) — evokes a developer notebook/journal
- Coral primary (#cc785c) — progress indicators, streak highlights, solved badges, CTAs
- Dark navy surfaces (#181715) — code blocks, problem cards, stats panels
- Cormorant Garamond serif for display headlines (the "literary" voice)
- Inter for body/UI (readable, humanist)
- JetBrains Mono prominently for: problem IDs, difficulty tags, code snippets, stats numbers, streak counts
- Full dark mode + light mode with ThemeToggle (View Transition API circular reveal)
- Floating navbar with scroll-responsive pill transition
- Border radius hierarchy: `--radius-md` (8px) for buttons + inputs, `--radius-lg` (12px) for cards, `--radius-xl` (16px) for hero container
- Section rhythm 96px — modern standard. Internal card padding 32px.

---

## Colors

### Brand & Accent
- **Coral / Primary** (`--color-primary` — #cc785c): Progress bars, streak indicators, solved badges, primary CTAs. The signature warm accent.
- **Coral Active** (`--color-primary-active` — #a9583e): Hover/press darker variant.
- **Coral Disabled** (`--color-primary-disabled` — #e6dfd8): Desaturated cream-tinted disabled state.
- **Accent Teal** (`--color-accent-teal` — #5db8a6): Used sparingly on secondary indicators (connection status, sync active).

### Surface
- **Canvas** (`--color-canvas` — #faf9f5): Default page floor. Tinted cream — warm, evokes a developer notebook.
- **Surface Soft** (`--color-surface-soft` — #f5f0e8): Section dividers, soft band backgrounds.
- **Surface Card** (`--color-surface-card` — #efe9de): Feature cards, roadmap cards. One step darker than canvas.
- **Surface Cream Strong** (`--color-surface-cream-strong` — #e8e0d2): Selected tabs, emphasized section bands.
- **Surface Dark** (`--color-surface-dark` — #181715): Problem cards, code blocks, stats panels, footer.
- **Surface Dark Elevated** (`--color-surface-dark-elevated` — #252320): Elevated cards inside dark sections.
- **Surface Dark Soft** (`--color-surface-dark-soft` — #1f1e1b): Slightly lighter dark for nested elements.
- **Hairline** (`--color-hairline` — #e6dfd8): 1px border tone on cream surfaces.
- **Hairline Soft** (`--color-hairline-soft` — #ebe6df): Barely-visible dividers.

### Text
- **Ink** (`--color-ink` — #141413): All headlines and primary text. Warm dark, slightly off-pure-black.
- **Body Strong** (`--color-body-strong` — #252523): Emphasized paragraphs, lead text.
- **Body** (`--color-body` — #3d3d3a): Default running-text color.
- **Muted** (`--color-muted` — #6c6a64): Sub-headings, metadata labels.
- **Muted Soft** (`--color-muted-soft` — #8e8b82): Captions, fine-print, timestamps.
- **On Primary** (`--color-on-primary` — #ffffff): Text on coral buttons.
- **On Dark** (`--color-on-dark` — #faf9f5): Cream-tinted white on dark surfaces.
- **On Dark Soft** (`--color-on-dark-soft` — #a09d96): Secondary text on dark surfaces.

### Difficulty Colors (DSA-Specific)
- **Easy** (`--color-difficulty-easy` — #5db872): Green badge background with white text.
- **Medium** (`--color-difficulty-medium` — #d4a017): Gold badge background with white text.
- **Hard** (`--color-difficulty-hard` — #c64545): Red badge background with white text.

### Semantic
- **Success** (`--color-success` — #5db872): Solved indicators, sync success, connection active.
- **Warning** (`--color-warning` — #d4a017): Streak at risk, sync pending.
- **Error** (`--color-error` — #c64545): Broken streak, sync failed, validation errors.

---

## Typography

### Font Family
The system uses **Cormorant Garamond** (or **EB Garamond** as substitute) as the serif display face for headlines, **Inter** as the humanist sans for body/UI, and **JetBrains Mono** for all technical/numeric content.

The display/body/code split:
- Cormorant Garamond serif (weight 500) → h1, h2, h3, hero display, section titles
- Inter sans (weight 400-500) → body, navigation, buttons, captions, labels
- JetBrains Mono (weight 400-500) → problem IDs, stats numbers, difficulty tags, code snippets, streak counts, timestamps

### Hierarchy

| Token | Size | Weight | Font | Use |
|---|---|---|---|---|
| `display-xl` | 64px | 500 | Garamond | Homepage h1 ("Track Your DSA Journey") |
| `display-lg` | 48px | 500 | Garamond | Section heads |
| `display-md` | 36px | 500 | Garamond | Sub-section heads |
| `display-sm` | 28px | 500 | Garamond | Card headlines, widget titles |
| `title-lg` | 22px | 500 | Inter | Widget section titles |
| `title-md` | 18px | 500 | Inter | Card titles, problem titles |
| `title-sm` | 16px | 500 | Inter | Metadata labels, list titles |
| `body-md` | 16px | 400 | Inter | Default running text |
| `body-sm` | 14px | 400 | Inter | Descriptions, footer text |
| `caption` | 13px | 500 | Inter | Labels, timestamps |
| `caption-uppercase` | 12px | 500 | Inter | Category tags, "NEW" badges (1.5px tracking) |
| `code-lg` | 24px | 500 | JetBrains Mono | Stats numbers, streak count, total solved |
| `code-md` | 16px | 400 | JetBrains Mono | Problem IDs, progress fractions |
| `code-sm` | 14px | 400 | JetBrains Mono | Difficulty tags, code snippets, timestamps |
| `button` | 14px | 500 | Inter | Button labels |
| `nav-link` | 14px | 500 | Inter | Top-nav menu items |

### Principles
- Display sizes use weight 500 (medium), never bold. Garamond serif gives the literary, curated feel.
- Body type stays at weight 400 for paragraphs, weight 500 for labels and emphasized phrases.
- JetBrains Mono is used MORE prominently than in typical projects — all numeric data, all problem identifiers, all code, all technical metadata. This is the "developer" signal.
- The serif + mono combination creates the "developer journal" aesthetic — scholarly headlines with technical data.

---

## Layout

### Spacing System
- **Base unit:** 4px.
- **Tokens:** `--spacing-xxs` 4px, `--spacing-xs` 8px, `--spacing-sm` 12px, `--spacing-md` 16px, `--spacing-lg` 24px, `--spacing-xl` 32px, `--spacing-xxl` 48px, `--spacing-section` 96px.
- **Section padding:** 96px between major bands.
- **Card internal padding:** 32px for large cards (roadmap, stats), 24px for compact cards (problem cards, widgets).
- **Dashboard widget gap:** 24px between widgets.

### Grid & Container
- **Max content width:** 1200px centered.
- **Landing page:** 12-column grid; hero uses full-width centered text.
- **Dashboard:** 12-column grid; widgets in 4/8 or 6/6 or 4/4/4 splits.
- **Problem list:** Single column with filters sidebar (3/9 split on desktop).
- **Roadmap grid:** 3-up at desktop, 2-up at tablet, 1-up at mobile.

### Whitespace Philosophy
The cream canvas + serif display + generous padding create an editorial pacing — the dashboard reads like a developer's personal journal rather than a cluttered analytics tool. Whitespace between sections stays uniform at 96px; whitespace inside cards is generous (32px), letting data breathe.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, top nav, hero bands |
| Soft hairline | 1px `--color-hairline` border | Inputs, filter tabs, roadmap cards |
| Cream card | `--color-surface-card` background — no shadow | Feature cards, roadmap cards |
| Dark surface card | `--color-surface-dark` background — no shadow | Problem cards, stats panels, code blocks |
| Subtle drop shadow | `0 1px 3px rgba(20,20,19,0.08)` | Hover-elevated states (rarely used) |

The elevation philosophy is **color-block first, shadow rare**. Most depth comes from the cream-vs-dark surface contrast. Problem cards on dark surfaces have their own internal chrome (difficulty badges, topic pills, status indicators) which adds detail without external shadows.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 4px | Tiny elements, badge accents |
| `--radius-sm` | 6px | Small inline buttons, dropdown items |
| `--radius-md` | 8px | Standard buttons, text inputs, filter tabs |
| `--radius-lg` | 12px | Content cards (roadmap, problem, stats, feature) |
| `--radius-xl` | 16px | Hero container, large marquee components |
| `--radius-pill` | 9999px | Badge pills, difficulty tags, navbar pill, language toggles |
| `--radius-full` | 50% | Avatar substitutes, circular icon buttons |

---

## Components

### Floating Navbar

**`top-nav-floating`** — Primary navigation with scroll-responsive pill transition. Same behavior as Samaguri Satra Website's FloatingNavbar.

**Position & Shape:**
- Fixed position at top
- Full-width dark bar when at top of page
- Transitions to centered floating pill with rounded-full border on scroll (>20px)
- Background: `--color-surface-dark` (#181715) with backdrop-blur-3xl
- 3px circular border when in pill state

**Layout Structure:**
- Left: Logo (My DSA Buddy wordmark or icon)
- Center: Navigation links — HOME, DASHBOARD, ROADMAPS, PROBLEMS, SETTINGS, ABOUT
- Right: ThemeToggle component

**Navigation Links:**
- Font: Inter 14px / 500 weight, uppercase
- Color: `--color-on-dark` (cream white) on dark background
- Active state: `--color-primary` (coral) with slightly larger text
- Hover state: `--color-primary` (coral) with dot+line indicator below

**Scroll Animation:**
- Un-scrolled: Full-width dark bar, no border-radius, subtle bottom border
- Scrolled: Shrinks to content-width pill, rounded-full, 3px border, drops down 32px
- Transition: 600ms cubic-bezier(0.22, 1, 0.36, 1)

**Mobile Behavior:**
- Collapses to bottom navigation bar (fixed at bottom)
- Primary items: Home, Dashboard, Problems, Roadmaps
- Secondary items in expandable "More" menu: Settings, About

---

### Hero Section (Landing Page)

**`hero-section`** — Full-width hero for the landing page.

**Dimensions:**
- Minimum height: 400px
- Full width with centered content
- Max content width: 1200px
- Vertical padding: 96px

**Content:**
- Headline: Garamond serif, 64px, weight 500, centered
- Subheadline: Inter, 18px, `--color-body`, centered, max-width 600px
- CTA buttons: Primary (coral) "Get Started" + Secondary (cream) "Learn More"
- Background: Cream canvas with subtle gradient or pattern

---

### Dashboard Widgets

**`widget-progress-overview`** — Circular progress rings showing Easy/Medium/Hard breakdown.
- Background: `--color-surface-card` (cream)
- Three SVG rings: Easy (green), Medium (gold), Hard (red)
- Center number: Total solved in JetBrains Mono `code-lg` (24px)
- Labels below each ring in `caption` size
- Rounded `--radius-lg` (12px), padding 32px

**`widget-streak-calendar`** — GitHub-style 365-day contribution heatmap.
- Background: `--color-surface-dark` (dark)
- Grid of small squares (52 weeks x 7 days)
- Color scale: transparent → coral at increasing opacity (0.2, 0.4, 0.6, 0.8, 1.0)
- Current streak count in JetBrains Mono `code-lg` with fire icon
- Day labels in `--color-on-dark-soft`
- Rounded `--radius-lg`, padding 24px

**`widget-stats-panel`** — Key metrics in dark card with monospace numbers.
- Background: `--color-surface-dark`
- Grid of 2x2 stat boxes
- Each box: Label in Inter `caption`, Value in JetBrains Mono `code-lg`
- Stats: Total Solved, Current Streak, Longest Streak, Acceptance Rate
- Rounded `--radius-lg`, padding 32px

**`widget-category-breakdown`** — Horizontal bar chart by DSA topic.
- Background: `--color-surface-card` (cream)
- Topic name (Inter `body-sm`) left-aligned
- Horizontal bar (coral fill on cream track)
- Count in JetBrains Mono `code-sm` right-aligned
- Rounded `--radius-lg`, padding 32px

**`widget-recent-activity`** — Chronological list of recently solved problems.
- Background: `--color-canvas` with hairline border
- Each item: Problem title, difficulty badge, time ago, topic tags
- Rounded `--radius-lg`, padding 24px

---

### Problem Cards

**`problem-card`** — Individual problem display on dark surface.
- Background: `--color-surface-dark`
- Layout: Horizontal on desktop, vertical on mobile
- Problem ID: JetBrains Mono `code-md`, `--color-on-dark-soft`
- Title: Inter `title-md`, `--color-on-dark`
- Difficulty badge: Colored pill (Easy green, Medium gold, Hard red), JetBrains Mono `code-sm`
- Topic tags: Cream pills (`--color-surface-card` background, `--color-ink` text)
- Status indicator: Coral checkmark for solved, muted circle for unsolved
- Company tags: Subtle, `--color-on-dark-soft`
- Rounded `--radius-lg`, padding 24px

**`problem-card-compact`** — Compact list-item variant.
- Single row: ID | Title | Difficulty | Topics | Status
- Hairline border bottom
- Hover: Background shifts to `--color-surface-dark-elevated`

---

### Roadmap Cards

**`roadmap-card`** — Company or topic roadmap on cream surface.
- Background: `--color-surface-card`
- Company/topic icon or logo at top (40px)
- Name: Inter `title-md`, `--color-ink`
- Description: Inter `body-sm`, `--color-body`
- Progress bar: Coral fill on cream track, rounded-full
- Progress text: JetBrains Mono `code-md` — "24/75 solved"
- Difficulty mini-chart: Three small bars (Easy/Medium/Hard proportions)
- Rounded `--radius-lg`, padding 32px

---

### Streak & Progress Indicators

**`progress-bar`** — Horizontal progress bar.
- Track: `--color-hairline` (cream) or `--color-surface-dark-elevated` (dark)
- Fill: `--color-primary` (coral)
- Height: 8px, rounded-full
- Animated fill on mount

**`progress-ring`** — Circular SVG progress ring.
- Track: `--color-hairline` at 0.3 opacity
- Fill: Difficulty color (green/gold/red) or coral
- Stroke width: 6px
- Center text: Percentage or count in JetBrains Mono

**`streak-indicator`** — Current streak display.
- Fire icon (lucide `Flame`) in coral when active, muted when broken
- Count in JetBrains Mono `code-lg`
- "days" label in Inter `caption`
- Coral glow effect when streak is active (box-shadow with coral at 0.2 alpha)

**`milestone-badge`** — Achievement badges for streak milestones.
- Variants: 7-day (coral), 30-day (gold), 100-day (coral with glow)
- Pill shape, JetBrains Mono text
- Background: respective color, text white

---

### Buttons

**`button-primary`** — Coral CTA. Background `--color-primary`, text `--color-on-primary`, Inter 14px/500, padding 12px x 20px, height 40px, rounded `--radius-md` (8px). Active darkens to `--color-primary-active`.

**`button-secondary`** — Cream button with hairline outline. Background `--color-canvas`, text `--color-ink`, 1px hairline border.

**`button-secondary-on-dark`** — Used on dark surfaces. Background `--color-surface-dark-elevated`, text `--color-on-dark`.

**`button-ghost`** — No background, no border. Text `--color-body` or `--color-on-dark`. Hover: subtle background shift.

**`button-icon`** — 36px circular icon button. Background transparent, hairline border, icon in `--color-ink` or `--color-on-dark`.

**`text-link`** — Inline links in `--color-primary` (coral). Underlined on hover.

---

### Inputs & Forms

**`text-input`** — Standard input. Background `--color-canvas`, text `--color-ink`, Inter `body-md`, rounded `--radius-md`, padding 10px x 14px, height 40px. 1px hairline border.

**`text-input-focused`** — Focus state. Border shifts to `--color-primary` (coral). 3px coral-at-15%-alpha outer ring.

**`search-input`** — Search variant. Larger padding, search icon prefix, clear button suffix. Can use pill shape (rounded-full) for prominent placement.

**`filter-dropdown`** — Category filter. Background `--color-surface-card`, rounded `--radius-md`, padding 8px x 12px.

---

### Tags / Badges

**`badge-difficulty-easy`** — Green pill. Background `--color-difficulty-easy`, text white, JetBrains Mono `code-sm`, rounded-pill, padding 4px x 12px.

**`badge-difficulty-medium`** — Gold pill. Background `--color-difficulty-medium`, text white.

**`badge-difficulty-hard`** — Red pill. Background `--color-difficulty-hard`, text white.

**`badge-status-solved`** — Coral pill. Background `--color-primary`, text white, "Solved" text.

**`badge-status-attempted`** — Muted pill. Background `--color-surface-cream-strong`, text `--color-body`.

**`badge-topic`** — Topic tag. Background `--color-surface-card`, text `--color-ink`, Inter `caption`, rounded-pill, padding 4px x 12px.

**`badge-company`** — Company tag. Background `--color-surface-soft`, text `--color-muted`, Inter `caption`, rounded-pill.

---

### Footer

**`footer-professional`** — Dark footer closing every page.
- Background: `--color-surface-dark`
- Max width: 1200px centered
- Padding: 64px vertical
- 4-column grid on desktop, single column on mobile
- All content center-aligned

**Columns:**
1. **Logo & Description** — My DSA Buddy logo + tagline in `--color-on-dark-soft`
2. **Product** — Dashboard, Roadmaps, Problems, Extension
3. **Resources** — GitHub, Documentation, Changelog, Privacy Policy
4. **Open Source** — MIT License, Contributing, Issues, Star on GitHub

**Bottom bar:** Copyright text in `--color-on-dark-soft`, border-top with `--color-surface-dark-elevated`

---

## Dark Mode

Full dark mode via `[data-theme="dark"]` on `<html>`:

### Color Inversions

| Token | Light | Dark |
|---|---|---|
| `--color-canvas` | #faf9f5 | #121110 |
| `--color-surface-soft` | #f5f0e8 | #1a1918 |
| `--color-surface-card` | #efe9de | #222120 |
| `--color-surface-cream-strong` | #e8e0d2 | #2a2928 |
| `--color-surface-dark` | #181715 | #0a0a09 |
| `--color-surface-dark-elevated` | #252320 | #161514 |
| `--color-ink` | #141413 | #faf9f5 |
| `--color-body-strong` | #252523 | #e8e5df |
| `--color-body` | #3d3d3a | #d8d5cf |
| `--color-muted` | #6c6a64 | #8e8b82 |
| `--color-hairline` | #e6dfd8 | rgba(255,255,255,0.1) |
| `--color-on-dark` | #faf9f5 | #faf9f5 |
| `--color-on-dark-soft` | #a09d96 | #a09d96 |

### Colors That Stay the Same
- `--color-primary` (#cc785c) — coral stays consistent
- `--color-difficulty-easy` (#5db872) — green stays
- `--color-difficulty-medium` (#d4a017) — gold stays
- `--color-difficulty-hard` (#c64545) — red stays
- `--color-on-primary` (#ffffff) — white on coral stays

### Theme Toggle
- Uses `@theme-toggles/react` Expand component for sun/moon icon morph
- View Transition API for circular clip-path page reveal animation
- Storage key: `dsabuddy-theme` in localStorage
- ThemeInit.astro inline script prevents FOUC (runs before paint)
- Supports: 'light', 'dark', 'system' modes
- Cross-tab sync via `storage` event
- Cross-page sync via `astro:after-swap` event

---

## Accessibility & Visibility Requirements

### Contrast Ratio Standards
All text must meet WCAG 2.1 AA compliance:
- **Body text**: Minimum 4.5:1 contrast ratio against background
- **Large text** (18px+ regular or 14px+ bold): Minimum 3:1 contrast ratio
- **UI components** (buttons, inputs): Minimum 3:1 contrast ratio

### Text-on-Background Rules
- **NEVER** use `--color-muted` (#6c6a64) on light backgrounds — contrast insufficient
- Always use `--color-ink` (#141413) or `--color-body-strong` (#252523) on light backgrounds
- Always use `--color-on-dark` (#faf9f5) on dark backgrounds
- Difficulty badge colors (green, gold, red) always use white text for contrast

### Component Visibility Checklist
- Primary text uses `--color-ink` or `--color-body-strong` on light backgrounds
- Secondary text uses `--color-body` (not `--color-muted`) on light backgrounds
- Links use `--color-primary` (coral) — never muted
- Text on dark surfaces uses `--color-on-dark` — never muted-soft for primary content
- JetBrains Mono numbers maintain high contrast in both themes

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Bottom nav; hero h1 64→32px; dashboard widgets stack 1-up; problem list full-width; roadmap grid 1-up |
| Tablet | 768–1024px | Top nav horizontal but tight; dashboard 2-up widgets; problem list with collapsible filters; roadmap grid 2-up |
| Desktop | 1024–1440px | Full floating navbar; dashboard 3-up or 2-up widgets; problem list with sidebar filters; roadmap grid 3-up |
| Wide | > 1440px | Same as desktop with more breathing room; max content width caps at 1200px |

### Touch Targets
- Buttons at minimum 40 x 40px
- Icon buttons at 36 x 36px
- Input height 40px
- Problem cards entire area is tappable

### Collapsing Strategy
- Navbar collapses to bottom nav at < 1024px
- Dashboard widgets stack vertically on mobile
- Problem filters collapse to dropdown/modal on mobile
- Streak calendar shows fewer weeks on mobile (26 weeks instead of 52)
- Stats panel goes from 2x2 grid to 2x1 on mobile

---

## Homepage / Landing Page Layout

The landing page includes these sections in order:

1. **Floating Navbar** (`top-nav-floating`)
2. **Hero Section** (`hero-section`) — Headline, subtext, CTA buttons
3. **Feature Showcase** — 3-up cream feature cards (Track Progress, Company Roadmaps, GitHub Sync)
4. **How It Works** — 4-step visual flow (Install Extension → Solve on LeetCode → Auto-Detect → Dashboard Updates)
5. **Stats Preview** — Dark surface section showing sample dashboard widgets
6. **CTA Band** — Coral full-bleed card with "Start Tracking" CTA
7. **Footer** (`footer-professional`)

---

## Dashboard Layout

The dashboard page layout:

1. **Floating Navbar** (always present)
2. **Dashboard Header** — Page title "Dashboard" in Garamond `display-md`, date range selector
3. **Widget Grid** — Responsive grid:
   - Desktop: 3-column (ProgressOverview | StatsPanel | StreakCalendar) + full-width (CategoryBreakdown) + full-width (RecentActivity)
   - Tablet: 2-column stacking
   - Mobile: Single column stacking
4. **Company Progress** — Mini roadmap progress bars (optional section)

---

## Do's and Don'ts

### Do
- Anchor every page on the cream canvas. The warm tint is the brand differentiator.
- Use Garamond serif for every display headline. Pair with Inter sans body.
- Use JetBrains Mono for ALL numeric stats, problem IDs, code snippets, difficulty tags. This is the developer signal.
- Use dark surfaces for problem cards and stats panels. The dark creates focus.
- Use coral sparingly — progress indicators, CTAs, solved badges, streak highlights.
- Pair cream cards with dark cards in alternating bands. The rhythm is the visual language.
- Maintain 32px card padding. Content needs room to breathe.
- Apply 96px between major sections.
- Always verify text contrast meets 4.5:1 ratio (body) or 3:1 (large text/UI).

### Don't
- Don't use cool grays or pure white for canvas. Cream is the brand.
- Don't bold serif display weight past 500. Garamond at 700 reads as aggressive.
- Don't use cool blue or saturated cyan as a brand accent. Warm coral is the brand.
- Don't put coral on every element. Coral is scarce on individual elements, generous on full-bleed callout cards.
- Don't use sans-serif for display headlines. The serif character is the brand voice.
- Don't repeat the same surface mode in two consecutive bands. Alternate: cream → dark → cream → coral → dark.
- Don't use `--color-muted` on light backgrounds — contrast too low.
- Don't skip JetBrains Mono for technical/numeric content — it's the developer identity.
- Don't add hover animations beyond what the system encodes — primary darkens on press, nothing else.

---

## Iteration Guide

1. Focus on ONE component at a time. Reference its token name.
2. Variants (`-active`, `-disabled`, `-focused`) live as separate entries.
3. Use CSS variable references everywhere — never inline hex values.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay Garamond serif 500. Body stays Inter 400. Code stays JetBrains Mono 400. The split is unbreakable.
6. Cream + coral + dark navy is the trinity. Don't introduce a fourth surface tone.
7. When in doubt about emphasis: bigger Garamond serif before bolder weight.
8. When in doubt about data display: JetBrains Mono before Inter.

---

## Known Gaps

- Cormorant Garamond and Inter are loaded via Google Fonts. JetBrains Mono via Google Fonts or self-hosted.
- Chart/graph rendering library not specified — could use lightweight SVG-based approach or a library like Recharts.
- Streak calendar implementation details (SVG grid vs CSS grid) not specified.
- Extension popup styling may use a simplified subset of the design system (smaller viewport).
- Animation timings (page transitions, widget mount animations, progress bar fills) are not in scope for this document.
- The actual LeetCode scraping logic and GitHub API integration are implementation details, not design concerns.
