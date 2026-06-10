"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  description: string;
  debtorName: string;
  status: string;
  createdAt: string;
  issuer: { stellarAddress: string; isVerified: boolean };
}

interface User {
  id: string;
  stellarAddress: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count: { invoices: number };
}

export default function AdminPage() {
  const { role } = useWallet();
  const [tab, setTab] = useState<"invoices" | "users">("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== "ADMIN") return;
    load();
  }, [role, tab]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin?type=${tab}`);
    if (res.ok) {
      const data = await res.json();
      tab === "invoices" ? setInvoices(data) : setUsers(data);
    }
    setLoading(false);
  }

  async function action(type: "invoice" | "user", id: string, act: "verify" | "reject") {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, action: act }),
    });
    load();
  }

  if (role !== "ADMIN") {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">You need ADMIN role to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Verification Dashboard</h1>

      <div className="flex gap-2 mb-6">
        {(["invoices", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? "bg-indigo-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}

      {tab === "invoices" && !loading && (
        <div className="space-y-3">
          {invoices.length === 0 && <p className="text-gray-500 text-sm">No pending invoices.</p>}
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{inv.debtorName}</p>
                <p className="text-sm text-gray-400">{inv.description}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{inv.issuer.stellarAddress.slice(0, 12)}…</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold">{inv.amount} {inv.currency}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => action("invoice", inv.id, "verify")}
                    className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-xs"
                  >Verify</button>
                  <button
                    onClick={() => action("invoice", inv.id, "reject")}
                    className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
                  >Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && !loading && (
        <div className="space-y-3">
          {users.length === 0 && <p className="text-gray-500 text-sm">No users found.</p>}
          {users.map((u) => (
            <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">{u.stellarAddress.slice(0, 16)}…{u.stellarAddress.slice(-4)}</p>
                <p className="text-xs text-gray-400">{u.role} · {u._count.invoices} invoice(s)</p>
              </div>
              <div className="flex items-center gap-3">
                {u.isVerified && (
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Verified</span>
                )}
                <button
                  onClick={() => action("user", u.id, u.isVerified ? "reject" : "verify")}
                  className={`px-3 py-1 rounded text-xs ${
                    u.isVerified
                      ? "bg-red-800 hover:bg-red-700"
                      : "bg-green-700 hover:bg-green-600"
                  }`}
                >
                  {u.isVerified ? "Revoke" : "Verify"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
