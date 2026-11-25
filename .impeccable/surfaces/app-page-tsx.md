---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface: trading terminal (app/page.tsx)

Mode: Operate. Audience: active traders paper-trading crypto + equities. Job: scan markets, read chart/book/range, place orders, monitor P&L, close positions. Must preserve every incumbent function (9 assets, 6 timeframes, order book, market/limit/stop, % presets, leverage, positions + close, history, market stats, fear & greed, gas, ticker, dark/light persisted, desktop/tablet/mobile).

## Direction contract

THESIS: Every market is a route. The terminal borrows the 1970 subway signage system: black sign bands label every work area, each asset rides under its own round route bullet, and price is read as a position on a line. It refuses the exchange default of charcoal cards with one yellow accent and glow.

OWN-WORLD: Sign black #141414 bands with a 1px white rule inset at the top; white #fafafa ground in light, #1c1c1c in dark (scene: long desk sessions under dim light, so dark is default). Route colours per asset (orange, blue, purple, grey, cyan, magenta, slate, brown, yellow), full strength only on the selected market. Signal green #00933c / red #ee352e for up/down only. Archivo grotesk for UI in caps for band labels, JetBrains Mono tabular figures for prices. Square corners, 1px rules, no shadows, no glow.

STORY: The trader sees which market is live, its price and route, where price sits in the day, and places an order in two clicks; P&L updates in the header band.

FIRST VIEWPORT (amended after finish review, so the whole book fits at 1440x900): Desktop 1440: 56px black header band (wordmark, equity, P&L, cash, SIMULATED + clock, reset, theme), ticker strip. Left 260px markets rail of bullet rows, selected row inverted. Centre: pair header with 44px bullet and 40px price plus 24h stats; below it a split row of [timeframe tabs, chart, 24H ROUTE station strip] beside a 280px order book that fills the row height around a route-coloured mid; then positions / open orders / history tabs. Right 340px: order ticket (buy/sell segmented, type, amount, presets, leverage, cost, submit) above the account panel (equity, fear & greed, gas). Primary action: the ticket's submit, right column.

FORM: Transit Signage, candidate 6 of 7 on the ordered list, seed:6ea8e700758e7591. Signature move: the 24H ROUTE, a station line (Low, Open, Your entry, Now, High) with the live price as a moving train bullet. Raises: colour coded and earned (Catalog Sleeve); one panel owns the phone screen (Vertical Feed); one geometry carries range, entry and live price (Guide Map).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
