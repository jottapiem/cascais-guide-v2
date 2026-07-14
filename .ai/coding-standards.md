# Coding Standards — Cascais Guide V2

## TypeScript
- Strict mode aan (`"strict": true` in tsconfig.json)
- Geen `any` — gebruik `unknown` + type guard, of definieer een proper type
- Geen `require()` — gebruik ESM `import`
- Alle functies hebben explicit return types bij public API

## Component structuur
- Feature components in `src/components/app/`
- UI primitives in `src/components/ui/` (shadcn/ui)
- `"use client"` directive alleen als de component state/effects/hooks gebruikt
- Geen `"use server"` in dit project (geen server actions)

## State management (Zustand)
- Eén store: `src/store/app-store.ts`
- Selectors: `useAppStore((s) => s.field)` — nooit de hele store subscriben
- `persist` met `skipHydration: true` — rehydrate handmatig in `providers.tsx`
- Geen `require()` in de store — alle imports zijn ESM

## Animatie — veilig wijzigen
### Wat je NIET moet veranderen
- `MORPH_DURATION = 480` in TransitionLayer.tsx — is gesynchroniseerd met CSS transitions
- `requestAnimationFrame` in de reverse branch — zonder dit fired de transition niet
- `flushSync` in de reverse `goBack()` — zonder dit flikkert de base view
- De FLIP structuur: `transition: none → set start → rAF → transition: 480ms → set end`

### Veilig wijzigen
- `MORPH_RADIUS_PX` in `src/lib/morph-config.ts` — propagates everywhere
- `MORPH_EASE` curve — mag aangepast, blijf binnen SwiftUI range
- `SHEET_OVERLAP` — visuele overlap van sheet op foto

### Veelgemaakte fouten
1. **Hardcoded radius** — gebruik altijd `morph-config.ts`, nooit `28px` of `48px` inline
2. **`next/image` in TransitionLayer** — gebruikt raw `<img>` op purpose (FLIP perf)
3. **Base view scale tijdens morph** — de base view mag NIET schalen (was de oorzaak van "zoom-out" bug)
4. **`backdrop-filter` animatie** — Chromium interpoleert dit janky; gebruik `opacity` transition op een constant-blur element
5. **Scrim z-index** — moet `z-20` zijn (onder detail view z-30/z-40) zodat hij kan blijven actief tijdens detail

## Debug workflow
1. `npx tsc --noEmit` — type check
2. `npx eslint src/components/app/TransitionLayer.tsx` — lint specifieke file
3. Browser console: installeer een RAF sampler om computed styles te checken tijdens animatie
4. `dev.log` — check voor `ChunkLoadError` (Turbopack) of `allowedDevOrigins` warnings

## Performance
- Morph animatie is compositor-only (`transform` + `opacity`, geen layout properties)
- `will-change` alleen op elementen die daadwerkelijk animeren
- Geen `backdrop-filter` interpolatie — gebruik `opacity` op constant-blur element
- Images: `loading="lazy"` op alles behalve above-the-fold
