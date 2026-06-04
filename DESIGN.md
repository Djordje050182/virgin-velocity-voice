# DESIGN.md — Virgin Australia × ElevenLabs pitch site

> The design system for the pitch deck. **Follow this strictly.** It exists so the site
> reads as a confident, editorial, brand-true artefact — not a default Claude/Tailwind page.
> Every colour below was **sampled from a real brand**, not invented. Provenance is noted.

---

## 0. North star

Two stakeholders, two emotional registers, one page:

- **Chief Customer Officer** → brand, warmth, emotion, customer experience. Served by the
  **serif display voice**, generous whitespace, the switchboard-operator humanity.
- **Head of AI** → precision, architecture, latency, cost, security. Served by the
  **grotesque/mono voice**, hairline rules, exact numbers, systems diagrams.

The whole aesthetic is the thesis made visual: **the warmth of the switchboard operator,
delivered with the precision of modern systems.** Serif + grotesque. Paper + ink. Warm + exact.

The feel sits between **Virgin Australia** (confident red, geometric, optimistic) and
**ElevenLabs** (monochrome, editorial, restrained). We blend, we don't copy either.

---

## 1. Palette (sampled from live brand CSS)

### Virgin Australia — sampled from `vaa-styleguide` + `vaa-commons` min.css (live, June 2026)
| Token | Hex | Provenance / use |
|---|---|---|
| `--va-red` | `#E10A0A` | **Virgin primary red** — most-used brand colour in their CSS. Our primary. |
| `--va-red-deep` | `#9A0000` | Their hover/pressed red. Our pressed/active + deep shadows. |
| `--va-ink` | `#14110F` | Near-black warm ink (our derivation; VA uses `#333` for body text). |
| `--va-grey` | `#6D6E71` | VA neutral grey — secondary text, captions. |

### Velocity Frequent Flyer — sampled from the same bundles (Velocity is the violet system)
| Token | Hex | Provenance / use |
|---|---|---|
| `--vel-violet` | `#2D054E` | **Velocity deep violet** — loyalty / member-tier surfaces. |
| `--vel-purple` | `#512698` | Velocity mid purple — tier accents, gold/platinum framing. |
| `--vel-lilac` | `#ECE0FF` | Velocity pale lilac — soft member-tile backgrounds. |
| `--vel-pink` | `#FA7D9C` | Velocity pink — single considered accent, sparingly. |

### Neutrals (our editorial paper/ink — warm, not slate)
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F3EE` | Warm off-white page (NOT pure white, NOT slate). |
| `--paper-2` | `#EFE9E1` | Recessed panels. |
| `--ink` | `#14110F` | Primary text. |
| `--ink-2` | `#4A4640` | Secondary text. |
| `--line` | `#DED6CB` | Hairline rules / borders (1px, the editorial spine). |

> **Banned colours: indigo, slate, the `#6366F1`/`#0F172A` Tailwind defaults.** If you reach for
> a blue-grey, stop — use warm `--paper`/`--ink` or Velocity violet instead.

---

## 2. Three themes (the live look-and-feel toggle)

The page ships with a theme switch; all themes are driven by CSS custom properties on
`:root[data-theme]`. **Switching theme must never reflow layout** — only tokens change.

1. **`virgin`** *(default)* — `--paper` background, `--ink` text, **`--va-red` primary**,
   Velocity violet as deep accent. Confident, optimistic, brand-true.
2. **`eleven`** — ElevenLabs minimal. Background `#FFFFFF`, text `#0A0A0A`, near-monochrome,
   red reduced to a single hairline/underline accent. Maximum whitespace, editorial restraint.
3. **`dark`** — dark editorial. Background `#0D0C0F`, text `#F2ECE3`, red + violet glow as
   accents. For the cold open and the architecture/technical beats.

---

## 3. Typography (Google Fonts — opinionated pairing, **no Inter**)

| Role | Face | Why |
|---|---|---|
| **Display** | **Fraunces** (variable, high optical contrast, soft/wonky) | Warm, literary, human — the switchboard-operator voice. Carries the CCO's emotional beats. Nothing like Inter. |
| **Body / UI / data** | **Space Grotesk** | Precise, technical grotesque — the Head-of-AI voice. Excellent for figures, labels, the ROI calculator and architecture diagram. Echoes Virgin's geometric Montserrat without being it. |
| **Mono (only where needed)** | Space Grotesk's tabular figures / `ui-monospace` | Latency numbers, code-ish tooltips. |

**Type scale** (fluid, `clamp()`), display set tight and large:

```
--step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem)   /* fine print, captions */
--step-0:  clamp(1rem, 0.95rem + 0.25vw, 1.13rem)     /* body */
--step-1:  clamp(1.33rem, 1.2rem + 0.6vw, 1.6rem)     /* lead */
--step-2:  clamp(1.77rem, 1.5rem + 1.3vw, 2.4rem)     /* h3 */
--step-3:  clamp(2.37rem, 1.9rem + 2.3vw, 3.6rem)     /* h2 */
--step-4:  clamp(3.16rem, 2.3rem + 4.2vw, 5.6rem)     /* h1 / statement */
--step-5:  clamp(4.2rem, 2.8rem + 7vw, 8rem)          /* cold-open hero */
```

- Display headlines: Fraunces, weight 400–500, **optical size high**, tight leading (~0.95),
  letter-spacing slightly negative. Use *italic* Fraunces for the emotional pull-quotes.
- Body: Space Grotesk 400, leading ~1.5, measure capped at ~62ch.
- **Numbers** (ROI, latency, figures): Space Grotesk, tabular, larger than surrounding text —
  let the data be loud.

---

## 4. Layout & grid

- **Editorial, asymmetric.** A 12-column grid with a strong left margin; content often sits
  in 7–9 columns, not centred. The left-hand slide nav is a persistent rail.
- Generous whitespace; let single statements own a viewport (cold open, switchboard).
- **One hairline spine**: a 1px `--line` rule recurring as the structural motif (it rhymes
  with the switchboard cords and the workflow edges).
- Slides are full-height sections; left nav scroll-jumps between them.
- Max content width ~1200px on data slides; statement slides go full-bleed.

---

## 5. Motifs (recreate in CSS/SVG — never hotlink copyrighted logos)

- **Virgin roundel** — a clean concentric-circle SVG homage (the circle-in-circle gesture),
  in `--va-red`. NOT the trademarked logo. Comment: *"swap for licensed asset in production."*
- **ElevenLabs "ll" mark** — two vertical bars / equaliser strokes rendered in CSS, nodding to
  the `ll` and the waveform. Monochrome.
- **The cord board** — a recurring SVG of switchboard patch-cords (gentle bézier curves between
  two columns of jacks). Introduced in the cold open, then **reused as the visual language of
  the workflow routing edges and the architecture connections.** This is the signature thread.
- **Waveform** — a thin animated voice waveform near the live-agent control (subtle, the only
  "alive" motion on the demo slide).

---

## 6. Motion (restraint — this is a live demo, not a showreel)

- Section enter: a single 250–350ms fade + 8px rise. Once. No parallax, no scroll-jacking.
- Theme switch: 200ms token cross-fade.
- The **only** continuous motion: the demo waveform and the SMS/WhatsApp typing dots + message
  arrival (these are content, they earn it).
- `prefers-reduced-motion`: disable all but opacity.
- Respect the demo: nothing that competes with Hannah's voice for attention.

---

## 7. Components

- **Buttons** — flat, square-ish (`border-radius: 4px` max), solid `--va-red` or ghost
  (1px `--ink` border). **No gradients. No pill `rounded-2xl`. No glow.** One clear primary CTA
  per slide ("Start the call", "Simulate Virgin ops event").
- **Cards** — only where genuinely needed (member tiles, comparison). 1px `--line` border,
  flat, `--paper-2` fill. **No soft drop shadows, no glassmorphism.**
- **Phone mockup** (SMS/WhatsApp) — realistic device frame, iMessage/WhatsApp-accurate bubbles,
  typing indicator, Virgin branding in the chat header. This one is allowed to be pixel-real.
- **Left nav** — numbered slide list, current slide marked with a `--va-red` tick/rule.
- **Tooltips** (architecture diagram) — flat panel, 1px border, Space Grotesk, two lines max.

---

## 8. Banned tells (if any appear, the design has failed)

- ❌ Inter (or system-ui masquerading as it) anywhere
- ❌ indigo / slate / `#6366F1` / blue-grey
- ❌ glassmorphism, backdrop-blur cards
- ❌ gradient buttons, glowing CTAs
- ❌ `rounded-2xl` everything / pill-shaped cards
- ❌ emoji in headings
- ❌ equal three-column feature grid
- ❌ centred-hero-with-subtitle-and-two-buttons template
- ❌ soft uniform drop shadows on every card

---

## 9. Accessibility & demo-resilience constraints

- Contrast: body text ≥ 4.5:1 on every theme (verify red-on-paper, paper-on-dark).
- All state in JS memory only — **no localStorage/sessionStorage** (fails in embedded tab share).
- Audio must play from the page (tab-share path) — visible, large play controls.
- Keyboard: arrow keys advance slides; nav is focusable.
