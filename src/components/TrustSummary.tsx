'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TrustChart from './TrustChart';


export default function TrustSummary() {
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [cap, setCap] = useState(80000); // adjust later if needed
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type');

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      const distributions = (data ?? []).filter((t: any) => t.type === 'distribution');
      const totalAmount = distributions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      setTotal(totalAmount);
      setAverage(distributions.length > 0 ? totalAmount / distributions.length : 0);
      setCount(distributions.length);
    })();
  }, []);

  const remaining = cap - total;
  const percent = Math.min((total / cap) * 100, 100);

  async function handleExport() {
    try {
      setExporting(true);
      const res = await fetch('/api/trust/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trust_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Trust Dashboard Summary</h2>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {exporting ? 'Generating…' : 'Export Trust PDF'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 border rounded text-center bg-white">
          <p className="text-sm text-gray-500">Total Distributed</p>
          <p className="text-xl font-bold text-green-600">
            ${total.toLocaleString()}
          </p>
        </div>
        <div className="p-4 border rounded text-center bg-white">
          <p className="text-sm text-gray-500">Average Distribution</p>
          <p className="text-xl font-bold text-blue-600">
            ${average.toFixed(2)}
          </p>
        </div>
        <div className="p-4 border rounded text-center bg-white">
          <p className="text-sm text-gray-500">Transactions Count</p>
          <p className="text-xl font-bold text-indigo-600">{count}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border rounded p-4 bg-white mb-6">
        <p className="text-sm text-gray-500 mb-2">
          Budget Progress — Cap: ${cap.toLocaleString()}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Distributed: ${total.toLocaleString()} | Remaining: ${remaining.toLocaleString()}
        </p>
      </div>

      {/* New: Visuals */}
      <TrustChart />
    </section>
  );
}
