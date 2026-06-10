import Link from "next/link";

const features = [
  { href: "/invoices", title: "Invoice Issuance", desc: "Tokenize unpaid invoices on Stellar and access instant working capital." },
  { href: "/marketplace", title: "Funding Marketplace", desc: "Investors fund verified invoices and earn yield on repayment." },
  { href: "/trading", title: "Discounted Trading", desc: "Trade invoices at a discount for immediate liquidity." },
  { href: "/repayments", title: "Repayment Automation", desc: "Automatic on-chain settlement via Soroban smart contracts." },
];

export default function Home() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-5xl font-bold text-white mb-4">
        Nova<span className="text-indigo-400">Invoice</span>
      </h1>
      <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
        Transform unpaid invoices into instant working capital using Stellar blockchain technology.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-600 transition"
          >
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
