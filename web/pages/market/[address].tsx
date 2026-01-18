import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { BinaryMarketAbi, ERC20Abi } from "../../src/abis";
import { COLLATERAL_ADDRESS } from "../../src/config";
import { formatUSDC, parseUSDC } from "../../src/units";
import { ConnectButton } from "../../src/components/ConnectButton";

export default function MarketPage() {
  const router = useRouter();
  const market = (router.query.address as string | undefined) as `0x${string}` | undefined;
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const [amt, setAmt] = useState("10");

  const enabled = Boolean(market) && market !== "0x0000000000000000000000000000000000000000";

  const { data: question } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "question",
    query: { enabled }
  });

  const { data: closeTime } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "closeTime",
    query: { enabled }
  });

  const { data: resolved } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "resolved",
    query: { enabled }
  });

  const { data: winningOutcome } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "winningOutcome",
    query: { enabled: enabled && Boolean(resolved) }
  });

  const { data: yesBal } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "yesBalance",
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(address) }
  });

  const { data: noBal } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "noBalance",
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(address) }
  });

  const { data: yesReserve } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "yesReserve",
    query: { enabled }
  });

  const { data: noReserve } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "noReserve",
    query: { enabled }
  });

  const { data: pYesE18 } = useReadContract({
    address: market,
    abi: BinaryMarketAbi,
    functionName: "getSpotPriceYesE18",
    query: { enabled }
  });

  const { data: usdcBal } = useReadContract({
    address: COLLATERAL_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && COLLATERAL_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: allowance } = useReadContract({
    address: COLLATERAL_ADDRESS,
    abi: ERC20Abi,
    functionName: "allowance",
    args: address && market ? [address, market] : undefined,
    query: { enabled: Boolean(address) && Boolean(market) && COLLATERAL_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  const amount = useMemo(() => parseUSDC(amt), [amt]);
  const needsApprove = (allowance as bigint | undefined) !== undefined ? (allowance as bigint) < amount : true;

  const closeStr = useMemo(() => {
    if (!closeTime) return "-";
    const d = new Date(Number(closeTime) * 1000);
    return d.toLocaleString();
  }, [closeTime]);

  return (
    <div style={page}>
      <header style={header}>
        <div>
          <Link href="/">← Back</Link>
          <h1 style={{ margin: "8px 0 0" }}>Market</h1>
          <div style={{ opacity: 0.8, marginTop: 6 }}>{question as string | undefined}</div>
        </div>
        <ConnectButton />
      </header>

      <section style={card}>
        <div style={mono}>Address: {market}</div>
        <div>Closes: <b>{closeStr}</b></div>
        <div>Resolved: <b>{String(resolved)}</b>{resolved ? ` (winner: ${Number(winningOutcome) === 1 ? "YES" : "NO"})` : ""}</div>
        <div style={{ marginTop: 10 }}>
          Spot price (YES): <b>{pYesE18 ? (Number(pYesE18) / 1e18).toFixed(3) : "-"}</b>
        </div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Pool reserves: YES {formatUSDC(yesReserve as bigint | undefined)} | NO {formatUSDC(noReserve as bigint | undefined)}
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Your balances</h2>
        {!isConnected ? (
          <div style={{ opacity: 0.8 }}>Connect your wallet.</div>
        ) : (
          <div>
            <div>mUSDC: <b>{formatUSDC(usdcBal as bigint | undefined)}</b></div>
            <div>YES shares: <b>{formatUSDC(yesBal as bigint | undefined)}</b></div>
            <div>NO shares: <b>{formatUSDC(noBal as bigint | undefined)}</b></div>
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={h2}>Trade</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label>
            Amount (mUSDC / shares)&nbsp;
            <input value={amt} onChange={(e) => setAmt(e.target.value)} style={input} />
          </label>
          {isConnected && needsApprove && !resolved ? (
            <button
              style={btn}
              disabled={isPending || !market}
              onClick={() =>
                writeContract({
                  address: COLLATERAL_ADDRESS,
                  abi: ERC20Abi,
                  functionName: "approve",
                  args: [market!, 1_000_000n * 10n ** 6n]
                })
              }
            >
              Approve mUSDC
            </button>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "buyYes",
                args: [amount, 0n]
              })
            }
          >
            Buy YES
          </button>

          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "buyNo",
                args: [amount, 0n]
              })
            }
          >
            Buy NO
          </button>

          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "split",
                args: [amount]
              })
            }
          >
            Split (mint YES+NO)
          </button>

          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "swapNoForYes",
                args: [amount, 0n]
              })
            }
          >
            Swap NO → YES
          </button>

          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "swapYesForNo",
                args: [amount, 0n]
              })
            }
          >
            Swap YES → NO
          </button>

          <button
            style={btn}
            disabled={isPending || !market || !isConnected || Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "merge",
                args: [amount]
              })
            }
          >
            Merge (burn YES+NO → mUSDC)
          </button>

          <button
            style={{ ...btn, borderColor: "#bbb" }}
            disabled={isPending || !market || !isConnected || !Boolean(resolved)}
            onClick={() =>
              writeContract({
                address: market!,
                abi: BinaryMarketAbi,
                functionName: "redeem"
              })
            }
          >
            Redeem winnings
          </button>
        </div>

        <div style={{ marginTop: 10, opacity: 0.8 }}>
          Tip: to cash out early, you generally need both YES and NO shares to <i>Merge</i>. You can use swaps to rebalance.
        </div>
      </section>
    </div>
  );
}

const page: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "24px 16px",
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 18
};

const card: CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 16,
  padding: 16,
  marginBottom: 14
};

const btn: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer"
};

const input: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  width: 140
};

const mono: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  overflowWrap: "anywhere",
  marginBottom: 8
};

const h2: CSSProperties = { margin: "0 0 10px" };
