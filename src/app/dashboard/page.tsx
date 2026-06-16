"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import InvoiceCard from "@/components/InvoiceCard";
import type { Invoice } from "@/types/invoice";

export default function DashboardPage() {
  const { address, connect } = useWallet();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/invoices?address=${address}`)
      .then((r) => r.json())
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400">Connect your wallet to view your dashboard.</p>
        <button onClick={connect} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
          Connect Wallet
        </button>
      </div>
    );
  }

  const sum = (status: string) =>
    invoices.filter((i) => i.status === status).reduce((a, b) => a + b.amount, 0);

  const stats = [
    { label: "Outstanding", value: sum("PENDING"), color: "text-yellow-400" },
    { label: "Funded", value: sum("FUNDED"), color: "text-blue-400" },
    { label: "Repaid", value: sum("REPAID"), color: "text-green-400" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>
              {s.value.toLocaleString()} USDC
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Invoices</h2>
          <button
            onClick={() => router.push("/invoices/new")}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition"
          >
            + New Invoice
          </button>
        </div>
        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {!loading && invoices.length === 0 && (
          <p className="text-gray-500 text-sm">No invoices yet.</p>
        )}
        {invoices.map((inv) => (
          <InvoiceCard key={inv.id} invoice={inv} onClick={() => router.push(`/invoices/${inv.id}`)} />
        ))}
      </div>
    </div>
  );
}
