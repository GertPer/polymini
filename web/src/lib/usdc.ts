import { ethers } from "ethers";

export const USDC_DECIMALS = 6;

// String -> bigint (on-chain units)
export function parseUSDC(amount: string) {
  return ethers.parseUnits(amount || "0", USDC_DECIMALS);
}

// bigint -> string (human)
export function formatUSDC(value: bigint) {
  return ethers.formatUnits(value ?? 0n, USDC_DECIMALS);
}
