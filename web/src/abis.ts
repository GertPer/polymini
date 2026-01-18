export const MarketFactoryAbi = [
  {
    "type": "function",
    "name": "marketCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getMarkets",
    "stateMutability": "view",
    "inputs": [
      { "name": "start", "type": "uint256" },
      { "name": "count", "type": "uint256" }
    ],
    "outputs": [{ "name": "slice", "type": "address[]" }]
  },
  {
    "type": "function",
    "name": "createMarket",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "question", "type": "string" },
      { "name": "closeTime", "type": "uint256" }
    ],
    "outputs": [{ "name": "market", "type": "address" }]
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      { "indexed": true, "name": "market", "type": "address" },
      { "indexed": false, "name": "question", "type": "string" },
      { "indexed": false, "name": "closeTime", "type": "uint256" }
    ]
  }
] as const;

export const BinaryMarketAbi = [
  {
    "type": "function",
    "name": "question",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }]
  },
  {
    "type": "function",
    "name": "closeTime",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "resolved",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "winningOutcome",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }]
  },
  {
    "type": "function",
    "name": "yesBalance",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "noBalance",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "yesReserve",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "noReserve",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getSpotPriceYesE18",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "getSpotPriceNoE18",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  { "type": "function", "name": "addLiquidity", "stateMutability": "nonpayable", "inputs": [{ "name": "collateralAmount", "type": "uint256" }], "outputs": [] },
  { "type": "function", "name": "split", "stateMutability": "nonpayable", "inputs": [{ "name": "collateralAmount", "type": "uint256" }], "outputs": [] },
  { "type": "function", "name": "merge", "stateMutability": "nonpayable", "inputs": [{ "name": "amountEach", "type": "uint256" }], "outputs": [] },
  { "type": "function", "name": "swapNoForYes", "stateMutability": "nonpayable", "inputs": [{ "name": "noIn", "type": "uint256" }, { "name": "minYesOut", "type": "uint256" }], "outputs": [{ "name": "yesOut", "type": "uint256" }] },
  { "type": "function", "name": "swapYesForNo", "stateMutability": "nonpayable", "inputs": [{ "name": "yesIn", "type": "uint256" }, { "name": "minNoOut", "type": "uint256" }], "outputs": [{ "name": "noOut", "type": "uint256" }] },
  { "type": "function", "name": "buyYes", "stateMutability": "nonpayable", "inputs": [{ "name": "collateralIn", "type": "uint256" }, { "name": "minTotalYesOut", "type": "uint256" }], "outputs": [{ "name": "totalYes", "type": "uint256" }] },
  { "type": "function", "name": "buyNo", "stateMutability": "nonpayable", "inputs": [{ "name": "collateralIn", "type": "uint256" }, { "name": "minTotalNoOut", "type": "uint256" }], "outputs": [{ "name": "totalNo", "type": "uint256" }] },
  { "type": "function", "name": "resolve", "stateMutability": "nonpayable", "inputs": [{ "name": "outcome", "type": "uint8" }], "outputs": [] },
  { "type": "function", "name": "redeem", "stateMutability": "nonpayable", "inputs": [], "outputs": [] }
  ,{ "type": "function", "name": "redeemPool", "stateMutability": "nonpayable", "inputs": [{"name":"to","type":"address"}], "outputs": [] }
] as const;

export const ERC20Abi = [
  { "type": "function", "name": "decimals", "stateMutability": "view", "inputs": [], "outputs": [{ "name": "", "type": "uint8" }] },
  { "type": "function", "name": "balanceOf", "stateMutability": "view", "inputs": [{ "name": "", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }] },
  { "type": "function", "name": "allowance", "stateMutability": "view", "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }] },
  { "type": "function", "name": "approve", "stateMutability": "nonpayable", "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }] },
  { "type": "function", "name": "faucet", "stateMutability": "nonpayable", "inputs": [], "outputs": [] }
] as const;
