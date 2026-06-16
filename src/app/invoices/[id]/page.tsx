"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import StatusBadge from "@/components/StatusBadge";
import { signTx } from "@/lib/wallet";
import { networkPassphrase } from "@/lib/stellar";
import type { Invoice } from "@/types/invoice";

const EXPLORER = "https://stellar.expert/explorer/testnet";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useWallet();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInvoice() {
    const res = await fetch(`/api/invoices/${id}`);
    if (res.ok) setInvoice(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadInvoice(); }, [id]);

  async function callAction(endpoint: string) {
    if (!address || !invoice) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id, stellarAddress: address }),
      });
      const data = await res.json();
      if (data.xdr) {
        const signedXdr = await signTx(data.xdr, networkPassphrase);
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: invoice.id, stellarAddress: address, signedXdr }),
        });
      }
      await loadInvoice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <p className="text-gray-400 p-8">Loading…</p>;
  if (!invoice) return <p className="text-gray-400 p-8">Invoice not found.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice Details</h1>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {[
          { label: "Client", value: invoice.debtorName },
          { label: "Description", value: invoice.description },
          { label: "Amount", value: `${invoice.amount.toLocaleString()} ${invoice.currency}` },
          { label: "Due Date", value: new Date(invoice.dueDate).toLocaleDateString() },
          { label: "Created", value: new Date(invoice.createdAt).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}

        {invoice.txHash && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Transaction</span>
            <a
              href={`${EXPLORER}/tx/${invoice.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline font-mono text-xs"
            >
              {invoice.txHash.slice(0, 16)}…
            </a>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {address && invoice.status === "PENDING" && (
        <button
          onClick={() => callAction("/api/invoices/fund")}
          disabled={working}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition"
        >
          {working ? "Processing…" : "Get Funded (80% USDC)"}
        </button>
      )}

      {address && invoice.status === "FUNDED" && (
        <button
          onClick={() => callAction("/api/invoices/repay")}
          disabled={working}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl font-semibold transition"
        >
          {working ? "Processing…" : "Repay Invoice"}
        </button>
      )}
    </div>
  );
}
