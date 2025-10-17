'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AddBeneficiaryForm from './AddBeneficiaryForm';
import TransactionsPanel from './TransactionsPanel';
import TrustChart from './TrustChart';
import SummaryHeader from './SummaryHeader';
import BudgetProgress from './BudgetProgress';

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  status: string | null;
  created_at: string | null;
}

export default function TrustDashboard() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id, name, email, status, created_at')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      console.error('Beneficiaries fetch error:', error);
    } else {
      setBeneficiaries(data || []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Trust Dashboard</h1>
      <SummaryHeader />
      <BudgetProgress />

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Add New Beneficiary</h2>
        <AddBeneficiaryForm onAdded={loadData} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Beneficiaries</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : beneficiaries.length === 0 ? (
          <p className="text-gray-500">No beneficiaries yet.</p>
        ) : (
          <div className="grid gap-4">
            {beneficiaries.map((b) => (
              <div key={b.id} className="rounded-lg bg-white border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800">{b.name}</h3>
                <p className="text-gray-600 text-sm">{b.email}</p>
                <p className="text-gray-500 text-xs">
                  Status: {b.status ?? 'unknown'} — Added{' '}
                  {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Transactions</h2>
        <TransactionsPanel />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Distribution Trends</h2>
        <TrustChart />
      </section>
    </main>
  );
}
