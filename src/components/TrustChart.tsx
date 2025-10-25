'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type Tx = { amount: number | null; type: 'distribution' | 'expense'; created_at: string };

function fmtMonth(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }); // e.g., Oct 25
}

function currency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function TrustChart() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('TrustChart fetch error:', error);
      } else {
        setRows((data ?? []) as Tx[]);
      }
      setLoading(false);
    })();
  }, []);

  const chartData = useMemo(() => {
    // build last 12 month buckets
    const buckets = new Map<string, { month: string; distributions: number; expenses: number }>();

    // seed 12 months so we always show a full year line
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${dt.getFullYear()}-${dt.getMonth()}`; // stable key
      buckets.set(k, { month: fmtMonth(dt), distributions: 0, expenses: 0 });
    }

    for (const r of rows) {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!buckets.has(key)) {
        buckets.set(key, { month: fmtMonth(d), distributions: 0, expenses: 0 });
      }
      const b = buckets.get(key)!;
      if (r.type === 'distribution') b.distributions += r.amount || 0;
      if (r.type === 'expense') b.expenses += r.amount || 0;
    }

    return Array.from(buckets.values());
  }, [rows]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading trust chart…</div>;
  }

  return (
    <section className="border rounded p-4">
      <h3 className="font-semibold mb-2">Distributions vs Expenses (last 12 months)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bars */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
              <Tooltip
                formatter={(value: any, name: string) =>
                  [currency(value as number), name === 'distributions' ? 'Distributions' : 'Expenses']
                }
              />
              <Legend />
              <Bar dataKey="distributions" name="Distributions" />
              <Bar dataKey="expenses" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line trend */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
              <Tooltip formatter={(v: any) => currency(v as number)} />
              <Legend />
              <Line type="monotone" dataKey="distributions" name="Distributions" dot={false} />
              <Line type="monotone" dataKey="expenses" name="Expenses" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
