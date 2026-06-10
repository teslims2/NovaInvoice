"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { buildPaymentTx, submitSignedTx } from "@/lib/stellar";
import { signTx } from "@/lib/wallet";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  debtorName: string;
  status: string;
  investments: { investor: { stellarAddress: string }; amount: number }[];
}

interface Repayment {
  id: string;
  amount: number;
  paidAt: string;
  status: string;
  txHash: string | null;
  invoice: { amount: number; currency: string; debtorName: string };
}

export default function RepaymentsPage() {
  const { address } = useWallet();
  const [fundedInvoices, setFundedInvoices] = useState<Invoice[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetch(`/api/invoices?address=${address}&status=FUNDED`)
        .then((r) => r.json())
        .then(setFundedInvoices);
    }
    fetch("/api/repayments")
      .then((r) => r.json())
      .then(setRepayments);
  }, [address]);

  async function repay(invoice: Invoice) {
    if (!address) return alert("Connect wallet first");
    setPaying(invoice.id);
    try {
      for (const inv of invoice.investments) {
        const xdr = await buildPaymentTx(
          address,
          inv.investor.stellarAddress,
          inv.amount.toString(),
          invoice.currency
        );
        const signed = await signTx(xdr, process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet");
        const result = await submitSignedTx(signed);

        await fetch("/api/repayments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: invoice.id, amount: inv.amount, txHash: result.hash }),
        });
      }
      setFundedInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
      fetch("/api/repayments").then((r) => r.json()).then(setRepayments);
    } catch (err: any) {
      alert(err.message);
    }
    setPaying(null);
  }

  const overdueClass = (dueDate: string) =>
    new Date(dueDate) < new Date() ? "border-red-800" : "border-gray-800";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Repayment Automation</h1>

      {fundedInvoices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pending Repayments</h2>
          <div className="space-y-3">
            {fundedInvoices.map((inv) => (
              <div key={inv.id} className={`bg-gray-900 border ${overdueClass(inv.dueDate)} rounded-xl p-4 flex items-center justify-between`}>
                <div>
                  <p className="font-medium">{inv.debtorName}</p>
                  <p className="text-sm text-gray-400">
                    Due {new Date(inv.dueDate).toLocaleDateString()} ·{" "}
                    {new Date(inv.dueDate) < new Date() && <span className="text-red-400">Overdue</span>}
                  </p>
                  <p className="text-xs text-gray-500">{inv.investments.length} investor(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{inv.amount} {inv.currency}</p>
                  <button
                    onClick={() => repay(inv)}
                    disabled={paying === inv.id}
                    className="mt-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm transition"
                  >
                    {paying === inv.id ? "Paying..." : "Repay Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Repayment History</h2>
      {repayments.length === 0 && <p className="text-gray-500 text-sm">No repayments recorded yet.</p>}
      <div className="space-y-2">
        {repayments.map((r) => (
          <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{r.invoice.debtorName}</p>
              <p className="text-xs text-gray-500">{new Date(r.paidAt).toLocaleString()}</p>
              {r.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${r.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline"
                >
                  View on Stellar Expert
                </a>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold">{r.amount} {r.invoice.currency}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "COMPLETED" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
