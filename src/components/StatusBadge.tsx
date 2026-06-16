const colors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-green-100 text-green-800",
  FUNDED: "bg-blue-100 text-blue-800",
  TRADING: "bg-purple-100 text-purple-800",
  REPAID: "bg-gray-100 text-gray-800",
  DEFAULTED: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}
