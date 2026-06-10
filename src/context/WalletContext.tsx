"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { connectWallet, getWalletAddress } from "@/lib/wallet";

interface WalletContextType {
  address: string | null;
  role: string | null;
  isVerified: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWalletAddress().then((addr) => {
      if (addr) syncUser(addr);
      setLoading(false);
    });
  }, []);

  async function syncUser(addr: string) {
    setAddress(addr);
    const res = await fetch("/api/auth/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
    });
    if (res.ok) {
      const user = await res.json();
      setRole(user.role);
      setIsVerified(user.isVerified);
    }
  }

  async function connect() {
    const addr = await connectWallet();
    await syncUser(addr);
  }

  function disconnect() {
    setAddress(null);
    setRole(null);
    setIsVerified(false);
  }

  return (
    <WalletContext.Provider value={{ address, role, isVerified, connect, disconnect, loading }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
