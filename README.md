## For Jakub Quick Start (local demo)

**Goal:** Run the demo locally and trade YES/NO in a prediction market.

### Prerequisites

* Node.js (recommended: v18+)
* npm installed

### Download the demo
'''
git clone https://github.com/GertPer/polymini.git
cd polymini 
'''

### Run the demo

**1) Start the local blockchain + deploy contracts**

```bash
cd contracts
npm install
npm run node
```

In a second terminal:

```bash
cd contracts
npm run deploy:local
```

**2) Start the web app in a third terminal**

```bash
cd web
npm install
cp .env.example .env.local
# Copy values from contracts/deployed.local.json into .env.local
npm run dev
```

Open:
[http://localhost:3000](http://localhost:3000)

### What you should see

* A list of markets
* A market view where you can buy YES/NO
* Ability to redeem after resolution (admin resolves outcomes)

