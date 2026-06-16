"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/context/WalletContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices/new", label: "New Invoice" },
  { href: "/invoices", label: "Invoices" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/trading", label: "Trading" },
  { href: "/repayments", label: "Repayments" },
  { href: "/wallet", label: "Wallet" },
  { href: "/admin", label: "Admin" },
];

export default function Nav() {
  const pathname = usePathname();
  const { role } = useWallet();

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-indigo-400 font-bold text-lg">NovaInvoice</Link>
          {links
            .filter((l) => l.href !== "/admin" || role === "ADMIN")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition ${
                  pathname.startsWith(l.href)
                    ? "text-white font-medium"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {l.label}
              </Link>
            ))}
        </div>
        <ConnectWallet />
      </div>
    </nav>
  );
}
