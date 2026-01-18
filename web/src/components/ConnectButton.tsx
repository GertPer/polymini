import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  // IMPORTANT: make server HTML == first client render
  const connected = mounted && isConnected;

  if (!connected) {
    const injected = connectors[0];
    return (
      <div>
        <button
          onClick={() => connect({ connector: injected })}
          style={btnStyle}
          disabled={!mounted || isPending}
        >
          Connect Wallet
        </button>
        {mounted && error ? <div style={{ color: "crimson", marginTop: 8 }}>{error.message}</div> : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <code style={{ fontSize: 12 }}>{address}</code>
      <button onClick={() => disconnect()} style={btnStyle}>
        Disconnect
      </button>
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer"
};
