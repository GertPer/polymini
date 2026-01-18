export const APP_NAME = "PolyMini";

// Local Hardhat defaults (change for testnet)
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

// Paste addresses from contracts/deployed.local.json
export const COLLATERAL_ADDRESS = (process.env.NEXT_PUBLIC_COLLATERAL_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
