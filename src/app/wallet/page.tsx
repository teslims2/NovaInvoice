"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { getUSDCBalance } from "@/lib/contract";

const EXPLORER = "https://stellar.expert/explorer/testnet";

export default function WalletPage() {
  const { address, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    getUSDCBalance(address).then(setBalance).catch(() => setBalance("0.00"));
  }, [address]);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400">Connect your Freighter wallet to continue.</p>
        <button onClick={connect} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Public Key</p>
          <p className="font-mono text-sm break-all">{address}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">USDC Balance</p>
          <p className="text-2xl font-bold text-blue-400">
            {balance === null ? "Loading…" : `${balance} USDC`}
          </p>
        </div>

        <a
          href={`${EXPLORER}/account/${address}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-indigo-400 hover:underline text-sm"
        >
          View on Stellar Expert →
        </a>
      </div>

      <button
        onClick={disconnect}
        className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
      >
        Disconnect
      </button>
    </div>
  );
}
