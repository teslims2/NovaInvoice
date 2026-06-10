"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { buildPaymentTx, submitSignedTx } from "@/lib/stellar";
import { signTx } from "@/lib/wallet";

interface Trade {
  id: string;
  price: number;
  discount: number;
  status: string;
  invoice: { amount: number; currency: string; dueDate: string; debtorName: string };
  seller: { stellarAddress: string };
}

interface FundedInvoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  debtorName: string;
}

export default function TradingPage() {
  const { address } = useWallet();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [myInvoices, setMyInvoices] = useState<FundedInvoice[]>([]);
  const [form, setForm] = useState({ invoiceId: "", discount: "10" });
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trades?status=OPEN").then((r) => r.json()).then(setTrades);
    if (address) {
      fetch(`/api/invoices?address=${address}&status=FUNDED`)
        .then((r) => r.json())
        .then(setMyInvoices);
    }
  }, [address]);

  async function listForTrade(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return alert("Connect wallet first");
    const inv = myInvoices.find((i) => i.id === form.invoiceId);
    if (!inv) return;
    const price = inv.amount * (1 - parseFloat(form.discount) / 100);
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: form.invoiceId, stellarAddress: address, price, discount: form.discount }),
    });
    setForm({ invoiceId: "", discount: "10" });
    fetch("/api/trades?status=OPEN").then((r) => r.json()).then(setTrades);
  }

  async function buy(trade: Trade) {
    if (!address) return alert("Connect wallet first");
    setBuying(trade.id);
    try {
      const xdr = await buildPaymentTx(
        address,
        trade.seller.stellarAddress,
        trade.price.toString(),
        trade.invoice.currency
      );
      const signed = await signTx(xdr, process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet");
      const result = await submitSignedTx(signed);
      await fetch("/api/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId: trade.id, txHash: result.hash }),
      });
      setTrades((prev) => prev.filter((t) => t.id !== trade.id));
    } catch (err: any) {
      alert(err.message);
    }
    setBuying(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Discounted Invoice Trading</h1>

      {myInvoices.length > 0 && (
        <form onSubmit={listForTrade} className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8 flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Select Invoice to Trade</label>
            <select
              value={form.invoiceId}
              onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Choose invoice...</option>
              {myInvoices.map((i) => (
                <option key={i.id} value={i.id}>{i.debtorName} – {i.amount} {i.currency}</option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className="text-xs text-gray-400 mb-1 block">Discount (%)</label>
            <input
              type="number" min="1" max="50"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">
            List for Trade
          </button>
        </form>
      )}

      <h2 className="text-lg font-semibold mb-3">Open Trades</h2>
      {trades.length === 0 && <p className="text-gray-500 text-sm">No open trades available.</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {trades.map((t) => (
          <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold mb-1">{t.invoice.debtorName}</h3>
            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div><p className="text-xs text-gray-500">Face Value</p><p className="font-bold">{t.invoice.amount}</p></div>
              <div><p className="text-xs text-gray-500">Trade Price</p><p className="font-bold text-purple-400">{t.price.toFixed(2)}</p></div>
              <div><p className="text-xs text-gray-500">Discount</p><p className="font-bold text-green-400">{t.discount}%</p></div>
            </div>
            <p className="text-xs text-gray-500 mb-3">Due: {new Date(t.invoice.dueDate).toLocaleDateString()}</p>
            <button
              onClick={() => buy(t)}
              disabled={buying === t.id || t.seller.stellarAddress === address}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-lg text-sm font-medium"
            >
              {buying === t.id ? "Processing..." : t.seller.stellarAddress === address ? "Your Listing" : "Buy Invoice"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
