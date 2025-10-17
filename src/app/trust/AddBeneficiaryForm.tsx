'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import type { TablesInsert } from '@/types/supabase';

type BeneficiaryInsert = TablesInsert<'beneficiaries'>;

interface AddBeneficiaryFormProps {
  onAdded: () => void;
}

export default function AddBeneficiaryForm({ onAdded }: AddBeneficiaryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Both fields are required');
      return;
    }

    setBusy(true);

    const payload: BeneficiaryInsert = {
      name,
      email,
      status: 'active',
    };

    const { error } = await supabase.from('beneficiaries').insert([payload]);

    setBusy(false);

    if (error) {
      console.error('Insert error:', error);
      toast.error('Failed to add beneficiary');
    } else {
      toast.success('Beneficiary added successfully');
      setName('');
      setEmail('');
      onAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
