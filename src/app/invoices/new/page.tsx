"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { signTx } from "@/lib/wallet";
import { networkPassphrase } from "@/lib/stellar";

export default function NewInvoicePage() {
  const { address, connect } = useWallet();
  const router = useRouter();
  const [form, setForm] = useState({ debtorName: "", amount: "", dueDate: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, currency: "USDC", stellarAddress: address, discountRate: 0 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const invoice = await res.json();

      if (process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID) {
        const xdrRes = await fetch("/api/invoices/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: invoice.id, stellarAddress: address }),
        });
        if (xdrRes.ok) {
          const { xdr } = await xdrRes.json();
          if (xdr) {
            const signedXdr = await signTx(xdr, networkPassphrase);
            await fetch("/api/invoices/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ invoiceId: invoice.id, signedXdr, stellarAddress: address }),
            });
          }
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400">Connect your wallet to create an invoice.</p>
        <button onClick={connect} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
          Connect Wallet
        </button>
      </div>
    );
  }

  const fields = [
    { name: "debtorName", label: "Client Name", type: "text" },
    { name: "amount", label: "Invoice Amount (USDC)", type: "number" },
    { name: "dueDate", label: "Due Date", type: "date" },
  ] as const;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Invoice</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
            <input
              type={f.type}
              required
              value={form[f.name]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Description</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition"
        >
          {submitting ? "Submitting…" : "Submit Invoice"}
        </button>
      </form>
    </div>
  );
}
