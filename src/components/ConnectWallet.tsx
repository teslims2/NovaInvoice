"use client";

import { useWallet } from "@/context/WalletContext";

export default function ConnectWallet() {
  const { address, connect, disconnect, loading, role, isVerified } = useWallet();

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>;

  if (!address) {
    return (
      <button
        onClick={connect}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isVerified && (
        <span className="px-2 py-0.5 bg-green-900 text-green-400 text-xs rounded-full">Verified</span>
      )}
      <span className="text-xs text-gray-400 font-mono">
        {role} · {address.slice(0, 6)}…{address.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition"
      >
        Disconnect
      </button>
    </div>
  );
}
