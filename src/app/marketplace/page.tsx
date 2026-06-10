"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { buildPaymentTx } from "@/lib/stellar";
import { signTx } from "@/lib/wallet";
import { submitSignedTx } from "@/lib/stellar";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  description: string;
  debtorName: string;
  discountRate: number;
  issuer: { stellarAddress: string; isVerified: boolean };
}

export default function MarketplacePage() {
  const { address } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [funding, setFunding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invoices?status=VERIFIED")
      .then((r) => r.json())
      .then(setInvoices);
  }, []);

  async function fund(invoice: Invoice) {
    if (!address) return alert("Connect wallet first");
    setFunding(invoice.id);
    try {
      const xdr = await buildPaymentTx(
        address,
        invoice.issuer.stellarAddress,
        invoice.amount.toString(),
        invoice.currency
      );
      const signed = await signTx(xdr, process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet");
      const result = await submitSignedTx(signed);

      await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          stellarAddress: address,
          amount: invoice.amount,
          txHash: result.hash,
        }),
      });

      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
    } catch (err: any) {
      alert(err.message);
    }
    setFunding(null);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Investor Funding Marketplace</h1>
      <p className="text-gray-400 text-sm mb-6">Fund verified invoices and earn yield on repayment.</p>

      {invoices.length === 0 && (
        <p className="text-gray-500 text-sm">No verified invoices available for funding.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {invoices.map((inv) => {
          const discounted = inv.amount * (1 - inv.discountRate / 100);
          const yield_ = ((inv.amount - discounted) / discounted * 100).toFixed(2);
          return (
            <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{inv.debtorName}</h3>
                  <p className="text-xs text-gray-400">{inv.description}</p>
                </div>
                {inv.issuer.isVerified && (
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Face Value</p>
                  <p className="font-bold">{inv.amount} {inv.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">You Pay</p>
                  <p className="font-bold text-indigo-400">{discounted.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Yield</p>
                  <p className="font-bold text-green-400">{yield_}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
              <button
                onClick={() => fund(inv)}
                disabled={funding === inv.id}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium transition"
              >
                {funding === inv.id ? "Processing..." : "Fund Invoice"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
