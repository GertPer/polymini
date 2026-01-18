## For Jakub Quick Start (local demo)

**Goal:** Run the demo locally and trade YES/NO in a prediction market.

### Prerequisites
- Node.js (recommended: v18+)
- npm installed
- Git installed

---

## 0) Download PolyMini

```bash
git clone https://github.com/GertPer/polymini.git
cd polymini
```

---

## 1) Start the local blockchain + deploy contracts

### Terminal 1 (keep running)

```bash
cd contracts
npm install
npm run node
```

### Terminal 2 (deploy)

```bash
cd contracts
npm run deploy:local
```

After deploying, the terminal will print the deployed **Factory** and **Collateral (MockUSDC)** addresses and also write them to:

`contracts/deployed.local.json`

---

## 2) Start the web app (Terminal 3)

```bash
cd web
npm install

# Auto-generate web/.env.local from contracts/deployed.local.json
node -e "const d=require('../contracts/deployed.local.json'); const fs=require('fs'); if(!d.Factory||!d.MockUSDC) throw new Error('Missing Factory/MockUSDC in deployed.local.json'); fs.writeFileSync('.env.local', `NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545\nNEXT_PUBLIC_FACTORY_ADDRESS=${d.Factory}\nNEXT_PUBLIC_COLLATERAL_ADDRESS=${d.MockUSDC}\n`); console.log('Wrote web/.env.local');"

# Start the web app
rm -rf .next
npm run dev
```

Open: http://localhost:3000

---

### What you should see
- A list of markets
- A market view where you can buy YES/NO
- Ability to redeem after resolution (admin resolves outcomes)

---

### Troubleshooting
- If the UI shows `Factory: 0x0000...` or buttons don’t work: rerun the env sync command above and restart `npm run dev`.
- If Admin buttons are disabled: make sure MetaMask is on **Localhost 8545 (Chain ID 31337)** and connect/import **Hardhat Account #0** shown in Terminal 1.
