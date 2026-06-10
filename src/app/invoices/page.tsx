"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  debtorName: string;
  status: string;
  discountRate: number;
}

export default function InvoicesPage() {
  const { address } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState({
    amount: "",
    currency: "USDC",
    dueDate: "",
    description: "",
    debtorName: "",
    debtorAddress: "",
    discountRate: "5",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (address) fetchInvoices();
  }, [address]);

  async function fetchInvoices() {
    const res = await fetch(`/api/invoices?address=${address}`);
    if (res.ok) setInvoices(await res.json());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return alert("Connect your wallet first");
    setSubmitting(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, stellarAddress: address }),
    });
    if (res.ok) {
      setForm({ amount: "", currency: "USDC", dueDate: "", description: "", debtorName: "", debtorAddress: "", discountRate: "5" });
      fetchInvoices();
    }
    setSubmitting(false);
  }

  const statusColor: Record<string, string> = {
    PENDING: "text-yellow-400 bg-yellow-900",
    VERIFIED: "text-green-400 bg-green-900",
    FUNDED: "text-blue-400 bg-blue-900",
    TRADING: "text-purple-400 bg-purple-900",
    REPAID: "text-gray-400 bg-gray-800",
    DEFAULTED: "text-red-400 bg-red-900",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Invoice Issuance Portal</h1>

      <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 grid sm:grid-cols-2 gap-4">
        <h2 className="sm:col-span-2 text-lg font-semibold">Issue New Invoice</h2>
        {[
          { name: "debtorName", label: "Debtor Name", type: "text", required: true },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "dueDate", label: "Due Date", type: "date", required: true },
          { name: "discountRate", label: "Discount Rate (%)", type: "number" },
        ].map((f) => (
          <div key={f.name}>
            <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
            <input
              type={f.type}
              required={f.required}
              value={(form as any)[f.name]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea
            value={form.description}
            required
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition"
        >
          {submitting ? "Submitting..." : "Issue Invoice"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your Invoices</h2>
        {invoices.length === 0 && (
          <p className="text-gray-500 text-sm">No invoices yet. Issue your first invoice above.</p>
        )}
        {invoices.map((inv) => (
          <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{inv.debtorName}</p>
              <p className="text-sm text-gray-400">{inv.description} · Due {new Date(inv.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{inv.amount} {inv.currency}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[inv.status] || ""}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
