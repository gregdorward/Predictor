---
name: Soccer Stats Hub
description: Data-dense football research UI on midnight navy and matchday orange, with a readable editorial lane for static content.
colors:
  primary: "#fe8c00"
  primary-dark: "#f57701"
  midnight: "#020029"
  navy-accent: "#030040"
  background: "#ffffff"
  surface-alt: "#f5f4f4"
  surface-muted: "#fafafa"
  surface-tier-2: "rgb(248, 248, 248)"
  surface-tier-3: "rgb(225, 225, 225)"
  text-primary: "#020029"
  text-faint: "#454545"
  highlight-yellow: "#FFE500"
  highlight-yellow-text: "#020029"
  chart-grid: "rgba(2, 0, 41, 0.08)"
typography:
  display:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.35
  title:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "1.05em"
    fontWeight: 600
    lineHeight: 1.45
  body-reading:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "0.98rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Open Sans', system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  pill: "999px"
spacing:
  content-max: "1400px"
  content-padding-x: "1.5em"
  header-height: "5em"
  static-max: "48rem"
  button-gap: "0.35em"
components:
  button-primary:
    backgroundColor: "{colors.midnight}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.7em 1.5em"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.highlight-yellow-text}"
    rounded: "{rounded.md}"
    padding: "0.7em 1.5em"
  button-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.highlight-yellow-text}"
    rounded: "{rounded.md}"
    padding: "0.75em 1.5em"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.7em 1.5em"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0.5em 0.85em"
---

# Design System: Soccer Stats Hub

## Overview

**Creative North Star: "The Matchday Dashboard"**

Soccer Stats Hub looks like a serious pre-match stats terminal: midnight navy typography, dense tables and charts, and matchday orange reserved for signals that matter—CTAs, active headlines, key numbers, and marketing moments. The product serves fans and researchers equally, so the UI prioritises scanability and proof over decoration.

Static editorial pages (FAQ, methodology, about) use a narrower reading column and lighter type weight; the fixture browser, competition views, and match detail panels stay compact and data-forward. Light mode is the default documented palette; `.dark-mode` on `body` swaps the same roles to near-black surfaces and slightly warmer orange.

**Key Characteristics:**

- Single workhorse family: **Open Sans** (600 default in the app shell; 400 for long-form leads).
- **Midnight navy** (`#020029`) anchors text and default buttons; **matchday orange** (`#fe8c00` / `#f57701` dark) carries brand energy and action.
- **Split density:** ~48rem `StaticPage` for reading; ~1400px app column for research UI.
- **Flat-forward materiality:** borders and tonal surfaces only; no hover lift or shadow escalation on interactive controls (see Elevation).
- **Utilitarian controls:** color and border signal state; orange on hover, not motion or glow.
- Full **light/dark** theme via CSS variables in `src/index.css`, toggled in `src/utils/theme.js`.

## Colors

A navy-and-orange sports analytics palette: trustworthy and legible at small sizes, with yellow highlight pairs for high-contrast CTA text on orange.

### Primary

- **Matchday Orange** (`#fe8c00` light / `#f57701` dark): Primary brand accent—`GeneratePredictionsButton`, guest landing headlines, stat emphasis, links on static pages, chart spinner, theme toggle when on. User direction: allow **brand splash** on headers and marketing surfaces, not only micro-CTAs.
- **Highlight Yellow** (`#FFE500` / `whitesmoke` dark surface): Text on orange buttons (`--span-text-colour`) for readable contrast on filled primaries.

### Secondary

- **Navy Accent** (`#030040`): Secondary brand depth; legacy `--accent-color` / chart tooltip fill in light mode (`#020029`).

### Neutral

- **Midnight Ink** (`#020029` / `#ffffff` dark): Primary text, default filled button background in light mode, chart series color in light theme.
- **Page Background** (`#ffffff` / `#000000` dark): Canvas; body and MUI tables inherit `--background-color`.
- **Surface Stack** (`--secondary-background-color` through `--fourth-background-color`): Stepped greys for rows, ghost hovers, dividers, and disabled regions.
- **Faint Text** (`#454545` / `#c7c7c7` dark): Subheads, upsell copy, `StaticPage-lead`.
- **Subtle Surface** (`#fafafa` / `#141414` dark): Low-contrast panels.

### Named Rules

**The Brand Splash Rule.** Orange may headline marketing blocks, guest landing lines, and primary actions; midnight still carries most body copy and table data so the UI does not read as a single orange block.

**The Variable-First Rule.** New colors must be added as `:root` / `.dark-mode` custom properties in `src/index.css` (or critical CSS for landing), not one-off hex in components.

## Typography

**Display / Body Font:** Open Sans (self-hosted woff2 in `pages/_document.js`, weights 400 and 600)

**Secondary Font:** Inter appears only on `.PremiumUpsell` panels—not the global default.

**Character:** Semibold-by-default gives a sporty, confident UI; editorial leads drop to 400 weight for longer reading.

### Hierarchy

- **Display** (700, `clamp(1.35rem, 3vw, 2rem)`, 1.25): Guest landing titles, major marketing headings.
- **Headline** (600, 1.15rem, 1.35): `StaticPage` h2, section headers in articles.
- **Title** (600, 0.95rem, 1.35): Orange rotating headline lines on guest landing.
- **Body** (600, ~1.05em → scales down at breakpoints, 1.45): Default app shell, tables, buttons—dense UI text.
- **Body (reading)** (400, 0.98rem, 1.6, max ~48rem): `StaticPage-lead`, FAQ intros, methodology prose.
- **Label** (600, 0.92rem, tabular nums on stats): Fixture links, today’s links, compact metadata.

### Named Rules

**The Split Voice Rule.** Do not use display clamp sizes inside fixture tables; use body/label sizes there. Reserve display/headline for landing, static pages, and competition hero zones.

### Typeface candidates (exploratory — not adopted)

Single-family swaps that stay near Open Sans in width and x-height for dense tables (verify at 12–14px and with `font-variant-numeric: tabular-nums` on stats):

| Family | Character | Notes |
| --- | --- | --- |
| **Source Sans 3** | Neutral, editorial UI | Closest “upgrade path” from Open Sans; SIL OFL; self-host like today. |
| **IBM Plex Sans** | Technical dashboard | Slightly more personality; fits Matchday Dashboard; excellent legibility. |
| **DM Sans** | Modern geometric | Similar footprint; a touch crisper at small sizes. |
| **Plus Jakarta Sans** | Stylish but restrained | More brand presence without display-serif drama; test semibold body. |

Avoid ultra-condensed or high-contrast display faces for the main app shell; if testing a candidate, swap one weight in `_document.js` + `guestLandingCriticalCss` first and compare fixture tables side by side.

## Layout

- **App shell:** `#__next` centered, `max-width: var(--content-max-width)` (1400px), horizontal padding `var(--content-padding-x)` (1.5em), shrinking font size at 1800px / 1200px breakpoints.
- **Body offset:** `padding-top: var(--header-height)` (5em) for fixed header (`DarkMode` bar on landing).
- **Editorial:** `.StaticPage` capped at 48rem, centered, 1.5rem side padding, 3rem bottom padding.
- **Guest landing:** CSS grid `GuestLanding-cards` (~1.1fr / 0.9fr) collapsing to single column on smaller viewports; left-aligned intro copy inside a centered shell.
- **Tables:** `.LeagueTable` max-width ~1000px centered; competition views add sticky column patterns under `.Competition__classicLeagueTable*`.
- **Rhythm:** 0.5em–1rem gaps in cards; buttons default `margin: 0.5em` with `min-width: 10em` (8em under 600px).

## Elevation & Depth

Direction is **flat-forward**: depth comes from background steps (`--secondary-background-color`, borders on `--third-background-color`) and border-color shifts—not from elements moving toward the user.

**Target interaction model (normative for new work and refactors):**

| State | Allowed | Disallowed |
| --- | --- | --- |
| Default | 1px border, flat fill, optional **rest** shadow only while legacy CSS remains | Inset highlights, dual shadow stacks on new components |
| `:hover` | `background-color`, `border-color`, `color`, `filter: brightness()` on filled CTAs | `transform: translateY(±n)`, larger/heavier `box-shadow`, orange outer glow |
| `:active` | Slightly darker fill or border (no movement) | Press-down translation |
| `:focus-visible` | 3px primary ring (`rgba(var(--primary-rgb), 0.38)`) | Combining focus ring with hover shadow escalation |

**Incumbent gap:** global `button` rules in `src/index.css` still use `translateY(-1px)` on hover, `--button-shadow-hover` (orange glow), and inset highlights. Treat that as **legacy debt**—do not copy into new components; remove when touching those selectors.

Dark mode deepens surfaces to true black and `#121212` tiers; charts use faint white grid lines (`rgba(255,255,255,0.08)`).

### Shadow Vocabulary (legacy — do not extend)

- **Button rest** (`var(--button-shadow-rest)`): Soft navy-tinted dual shadow on default buttons—remove on refactor, do not add elsewhere.
- **Button hover** (`var(--button-shadow-hover)`): Orange glow—**retired** for target spec; hover must not change shadow weight.
- **Focus ring** (`0 0 0 3px rgba(var(--primary-rgb), 0.38)`): Still required on `:focus-visible`.
- **Fixture row** (`ResultButton`): Light `0 1px 3px` stack—flatten to border + surface tier when refactored.

### Named Rules

**The Flat-Forward Rule.** Surfaces stay in the plane of the layout. Convey importance with color, border weight, and surface tier—not depth illusion.

**The No-Lift Rule.** Interactive elements do not move on hover or active. No `translateY`, `scale`, or shadow growth between rest and hover. The only permitted motion on buttons is optional `filter: brightness()` on orange CTAs (e.g. `GeneratePredictionsButton`).

**The Hover-Color-Only Rule.** For primary and secondary buttons, hover changes at most: background, border, and text color. Secondary hover may add `--button-secondary-hover-bg` wash; it must not reintroduce `--button-shadow-rest` or `--button-shadow-hover` (current `.SecondaryButton:hover` still sets rest shadow—fix when refactoring).

## Shapes

- **Buttons & inputs:** 8px radius (`border-radius: 8px`) on global `button`; secondary uses 2px border.
- **Cards & upsell:** 10–12px on guest landing cards and `PremiumUpsell` (12px).
- **Pills:** `border-radius: 999px` for chip-like controls; theme slider uses 34px pill track.
- **Tables:** Mostly square cells; 6px on compact result buttons.
- **Form language:** Rectilinear dashboard—no oversized rounding on data grids.

## Components

Utilitarian, border-forward controls with orange as the hover and CTA signal.

### Buttons

- **Shape:** Rounded rectangle (8px).
- **Primary (target):** Midnight fill, white text, 1px `--button-border-color`, **no shadow at rest** after refactor. Hover: orange fill, `--span-text-colour` on text, border matches fill—**no transform, no shadow change**.
- **Primary (incumbent `src/index.css`):** Still has inset highlight, rest/hover shadows, and `translateY(-1px)` on hover—align to target when editing global `button` styles.
- **CTA (`GeneratePredictionsButton`):** Orange fill at rest; hover via `filter: brightness(1.05)` only (already compliant with No-Lift).
- **Secondary (target):** Transparent, 2px `--button-secondary-border`; hover orange wash and border tint—**no** `translateY`, **no** `box-shadow` on hover.
- **Ghost (`.GhostButton`):** No border; `--secondary-background-color` / `--third-background-color` on hover/active; `transform: none` (already compliant).
- **Focus:** 3px primary ring only; disabled at 55% opacity, `transform: none`.
- **Transitions:** Color and border only (`0.2s cubic-bezier(0.4, 0, 0.2, 1)`); omit `transform` and `box-shadow` from `transition` lists on new button CSS.

### Chips / tags

- Team comparison score pills use 2em radius borders; form/status colors often sit on grey or navy chips—keep tabular alignment.

### Cards / Containers

- **Guest landing cards:** Transparent backgrounds, 10px radius, grid-aligned—not heavy bordered panels.
- **Premium upsell:** `--alternate-background-color`, 1px `--third-background-color` border, 12px radius, centered (compact variant left-aligned in fixture context).
- **Static FAQ items:** Vertical stack with gap 1.25rem; divider top border on “more links”.

### Inputs / Fields

- Login/email fields follow global button border colors; landing auth constrained to `max-width: 28em`.
- MUI pickers/tables inherit `--background-color` / `--text-color`.

### Navigation

- **Fixed header (`DarkMode`):** Full-width bar, logo left, theme toggle and menu right (`HeaderActions`), z-index 1000.
- **Links:** In-app links use text color; static/more-links use `var(--primary-color)`.
- **Hamburger / theme:** Ghost-style icon buttons in header.

### Fixture & data surfaces

- **League / result lists:** Dense rows, `ResultButton` row chrome with light shadow (candidate to flatten).
- **Charts (Chart.js):** Open Sans axis labels; grid/tooltip colors from `getChartColors()` synced to light/dark body class.

## Do's and Don'ts

### Do:

- **Do** use CSS variables from `:root` / `.dark-mode` for any new UI color or surface.
- **Do** keep editorial content in `.StaticPage` width (~48rem) with 400-weight leads.
- **Do** use orange for brand splash moments—landing headlines, key stats, primary CTAs, and approved marketing headers.
- **Do** respect `prefers-color-scheme` and persisted theme via `initTheme()` / `applyTheme()`.
- **Do** use `Open Sans` for app and charts; only use `Inter` when extending Premium upsell patterns.

### Don't:

- **Don't** introduce a third accent hue; stay within midnight, orange, and neutral greys unless PRODUCT.md adds a brand asset.
- **Don't** add decorative gradients or glass effects to data tables—they fight scanability.
- **Don't** use heavy box-shadow on new panels; use borders and surface tiers instead.
- **Don't** use `translateY`, `scale`, or stronger shadows on `:hover` / `:active` for buttons, chips, or nav controls.
- **Don't** copy legacy global `button` hover behavior (lift + `--button-shadow-hover`) into new components.
- **Don't** center-align long statistical copy; fixture and competition analysis stays left-aligned where incumbent patterns already do.
- **Don't** swap the public brand typeface without updating self-hosted fonts in `_document.js` and critical CSS.
