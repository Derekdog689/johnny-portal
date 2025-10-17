'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Transaction {
  id: string;
  amount: number;
  type: string | null;
  created_at: string | null;
}

export default function TransactionsPanel() {
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadTransactions() {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, type, created_at')
        .order('created_at', { ascending: false });

      if (error) console.error('Transactions fetch error:', error);
      else setTxs(data ?? []);
    }

    loadTransactions();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {txs.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions recorded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {txs.map((t) => (
            <li key={t.id} className="py-2 flex justify-between text-sm">
              <span>{t.type ?? '—'}</span>
              <span>${t.amount.toLocaleString()}</span>
              <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
