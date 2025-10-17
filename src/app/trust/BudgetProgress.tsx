'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type TrustSettingsRow = Database['public']['Tables']['trust_settings']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

interface BudgetSummary {
  totalDistributed: number;
  budgetCap: number;
  percentage: number;
  remaining: number;
}

export default function BudgetProgress() {
  const [summary, setSummary] = useState<BudgetSummary>({
    totalDistributed: 0,
    budgetCap: 0,
    percentage: 0,
    remaining: 0,
  });

  const [editing, setEditing] = useState(false);
  const [newCap, setNewCap] = useState<number | ''>('');

  useEffect(() => {
    async function fetchBudgetProgress() {
      const [{ data: settings }, { data: transactions }] = await Promise.all([
        supabase.from('trust_settings').select('budget_cap').single(),
        supabase.from('transactions').select('amount, type'),
      ]);

      if (!settings || !transactions) return;

      const distributions = (transactions as TransactionRow[]).filter(
        (t) => t.type === 'distribution'
      );

      const totalDistributed = distributions.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

      const percentage = Math.min(
        (totalDistributed / settings.budget_cap) * 100,
        100
      );

      setSummary({
        totalDistributed,
        budgetCap: settings.budget_cap,
        percentage,
        remaining: settings.budget_cap - totalDistributed,
      });
    }

    fetchBudgetProgress();
  }, []);

  const handleUpdateCap = async () => {
    if (typeof newCap !== 'number' || newCap <= 0) return;

    const { error } = await supabase
      .from('trust_settings')
      .update({
        budget_cap: newCap,
        updated_at: new Date().toISOString(),
      })
      .neq('budget_cap', newCap);

    if (error) {
      console.error('Cap update error:', error);
    } else {
      setSummary((s) => ({
        ...s,
        budgetCap: newCap,
        percentage: Math.min((s.totalDistributed / newCap) * 100, 100),
        remaining: newCap - s.totalDistributed,
      }));
      setEditing(false);
      setNewCap('');
    }
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Budget Progress
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span>Total Distributed</span>
          <span>${summary.totalDistributed.toLocaleString()}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${summary.percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>0%</span>
          <span>{summary.percentage.toFixed(1)}%</span>
          <span>100%</span>
        </div>

        <div className="mt-4 flex justify-between items-center">
          {editing ? (
            <div className="flex gap-2">
              <input
                type="number"
                className="border rounded-md px-2 py-1 w-28 text-sm"
                placeholder="New Cap"
                value={newCap}
                onChange={(e) => setNewCap(Number(e.target.value))}
              />
              <button
                onClick={handleUpdateCap}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Cap: ${summary.budgetCap.toLocaleString()} | Remaining:{' '}
                <span className="font-semibold text-green-700">
                  ${summary.remaining.toLocaleString()}
                </span>
              </p>
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 text-xs hover:underline"
              >
                Edit Cap
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
