# Tech Stack — Cascais Guide V2

## Core
- **Framework:** Next.js 16.2.9 (App Router, geen Turbopack in dev — `--webpack` flag)
- **Language:** TypeScript 5 (strict mode, geen `any`)
- **React:** 19.2.4
- **Package manager:** npm (package-lock.json)

## Styling
- **Tailwind CSS v4** (via `@tailwindcss/postcss`, geen `tailwind.config.js` — uses `@theme` in `globals.css`)
- **shadcn/ui** (base-lyra style, phosphor icons)
- **CSS variabelen:** `oklch()` color space in `:root`

## State management
- **Zustand 5** met `persist` middleware (localStorage, `skipHydration: true`)
- Store: `src/store/app-store.ts`
- Manual rehydrate in `src/components/providers.tsx` (na mount, avoids SSR mismatch)

## Animation
- **Framer Motion 12** — view transitions, AnimatePresence, motion components
- **Custom FLIP** — TransitionLayer.tsx gebruikt direct DOM style manipulation (`useLayoutEffect` + `requestAnimationFrame`) voor 60fps compositor-only morph
- **Geen GSAP/Rive** — verwijderd (ongebruikt)

## Maps
- **Leaflet 1.9** + **react-leaflet 5** (SSR uitgeschakeld voor MapCanvas)
- Custom tile styling in `globals.css`

## Data
- **Prisma ORM** (SQLite) — `src/lib/db.ts`
- **Content files:** `content/places/*.json` (25 plekken)
- **Built-in fallback:** `src/lib/places-data.ts` (werkt zonder netwerk)

## Images
- Externe Unsplash URLs via `src/lib/images-v2.ts` (geen lokale foto's nodig)
- Raw `<img>` in morph pipeline (geen `next/image` — interfereert met FLIP)

## Key config
- `next.config.ts`: `allowedDevOrigins` (dynamisch via `os.hostname()` + `os.networkInterfaces()`)
- `tsconfig.json`: strict, `@/*` path alias → `./src/*`
- `.zscripts/dev.sh`: watchdog dev server script (persistente server in sandbox)
