# UI Rules — Cascais Guide V2

## Border radius — source of truth
De shared-element morph radius staat in `src/lib/morph-config.ts`:
- `MORPH_RADIUS_PX = 28` — de anchor waarde
- `MORPH_RADIUS_ALL` — "28px 28px 28px 28px" (alle hoeken, voor image containers)
- `MORPH_RADIUS_SHEET` — "28px 28px 0 0" (bovenste hoeken rond, onderste vierkant, voor sheets)

**Regel:** Wijzig NOOIT een hardcoded `28px` of `48px` in een component. Importeer altijd uit `morph-config.ts`.

Componenten die deze token gebruiken:
1. `HomeView.tsx` → AirbnbCard image wrapper
2. `TransitionLayer.tsx` → container, image, sheet
3. `DetailView.tsx` → hero frame, sheet

## Kleuren
- Primary: coastal teal `#0891b2` (oklch in globals.css)
- Accent: sunset coral `#f97316`
- Background: warm cream `oklch(0.985 0.004 85)`
- Card: zuiver wit `oklch(1 0 0)`
- Foreground: diep teal-grijs `oklch(0.16 0.012 230)`

## Glassmorphism
- `.glass-strong` in globals.css: 85% tint, 24px blur, 200% saturate
- Gebruik voor: floating buttons, sticky bars, overlays

## Typography
- Font: Plus Jakarta Sans (next/font/google)
- Weights: 300-800
- Body: 14px base, tracking -0.01em op headings
- Uppercase labels: 11px, tracking 0.18em, font-weight 700

## Icons
- Uitsluitend Lucide React icons (of @iconify/react voor category bubbles)
- Geen emoji's
- Stroke width: 2.2-2.6 voor UI icons

## SwiftUI ease curves
- Primary: `cubic-bezier(0.22, 1, 0.36, 1)` — SWIFT_EASE
- Sheet: `cubic-bezier(0.16, 1, 0.3, 1)` — SHEET_EASE
- Exit: `cubic-bezier(0.7, 0, 0.84, 0)` — EASE_EXIT

## Mobile-first
- Max container: `max-w-md` (448px)
- Touch targets: minimaal 44px
- Safe area: `pt-safe-lg`, `pb-safe` utilities
- Geen hover-only interacties
