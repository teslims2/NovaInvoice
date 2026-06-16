"use client";

import { useWallet } from "@/context/WalletContext";

interface Props {
  balance?: string;
}

export default function WalletConnect({ balance }: Props) {
  const { address, connect, disconnect, loading } = useWallet();

  if (loading) return null;

  if (!address) {
    return (
      <button
        onClick={connect}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-mono text-gray-800">{truncated}</p>
        {balance && <p className="text-xs text-gray-500">{balance} USDC</p>}
      </div>
      <button
        onClick={disconnect}
        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
