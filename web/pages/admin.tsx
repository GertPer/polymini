import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { APP_NAME, FACTORY_ADDRESS, COLLATERAL_ADDRESS } from "../src/config";
import { MarketFactoryAbi, BinaryMarketAbi, ERC20Abi } from "../src/abis";
import { ConnectButton } from "../src/components/ConnectButton";
import { parseUSDC } from "../src/units";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const [question, setQuestion] = useState("Will ETH be above $10k on 2026-01-01? (DEMO)");
  const [minutes, setMinutes] = useState("60");
  const [marketAddr, setMarketAddr] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000");
  const [liq, setLiq] = useState("100");

  const { data: markets } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: MarketFactoryAbi,
    functionName: "getMarkets",
    args: [0n, 50n],
    query: { enabled: FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  const closeTime = useMemo(() => {
    const m = Number(minutes || "0");
    return BigInt(Math.floor(Date.now() / 1000) + m * 60);
  }, [minutes]);

  const liqAmount = useMemo(() => parseUSDC(liq), [liq]);

  return (
    <div style={page}>
      <header style={header}>
        <div>
          <Link href="/">← Back</Link>
          <h1 style={{ margin: "8px 0 0" }}>{APP_NAME} Admin</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Create markets, add liquidity, resolve (owner only).
          </div>
        </div>
        <ConnectButton />
      </header>

      <section style={card}>
        <h2 style={h2}>Create market</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            Question
            <input value={question} onChange={(e) => setQuestion(e.target.value)} style={inputWide} />
          </label>
          <label>
            Closes in (minutes)
            <input value={minutes} onChange={(e) => setMinutes(e.target.value)} style={input} />
          </label>
          <button
            style={btn}
            disabled={!isConnected || isPending || FACTORY_ADDRESS === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: FACTORY_ADDRESS,
                abi: MarketFactoryAbi,
                functionName: "createMarket",
                args: [question, closeTime]
              })
            }
          >
            Create (owner only)
          </button>
          <div style={{ opacity: 0.75 }}>
            Note: the factory owner is whoever deployed it (Hardhat account #0 by default).
          </div>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Pick market</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <label>
            Market address
            <input value={marketAddr} onChange={(e) => setMarketAddr(e.target.value as any)} style={inputWide} />
          </label>
          <div style={{ opacity: 0.85 }}>
            Or click one from list:
            <ul>
              {(markets as string[] | undefined)?.map((m) => (
                <li key={m}>
                  <button style={linkBtn} onClick={() => setMarketAddr(m as `0x${string}`)}>
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Liquidity</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Add liquidity (mUSDC)
            <input value={liq} onChange={(e) => setLiq(e.target.value)} style={input} />
          </label>
          <button
            style={btn}
            disabled={!isConnected || isPending || marketAddr === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: COLLATERAL_ADDRESS,
                abi: ERC20Abi,
                functionName: "approve",
                args: [marketAddr, 1_000_000n * 10n ** 6n]
              })
            }
          >
            Approve
          </button>
          <button
            style={btn}
            disabled={!isConnected || isPending || marketAddr === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: marketAddr,
                abi: BinaryMarketAbi,
                functionName: "addLiquidity",
                args: [liqAmount]
              })
            }
          >
            Add liquidity
          </button>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Resolve</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={btn}
            disabled={!isConnected || isPending || marketAddr === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: marketAddr,
                abi: BinaryMarketAbi,
                functionName: "resolve",
                args: [1]
              })
            }
          >
            Resolve YES (owner)
          </button>
          <button
            style={btn}
            disabled={!isConnected || isPending || marketAddr === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: marketAddr,
                abi: BinaryMarketAbi,
                functionName: "resolve",
                args: [0]
              })
            }
          >
            Resolve NO (owner)
          </button>

          <button
            style={{ ...btn, borderColor: "#bbb" }}
            disabled={!isConnected || isPending || marketAddr === "0x0000000000000000000000000000000000000000"}
            onClick={() =>
              writeContract({
                address: marketAddr,
                abi: BinaryMarketAbi,
                functionName: "redeemPool",
                args: [address as `0x${string}`]
              })
            }
          >
            Redeem pool to me (owner)
          </button>
        </div>
      </section>

      <div style={{ opacity: 0.7, marginTop: 8 }}>
        Safety: This is a classroom prototype intended for testnets / play money only.
      </div>
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

const linkBtn: CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  color: "#0366d6",
  cursor: "pointer",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12
};

const input: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  width: 140
};

const inputWide: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  width: "100%"
};

const h2: CSSProperties = { margin: "0 0 10px" };
