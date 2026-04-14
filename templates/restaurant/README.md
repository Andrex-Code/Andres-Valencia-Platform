# Aubergine — Restaurant Website Template

## Concept
"Modern French, West Village" — a two-Michelin-star fine dining restaurant. The design language is editorial and restrained: warm off-whites, a single sienna accent, and typography that does the heavy lifting. Nothing is decorative that isn't also functional.

---

## Color Palette

| Role | Hex | Rationale |
|---|---|---|
| Ivory (base) | `#faf8f5` | Warm off-white — never pure #fff, which reads clinical |
| Stone (sections) | `#f0ebe3` | Slightly deeper warm white for alternating backgrounds |
| Ink (text) | `#1c1c1a` | Warm near-black — never pure #000, which reads harsh |
| Taupe (muted text) | `#77726c` | Confirmed from Osteria Francescana source inspection |
| Sienna (accent) | `#8b6f4e` | Warm brown — used sparingly on lines, hovers, borders |
| Sienna light | `#b9977a` | For dark-background label text |
| Charcoal (dark sections) | `#2a2825` | Press strip, reservation — warm dark, not cold gray |
| Cream (text on dark) | `#f5f0e8` | Champagne warmth, not stark white |
| Border | `#e4ddd5` | Subtle warm dividers |

**Philosophy:** Color comes from photography. The palette itself is nearly colorless — warm neutrals only. One accent color (sienna) used only for decorative lines, hover states, and active indicators. This mirrors exactly what Canlis, Noma, and Osteria Francescana do.

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / Headlines | Cormorant Garamond | 300, 400, 400i, 600 | Extreme stroke contrast, "precious" at large scale |
| Body / UI | Inter | 300, 400, 500 | Neutral, airy — light weight creates expensive feel |

**Sizing system:**
- Hero title: `clamp(4rem, 6.5vw, 8rem)` — fluid, never breaks layout
- Section headings: `clamp(2.5rem, 4vw, 5rem)` — scales across all viewpoints
- Body: `0.9375rem` (15px) at weight 300 — readable without feeling dense
- UI labels: `0.625rem`, weight 500, `letter-spacing: 0.22em`, uppercase — the fine dining signal
- Line height on headlines: `0.95–1.05` — compressed editorial look
- Line height on body: `1.75–1.8` — generous breathing room

---

## Brand Inspirations

### Noma (Copenhagen)
- Near-colorless palette with photography providing all color
- Minimal navigation (≤5 items)
- `prefers-reduced-motion` respected in all animations
- Seasonal identity baked into the concept

### Canlis (Seattle)
- Manifesto/statement section: large italic serif quote on clean background
- Copy tone: personal, not transactional — "The table is the most honest place I know"
- Restraint as a brand signal

### Osteria Francescana (Modena)
- Bodoni/Cormorant + Roboto/Inter pairing confirmed
- Taupe `#77726c` for secondary text confirmed from source
- Ghost/outline reservation button in nav — not filled
- All-caps spaced labels at 0.2em+ tracking

### Eleven Madison Park (NYC)
- Tasting menu displayed as HTML typeset content, never a PDF
- Each course as a narrative unit: number + name + poetic description
- Press quotes from named publications (not star ratings)
- Reservation via Resy — outlined button, not filled CTA

### Le Bernardin (NYC)
- Monochrome awards display — white on dark, never colored badge images
- Wine program given full parity with food menu
- Private dining and chef's table as distinct offerings

---

## Design Decisions

### Hero: Split Viewport (not centered text over image)
The centered-text-on-dark-image hero with gradient overlay is the most common restaurant template pattern. Instead: left column is pure typography (serif headline, description, CTAs), right column is full-bleed photography. A 1px vertical rule separates them. This is the editorial magazine approach — text and image as equals, not text imposed over image.

### Menu as Typeset HTML (not PDF)
PDF menus are a confirmed anti-pattern for premium restaurants. The tasting menu is coded as a sequence of course rows (Roman numeral + italic name + poetic description). À la carte uses `display: flex; justify-content: space-between` for name/price pairs with 1px warm borders — exactly the typeset printed menu aesthetic, in code.

### Awards Strip: Monochrome on Dark
Awards displayed in white/cream on near-black charcoal, with reduced opacity until hover. Color award logos signal insecurity. A Michelin star in white on black communicates more confidence than a badge.

### Navigation: Ghost Reserve Button
The "Reserve a Table" CTA in the nav is an outlined ghost button (border: 1px solid ink), not a filled color button. This is the premium signal — Canlis, EMP, and Osteria Francescana all do this. Filled colored buttons feel like a booking.com widget.

### Reservation Form: Underline Inputs
Form inputs use only a bottom border (`border-bottom: 1px solid`) on a transparent background — the "luxury underline input" style. No boxed inputs, no rounded corners, no background fill. Party size uses chip/toggle buttons instead of a select dropdown.

### Scroll Animations
`IntersectionObserver`-based reveals only — no library. Directions: `up` (translateY 48px), `left`, `right`, `fade`. Staggered delays via `data-delay` attribute. All animations respect `prefers-reduced-motion` implicitly through the transition declarations.

### Asymmetric Story Blocks
Two alternating image/text blocks: image left + text right, then text left + image right. Images bleed to the page edge (no container padding). Text columns use `var(--stone)` background. This creates editorial rhythm without repetition — the structural opposite of a 3-column feature grid.

---

## Sections

1. **Sticky Nav** — transparent → ivory + border on scroll; ghost reserve CTA; full-screen mobile overlay with large italic serif links
2. **Hero** — split viewport, left: editorial type, right: atmospheric food photography; animated scroll drip indicator
3. **Awards Strip** — dark charcoal band, monochrome awards, hover reveals full opacity
4. **Manifesto** — large italic Cormorant quote on ivory, 2-column grid with label column
5. **Story** — two asymmetric blocks, edge-bleeding images, `var(--stone)` text panels
6. **Menu** — tabbed (Tasting / À La Carte / Wine); tasting as course narrative; à la carte as typeset list; wine as curated selection
7. **Press** — 3 pull quotes from named publications on charcoal; italic serif; attributed with publication name
8. **Gallery** — 12-column editorial mosaic, hover reveals full saturation and scale
9. **Chef** — half/half block, grayscale→color image hover, biographical credentials
10. **Reservation** — dark section with watermark type; underline form inputs; party size chips; min date enforced
11. **Footer** — 4-column on dark ink; warm social icons; minimal legal row
