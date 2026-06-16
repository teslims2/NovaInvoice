import type { Invoice } from "@/types/invoice";
import StatusBadge from "./StatusBadge";

interface Props {
  invoice: Invoice;
  onClick?: () => void;
}

export default function InvoiceCard({ invoice, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`flex items-start justify-between p-4 rounded-lg border bg-white ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    >
      <div className="space-y-1">
        <p className="font-bold text-gray-900">{invoice.debtorName}</p>
        <p className="text-xs text-gray-500">
          {invoice.description} · Due {new Date(invoice.dueDate).toLocaleDateString()}
        </p>
        <StatusBadge status={invoice.status} />
      </div>
      <p className="font-bold text-gray-900 whitespace-nowrap ml-4">
        {invoice.currency} {invoice.amount.toLocaleString()}
      </p>
    </div>
  );
}
