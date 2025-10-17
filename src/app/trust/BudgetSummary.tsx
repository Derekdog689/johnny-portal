"use client";

export default function BudgetSummary({
  totalDistributed,
}: {
  totalDistributed: number;
}) {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5">
      <div className="text-sm text-gray-500 mb-2">Budget Summary</div>
      <div className="flex items-center justify-between">
        <span className="text-gray-700">Total Distributed</span>
        <span className="text-xl font-bold text-green-700">
          ${totalDistributed.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
