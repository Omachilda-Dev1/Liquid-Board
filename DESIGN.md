---
name: LIQUID BOARD
description: Paper-trading terminal drawn as a transit signage system; every market is a route.
colors:
  ground: "#161616"
  ground-2: "#1e1e1e"
  ground-3: "#262626"
  rule: "#2f2f2f"
  rule-strong: "#4a4a4a"
  ink: "#f2f2f0"
  ink-2: "#b4b4b0"
  ink-3: "#8a8a86"
  band: "#000000"
  band-ink: "#f2f2f0"
  band-ink-2: "#a8a8a4"
  selected: "#f2f2f0"
  selected-ink: "#141414"
  up: "#2fc46c"
  down: "#ff5c50"
  up-fill: "#007a33"
  down-fill: "#d42a20"
  sel-up: "#00702f"
  sel-down: "#b8211a"
  focus: "#fccc0a"
  ground-light: "#fafaf8"
  ground-2-light: "#f0f0ee"
  ground-3-light: "#e6e6e3"
  rule-light: "#dcdcd8"
  rule-strong-light: "#b5b5b0"
  ink-light: "#141414"
  ink-2-light: "#4a4a47"
  ink-3-light: "#6b6b67"
  band-light: "#141414"
  band-ink-2-light: "#b4b4b0"
  up-light: "#007a33"
  down-light: "#c4231a"
  down-fill-light: "#c4231a"
  sel-up-light: "#2fc46c"
  sel-down-light: "#ff5c50"
  focus-light: "#2a5bd7"
  route-btc: "#ff6319"
  route-eth: "#2a5bd7"
  route-sol: "#b933ad"
  route-avax: "#a7a9ac"
  route-link: "#00add0"
  route-uni: "#e05fae"
  route-aapl: "#8d8f92"
  route-nvda: "#996633"
  route-tsla: "#fccc0a"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\", \"zero\""
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0.08em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  figure:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\", \"zero\""
rounded:
  none: "0px"
  bullet: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  sign-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "4px 16px 0"
    height: "40px"
  header-band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    rounded: "{rounded.none}"
    height: "56px"
  button-buy:
    backgroundColor: "{colors.up-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    height: "48px"
  button-sell:
    backgroundColor: "{colors.down-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    height: "48px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  segment-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.none}"
    height: "32px"
  input-field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "44px"
  market-row-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  route-bullet:
    rounded: "{rounded.bullet}"
    size: "28px"
---

# Design System: LIQUID BOARD

## Overview

**Creative North Star: "Every Market Is a Route"**

LIQUID BOARD reads like a 1970 subway signage system laid over a trading desk. Black sign bands with a thin white rule name every work area; each asset rides under its own round route bullet; price is read as a position on a line. The ground is a near-black platform in dark mode (the default, for long sessions in dim rooms) and an off-white wall in light mode; the bands stay black in both.

Density is high and calm. Everything is set on square corners and 1px rules, with no shadow, no glow and no card chrome, so the colour that does appear carries meaning: route colours say which market, signal green and red say which direction, the selected inversion says where you are. The system refuses the exchange default of charcoal cards with one yellow accent and glow.

The world has one signature, the 24H ROUTE: the day's range drawn as a station line (24h low, Open, Your entry, 24h high) with the live price riding it as a round NOW train.

**Key Characteristics:**
- Black sign bands with a 1px white rule inset 4px from the top label every panel.
- Round route bullets in per-asset colours; full strength only on the selected market.
- Square corners and 1px rules everywhere; circles only for bullets, stations, trains and thumbs.
- No shadows, no glow, no gradients.
- Every figure is JetBrains Mono with tabular, slashed-zero numerals.
- Selection is shown by inversion (ink ground, ground ink), not by an accent colour.

## Colors

A neutral platform of near-blacks and off-whites, nine route colours that identify markets, and one signal pair reserved for direction.

### Primary
- **Route Colours** (`route-btc` orange, `route-eth` blue, `route-sol` purple, `route-avax` grey, `route-link` cyan, `route-uni` magenta, `route-aapl` slate, `route-nvda` brown, `route-tsla` yellow): one per asset, defined with a matching readable ink (`routeInk`, #141414 or #ffffff) in `lib/mockData.ts`. They fill the asset's bullet, the chart line in line mode, the live-price marker and axis tag on the chart, the order book mid price, the 24H ROUTE line and the NOW train. They are identity, never direction.

### Secondary
- **Signal Green / Signal Red, text** (`up` / `down`, dark; `up-light` / `down-light`, light): price direction only. Changes, P&L, bids and asks, candles, depth washes.
- **Signal fills** (`up-fill` / `down-fill`; light uses `up-fill` and `down-fill-light`): solid backgrounds behind white text, used on the Buy / Sell segment and the submit button.
- **Signal on inversion** (`sel-up` / `sel-down`, swapped per theme): direction text on a selected (inverted) row, where the ordinary signal colour would sit on the opposite ground.
- **Signal washes** (`--up-wash` rgba(47,196,108,0.14) / `--down-wash` rgba(255,92,80,0.14) dark; 0.12 / 0.11 alpha of the light signals): tick flashes and order book depth bars.

Cited deviation from the direction contract: the contract named signal green #00933c and red #ee352e. Both fail WCAG 4.5:1 for small text on these grounds, so the build splits signal into text values tuned per theme (dark #2fc46c / #ff5c50, light #007a33 / #c4231a) and fill values for white-text buttons (dark #007a33 / #d42a20, light #007a33 / #c4231a).

### Tertiary
- **Focus Yellow** (`focus`, dark) / **Focus Blue** (`focus-light`): the 2px focus ring, the text caret and the `::selection` background (with #141414 text). Never used as a decorative accent.

### Neutral
- **Platform Black** (`ground`): page ground in dark mode. **Off-White Wall** (`ground-light`) in light.
- **Raised Ground** (`ground-2`, `ground-3`): ticker strip, hover rows and hover buttons. Tonal steps only.
- **Rules** (`rule`, `rule-strong`): 1px dividers (`rule`) and control outlines, inputs and scrollbar thumbs (`rule-strong`).
- **Ink ramp** (`ink`, `ink-2`, `ink-3`): primary text, secondary values, and labels or captions.
- **Sign Black** (`band`, #000000 dark, #141414 light) with **Band Ink** (`band-ink`, `band-ink-2`): every sign band, the header and the mobile nav. The band rule uses band ink at 0.9 opacity.
- **Inversion** (`selected` / `selected-ink`): the selected market row and selected segment of every segmented control.

Cited deviation from the direction contract: the contract named a #1c1c1c dark ground with #141414 bands. At that pairing the bands lose their separation from the ground in dark mode, so the build darkens the ground to #161616 and the dark band to pure #000000. Light mode keeps the contract's #141414 band.

### Named Rules
**The Route Is Identity Rule.** Route colours identify a market and nothing else. A route colour appears at full strength only on the selected market; every unselected bullet carries `filter: saturate(0.35)` at 0.8 opacity. The ticker strip is the one place all bullets show full strength, because it is a route map of every line at once.

**The Signal Is Direction Rule.** Green and red mean up and down (or buy and sell). They never decorate, label a category, or stand in for success and error chrome beyond the order outcome.

**The Readable Signal Rule.** Signal text uses the per-theme text values; solid fills use the fill values with white text; text on an inverted row uses `sel-up` / `sel-down`. Signal text on a sign band uses the dark text values in both themes, because the band is black in both.

## Typography

**Display Font:** none distinct; the largest type is the live price, set in the figure face.
**Body Font:** Archivo (with Helvetica Neue, Arial, sans-serif), loaded through `next/font` as `--font-sans`.
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace) as `--font-mono`.

**Character:** A plain grotesk for words, set in caps with open tracking when it labels a band, as a sign painter would; a monospaced figure face for every number so columns of prices never jitter.

### Hierarchy
- **Display** (JetBrains Mono 600, 40px desktop / 32px mobile, line-height 1, -0.03em): the live price in the pair header. One per screen.
- **Headline** (Archivo 800, 19px, -0.01em): the pair name in the pair header, with the symbol pair in 500 weight `ink-3`.
- **Title** (Archivo 700, 13px, 0.08em, uppercase): sign band labels and the 24H ROUTE heading. Panel sub-heads inside a band area use the same treatment at 12px.
- **Body** (Archivo 400, 14px, 1.4): base text; market names at 14px/600; ticket summaries and tables at 13px.
- **Label** (Archivo 600, 12px; 11px uppercase 0.06-0.08em for column heads and band stat labels): field labels, stat captions, mobile nav labels.
- **Figure** (JetBrains Mono, tabular-nums slashed-zero, -0.01em, 11-22px): every price, size, total, percentage, clock and count.

### Named Rules
**The Tabular Figure Rule.** Any number a trader reads goes in the figure face with tabular, slashed-zero numerals. No proportional digits anywhere a value can tick.

**The Sign Caps Rule.** Uppercase with 0.06-0.08em tracking is for sign band labels, band stat labels, column heads and button labels in bands. Body copy and field labels stay in sentence case.

## Layout

A fixed-viewport terminal (`100dvh`, no page scroll); panels scroll internally. Three layouts, chosen in JavaScript by `matchMedia`:

- **Desktop (1180px and up):** 56px header band, 36px ticker strip, then a three-column grid of 260px markets rail, fluid centre, 340px right column. The centre stacks the pair header, a split row of [timeframe tabs, chart, 24H ROUTE] beside a 280px order book that fills the row height around the mid price, and a 220px portfolio tab panel. The right column holds the order ticket above the account panel.
- **Tablet (768-1179px):** header and ticker, then a 260px rail (markets above account) beside a fluid main column with the pair header and a band-styled tab bar (Chart, Trade, Portfolio). Trade shows ticket and a 9-row book side by side.
- **Mobile (below 768px):** header band, no ticker, a single scrolling panel, and a 56px bottom nav band with Markets, Chart, Trade, Portfolio. Chart view stacks pair header, a 340px chart, the route and the book.

Spacing runs on a 4px base: 16px panel gutters (20px for the pair header and route at md and up), 12px vertical rhythm inside panels, 8px between related controls. Panels are separated by 1px rules rather than gaps.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth is conveyed by the black sign bands sitting against the ground, by tonal steps (`ground-2`, `ground-3`) for strips and hover, by 1px rules between panels, and by inversion for the selected item. Toasts are bands with a 1px `#4a4a4a` outline, not lifted cards.

### Named Rules
**The No-Lift Rule.** Nothing casts a shadow or glows. If a layer needs to stand apart, it becomes a band or gets a rule.

## Shapes

Square corners (0px) on every panel, input, button, segment, tag and scrollbar thumb. Circles are reserved for the transit vocabulary: route bullets, the wordmark roundel, 24H ROUTE stations and train, the fear and greed marker, the leverage thumb, toast tone dots and the portfolio count badge. Lines are 1px for rules, 2px for the Buy / Sell segment outline, 3px for active-tab underlines, and 4px for station and thumb rings.

### Named Rules
**The Circle Means Transit Rule.** A round form is a bullet, a station or a train. Containers are never rounded.

## Components

### Sign Band
The defining container label. A black band (`band`) at 40px minimum height, 16px side padding, 4px top padding, with a 1px band-ink rule inset 4px from the top edge at 0.9 opacity. The label is the Title style; optional right-side meta sits at 12px in `band-ink-2`. The same band treatment builds the 56px header, the portfolio tab bar (active tab marked by a 3px band-ink underline) and the mobile nav (active item marked by a 3px band-ink bar along the top). Controls on a band are outlined 1px `#4a4a4a` and invert to band ink on hover.

### Route Bullet
A circle filled with the asset's route colour carrying the symbol in its route ink, Archivo 800 at -0.02em, font size about 0.36 of the diameter (0.3 for four-letter symbols). Sizes in use: 26px ticker, 30px market rows, 44px pair header. Unselected bullets carry `saturate(0.35)` at 0.8 opacity; the change animates over 300ms.

### 24H ROUTE (signature)
The day's range as a route line: an 8px route-coloured line with the travelled part (low to now) overlaid in ink at 0.25 opacity. Stations are 18px circles with 4px ink rings on the ground colour; the Your entry station is filled ink. Stations closer than 84px merge into one interchange capsule, 14px wider per extra stop, listing each stop's label and value. Price labels sit above stations and hide when within 64px of the train. The live price is a 32px round NOW train in route colour with a 3px ink ring, moving with a 1200ms `cubic-bezier(0.16, 1, 0.3, 1)` transition on `left`. A summary line gives now, distance above low and distance to high.

### Market Rows
Full-width buttons with a 1px bottom rule: bullet, name (14px/600) over type (12px `ink-3`), price over change in figures. Hover goes to `ground-3`. The selected row inverts (`selected` / `selected-ink`), carries the full-strength bullet, drops the tick flash, and shows its change in `sel-up` / `sel-down`.

### Buttons
- **Shape:** square (0px).
- **Submit:** 48px tall, full width, Archivo 800 15px white on `up-fill` or `down-fill`; hover brightens (`brightness(1.1)`), disabled drops to 0.4 opacity.
- **Outline:** 36px tall (32px for presets), 1px `rule-strong` border, 12px/600 `ink-2`; hover turns border and text to ink.
- **Focus:** every control shows a 2px `focus` outline at 2px offset.

### Segmented Controls
Square groups inside a 1px `rule-strong` outline (2px ink for Buy / Sell). The selected segment inverts; Buy / Sell instead fill with `up-fill` / `down-fill` and white uppercase 14px/800 text. Order type uses underline tabs: a 3px ink underline on the active tab.

### Inputs / Fields
- **Style:** 44px tall (36px search), square, 1px `rule-strong` border on the ground, figures at 15px, unit suffix at 12px/600 `ink-3`.
- **Focus:** border turns ink and the caret is the focus colour.
- **Error:** border turns `down` and the status line explains in `down`.
- **Range:** a 4px rail filled with ink up to the value over `rule-strong`, and a round thumb with a 4px ink ring on the ground, like a station.

### Order Book
Three figure columns on 24px rows; depth drawn as signal washes from the right. The mid price sits between two 1px rules on a route-coloured tag in route ink. An 8px bid/ask share bar closes the panel in solid `up` / `down`.

### Navigation
On mobile a 56px band at the bottom with lucide icons (20px; 2.4 stroke when active, 1.8 otherwise) over 11px uppercase labels, the active item in `band-ink` with a top bar, inactive in `band-ink-2`. A round band-ink badge counts open positions and orders.

### Motion
- **Tick flash:** a changed price flashes its signal wash and fades to transparent over 900ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Ticker:** the strip scrolls linearly over 60s and pauses on hover.
- **Train:** the NOW train glides over 1200ms on the same curve; the fear and greed marker over 700ms ease-out.
- **Reduced motion:** under `prefers-reduced-motion: reduce` the ticker and tick flashes stop and every transition is cut to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** label every work area with a sign band: black, 1px white rule inset 4px from the top, uppercase 13px/700 label at 0.08em.
- **Do** give every asset its route colour and route ink from `lib/mockData.ts`, at full strength only on the selected market and `saturate(0.35)` at 0.8 opacity elsewhere.
- **Do** set every number in JetBrains Mono with tabular, slashed-zero numerals.
- **Do** use `up` / `down` for signal text, `up-fill` / `down-fill` behind white text, and `sel-up` / `sel-down` on inverted rows.
- **Do** mark selection by inversion and keyboard focus by the 2px focus-colour outline.
- **Do** keep corners square and separate panels with 1px rules.
- **Do** stop looping and flashing motion under reduced motion.

### Don't:
- **Don't** use #00933c or #ee352e for text; they fail 4.5:1 at the sizes this terminal uses.
- **Don't** set the dark band to #141414 on a #1c1c1c ground; the bands disappear.
- **Don't** use a route colour to mean up, down, success or warning, or a signal colour to identify a market.
- **Don't** add shadows, glows, gradients or rounded containers.
- **Don't** use proportional digits for any live value.
- **Don't** fall back to charcoal cards with a single yellow accent.
