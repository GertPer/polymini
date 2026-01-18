import { formatUnits, parseUnits } from "viem";

export const USDC_DECIMALS = 6;

export function formatUSDC(amount?: bigint) {
  if (amount === undefined) return "-";
  return formatUnits(amount, USDC_DECIMALS);
}

export function parseUSDC(input: string): bigint {
  const v = input.trim();
  if (!v) return 0n;
  return parseUnits(v as `${number}`, USDC_DECIMALS);
}
