'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: string | null;
  created_at: string | null;
}

export default function TrustChart() {
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, type, created_at')
        .order('created_at', { ascending: true });

      if (error) console.error('Chart fetch error:', error);
      else setData(data ?? []);
    }

    fetchData();
  }, []);

  const distributionData = data
    .filter((d) => d.type === 'distribution')
    .map((d) => ({
      date: d.created_at ? new Date(d.created_at).toLocaleDateString() : '—',
      amount: d.amount,
    }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-md font-semibold text-gray-800 mb-4">Distribution Trends</h2>
      {distributionData.length === 0 ? (
        <p className="text-gray-500 text-sm">No distribution data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
