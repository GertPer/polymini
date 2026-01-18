# PolyMini – a Polymarket-style prototype (university/demo)

This repo is a **minimal classroom prototype** inspired by prediction markets.

- **No real money**: intended for **local Hardhat** or a testnet with a mock token.
- **Not audited**: do not use in production.

## What you get
- `contracts/` – Hardhat project
  - `MockUSDC.sol` faucet token
  - `BinaryMarket.sol` (YES/NO shares + constant-product AMM)
  - `MarketFactory.sol` (deploy & list markets for the UI)
- `web/` – Next.js UI
  - List markets, view a market, trade YES/NO, redeem
  - Admin page to create markets and resolve outcomes

## Quick start (local)

### 1) Contracts
```bash
cd contracts
npm i
npm run node
```
In another terminal:
```bash
cd contracts
npm run deploy:local
```
This writes `contracts/deployed.local.json` with addresses.

### 2) Web UI
Copy addresses into env vars:
```bash
cd web
npm i
cp .env.example .env.local
# edit .env.local with values from contracts/deployed.local.json
npm run dev
```
Open http://localhost:3000

## Notes
- The AMM is intentionally simple. Shares are *internal balances* (not ERC20) to keep the prototype small.
- Resolution is **admin-based** for demo. For a stronger project, replace it with an oracle (e.g., optimistic oracle) and add dispute flow.
