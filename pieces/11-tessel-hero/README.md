# 11 Tessel hero

Hero for Tessel, an invented catalogue studio that rewrites a shop's product pages in every language it ships
to, with nothing going live until someone approves it.

Layout, top to bottom: announcement strip, nav with dropdowns, a pill eyebrow, a centred two-line headline,
the lede and two actions, then the Tessel app inside a panel of painted colour, then a line of proof over
invented wordmarks.

## What moves
- **The painted panel:** seven soft pigments (blue, apricot, peach, sage, sky) orbit and morph on their own
  13–24 s cycles under grain, and lean gently toward the pointer on mouse devices. It pauses off screen and
  holds still under reduced motion.
- **The entrance:** the app rises into the light once and the third draft writes itself in, then the
  visitor has control.

## The app works
- Sidebar views (Studio, Catalogue, Reviews, Brand voice) and the three threads switch.
- Each draft is a drawn product (a knitted swatch or a glaze, in SVG) with its rewritten title, copy, word
  count and brand-voice match. Approve stamps it.
- Type in the composer and send (or press Enter): a new thread streams three drafts in, each a skeleton that
  shimmers until its copy types out. The model picker, @mention and format chips work.

Every figure and line of copy comes from `data.ts`.

## Use this section in another app
- Packages: `motion`, `next` (for `next/font/local`).
- Files: `Section.tsx`, `data.ts`, `post.css`, `fonts/` (Instrument Sans, Instrument Serif, Geist, Geist Mono, EB Garamond and Funnel Display, all OFL).

```tsx
import TesselHero from "./sections/11-tessel-hero/Section";
<TesselHero />
```

