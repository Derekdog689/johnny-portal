'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];

export default function SummaryHeader() {
  const [summary, setSummary] = useState({
    totalDistributed: 0,
    average: 0,
    count: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type');

      if (error) {
        console.error('Summary fetch error:', error);
        return;
      }

      const typedData = (data as TransactionRow[]) ?? [];
      const distributions = typedData.filter((t) => t.type === 'distribution');
      const total = distributions.reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const avg = distributions.length ? total / distributions.length : 0;

      setSummary({
        totalDistributed: total,
        average: avg,
        count: distributions.length,
      });
    }

    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500">Total Distributed</p>
        <p className="text-2xl font-bold text-green-600">
          ${summary.totalDistributed.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500">Average Distribution</p>
        <p className="text-2xl font-bold text-blue-600">
          ${summary.average.toFixed(2)}
        </p>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500">Transactions Count</p>
        <p className="text-2xl font-bold text-gray-800">{summary.count}</p>
      </div>
    </div>
  );
}
