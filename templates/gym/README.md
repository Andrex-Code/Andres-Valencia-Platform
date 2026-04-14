# IRONFORM — Gym Website Template

## Design Decisions

### Concept
"Luxury Black Tier" aesthetic — inspired by Equinox's editorial restraint and Barry's Bootcamp's high-energy dark identity. Positioned as a premium independent gym that competes with franchise brands on visual sophistication.

### Color Palette
| Role | Hex | Usage |
|---|---|---|
| Background | `#0D0D0D` | Page base, hero |
| Surface | `#161616` | Cards, sections |
| Surface elevated | `#1F1F1F` | Form, featured pricing |
| Gold accent | `#C9A84C` | CTAs, highlights, tags |
| Gold muted | `#8A6F2E` | Borders, secondary gold |
| Red energy | `#D93025` | High-intensity class tags |
| White | `#FFFFFF` | Primary text |
| Gray-1 | `#F0F0F0` | Body text |
| Gray-2 | `#A0A0A0` | Muted text |
| Gray-3 | `#444444` | Dividers |

### Typography
- **Display (headlines):** Bebas Neue — condensed, aggressive, zero-fuss authority
- **Headings (subheads):** Barlow Condensed 600/700 — structured, readable, purposeful
- **Body:** Inter 300/400/500 — neutral, clean, maximally legible

Pairing rationale: Bebas delivers visual impact at large sizes without any decorative noise. Inter at 300 weight creates breathing room in body copy, a contrast technique seen on Equinox and David Barton Gym.

### Brand Inspirations
1. **Equinox** — near-black backgrounds, gold luxury signaling, editorial photography framing, generous negative space
2. **Barry's Bootcamp** — dark energy, bold condensed display type, intensity-tagged classes
3. **David Barton Gym** — treating fitness as a lifestyle brand, not a utility; fashion-forward layout thinking
4. **F45 Training** — structured grid layouts, science-first copy tone, spec-driven trainer cards

## Sections
1. **Sticky Nav** — transparent → frosted glass on scroll, hamburger overlay for mobile
2. **Hero** — full-viewport editorial image, asymmetric left-anchored type, floating stats bar
3. **Marquee** — gold banner with discipline names, infinite scroll animation
4. **About** — overlapping image composition with rotating badge, 4-pillar grid
5. **Classes** — asymmetric masonry grid with hover-reveal descriptions, intensity tags, filter buttons
6. **Stats** — 4-column counter grid with animated count-up on scroll entry
7. **Trainers** — grayscale→color hover reveal on trainer cards, cert/spec tags
8. **Gallery** — 12-column editorial mosaic layout
9. **Testimonials** — 3-column cards with animated left-border reveal on hover
10. **Pricing** — 3-tier with elevated featured card, full feature comparison
11. **Contact/Booking** — split layout: info + booking form
12. **Footer** — 4-column with social links, legal links

## Key Micro-interactions
- Nav links: `scaleX` underline wipe on hover
- All primary buttons: `translateY` white fill wipe (upward) on hover
- Cards: `scale(1.06)` image zoom with `overflow: hidden` container
- Scroll reveals: `translateY(40px) → 0` + `opacity 0→1` via IntersectionObserver
- Counters: cubic eased count-up animation triggered on viewport entry
- Trainer photos: grayscale → full color on hover
- Mobile: sticky booking bar pinned to bottom viewport
