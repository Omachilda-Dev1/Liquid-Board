# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Active, experienced traders who already live in pro trading screens (exchange terminals, charting platforms). They expect dense, fast-scanning screens, live numbers that update without fuss, and order entry that works in a few keystrokes. They use LIQUID BOARD to paper-trade crypto and equities without risking capital.

## Product Purpose

LIQUID BOARD is a paper-trading terminal. It starts the trader with a simulated $50,000 USD balance and streams simulated live prices for nine assets (BTC, ETH, SOL, AVAX, LINK, UNI, AAPL, NVDA, TSLA). Success: a trader can pick a market, read the chart and book, place an order and watch the P&L move, all on one screen, with the confidence of a real terminal.

## Positioning

A mixed crypto + equities book in one terminal, with no account, no wallet, and nothing at risk. All market data is simulated in the browser.

## Operating Context

Long desktop sessions on wide monitors, often in a dim room; quick checks on a phone. Workflow loop: scan markets, select asset, read chart / order book / 24h stats, enter order (market, limit, stop; % of balance presets; leverage 1-20x), monitor positions and P&L, close positions, review trade history. Side readings: fear & greed index, ETH gas.

## Capabilities and Constraints

- Next.js 14 App Router, TypeScript, Tailwind, Recharts; deployed on Vercel. Client-only simulation (no backend).
- Prices tick every 1.5s; order book refreshes every 2s; gas every 5s; sentiment every 8s.
- Market orders fill at the live simulated price. Limit and stop orders rest until the price reaches their trigger, then fill at the live price; they can be cancelled.
- Leverage (1-20x) borrows against margin: margin = size / leverage, the debt is repaid pro rata on every sale, and a position is liquidated when its margin is exhausted. Sell only reduces long positions (no shorts).
- The paper account (cash, positions, orders, history) persists in localStorage and can be reset to $50,000.
- Keyboard shortcuts: B / S switch side, 1-9 select a market. Clicking an order book price prefills a limit price.
- Dark and light themes, persisted to localStorage.
- Responsive: desktop multi-panel, tablet, and mobile layouts.

## Brand Commitments

- The name LIQUID BOARD stays.

## Evidence on Hand

- All prices, volumes, market caps, order book depth, gas and sentiment values are synthetic. No real users, testimonials, or exchange integrations exist; none may be claimed.

## Product Principles

1. Numbers first: the live figure is always the most legible thing on screen.
2. One screen, whole loop: scan, read, trade and monitor without navigation on desktop.
3. Honest simulation: never imply real money, real connectivity, or real data.
4. Speed over ceremony: order entry is a few clicks, with immediate visible feedback.
