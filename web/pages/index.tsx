import type { CSSProperties } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "../src/components/ConnectButton";
import { APP_NAME, COLLATERAL_ADDRESS, FACTORY_ADDRESS } from "../src/config";
import { ERC20Abi, MarketFactoryAbi } from "../src/abis";
import { formatUSDC } from "../src/units";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const { data: count } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: MarketFactoryAbi,
    functionName: "marketCount",
    query: { enabled: FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: markets } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: MarketFactoryAbi,
    functionName: "getMarkets",
    args: [0n, 50n],
    query: { enabled: FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  const { data: usdcBal } = useReadContract({
    address: COLLATERAL_ADDRESS,
    abi: ERC20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && COLLATERAL_ADDRESS !== "0x0000000000000000000000000000000000000000" }
  });

  return (
    <div style={page}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>{APP_NAME}</h1>
          <div style={{ opacity: 0.7, marginTop: 6 }}>A tiny Polymarket-style prototype (testnet only).</div>
        </div>
        <ConnectButton />
      </header>

      <section style={card}>
        <h2 style={h2}>Setup</h2>
        <div style={mono}>Factory: {FACTORY_ADDRESS}</div>
        <div style={mono}>Collateral: {COLLATERAL_ADDRESS}</div>
        {!isConnected ? (
          <div style={{ marginTop: 12, opacity: 0.8 }}>Connect MetaMask to interact.</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div>mUSDC balance: <b>{formatUSDC(usdcBal as bigint | undefined)}</b></div>
            <button
              style={{ ...btn, marginTop: 10 }}
              disabled={isPending || COLLATERAL_ADDRESS === "0x0000000000000000000000000000000000000000"}
              onClick={() =>
                writeContract({
                  address: COLLATERAL_ADDRESS,
                  abi: ERC20Abi,
                  functionName: "faucet"
                })
              }
            >
              Faucet 1,000 mUSDC
            </button>
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <Link href="/admin">Go to Admin (create/resolve)</Link>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Markets</h2>
        <div style={{ opacity: 0.8, marginBottom: 10 }}>
          Total: {count ? Number(count) : 0} (showing up to 50)
        </div>
        <ul>
          {(markets as string[] | undefined)?.map((m) => (
            <li key={m} style={{ marginBottom: 8 }}>
              <Link href={`/market/${m}`}>{m}</Link>
            </li>
          ))}
        </ul>
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
  alignItems: "center",
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

const mono: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  overflowWrap: "anywhere",
  marginTop: 6
};

const h2: CSSProperties = { margin: "0 0 8px" };
