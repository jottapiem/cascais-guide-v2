# Cascais Guide V2

A private travel discovery web app for friends and family, focused on Cascais (Portugal) and surroundings: Guincho, Sintra, Lisboa, Belém and day trips. Mobile-first, entirely in Dutch, designed to feel like a native iOS app in the browser.

## Tech Stack
- **Next.js 16** (App Router, webpack — not Turbopack)
- **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** + shadcn/ui (base-lyra)
- **Zustand 5** (persisted state)
- **Framer Motion 12** (view transitions + custom FLIP morph)
- **Leaflet** + react-leaflet (maps)
- **npm** package manager

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Architecture

### Shared-element transition (card → detail)
The signature animation uses a custom FLIP (First-Last-Invert-Play) technique:

1. **AirbnbCard** (HomeView) — on tap, captures the card rect and stores it in Zustand (`setMorphPlace`)
2. **TransitionLayer** — a fixed-position overlay that clones the cover image and animates it from the card rect to the hero position using compositor-only transforms. Uses `requestAnimationFrame` to ensure the start state is painted before the transition begins.
3. **DetailView** — fades in after the morph completes (480ms). The hero image and sheet use the same radius as the card (via `src/lib/morph-config.ts`).
4. **morph-scrim** — a backdrop-blur layer at `z-20` that builds opacity during the forward morph, stays active behind the detail view, and fades out during reverse.

### Design tokens
- **Morph radius:** `src/lib/morph-config.ts` — single source of truth for all border-radius in the transition pipeline (`MORPH_RADIUS_PX = 28`)
- **Colors:** `oklch()` in `globals.css` `:root`
- **Ease curves:** SwiftUI `cubic-bezier(0.22, 1, 0.36, 1)`

## Documentation
- `AGENTS.md` — project context (Dutch)
- `.ai/ui-rules.md` — design system rules
- `.ai/tech-stack.md` — technology details
- `.ai/coding-standards.md` — how to safely modify animations
- `.ai/product.md` — product context

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

