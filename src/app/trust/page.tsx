'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import TrustSummary from '@/components/TrustSummary'
import TransactionForm from '@/components/TransactionForm'
import TrustCharts from '@/components/TrustChart'

// ===========================================================
//  MAIN COMPONENT: TrustDashboard
// ===========================================================
export default function TrustDashboard() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // ===========================================================
  //  STEP 1: Shared fetchData() – used for initial load + refresh
  // ===========================================================
  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: benData, error: benError } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('added_by', user.id)
      .order('created_at', { ascending: false })

    const { data: trxData, error: trxError } = await supabase
      .from('transactions')
      .select('*')
      .eq('added_by', user.id)
      .order('created_at', { ascending: false })

    if (benError) console.error('Beneficiaries error:', benError.message)
    if (trxError) console.error('Transactions error:', trxError.message)

    setBeneficiaries(benData || [])
    setTransactions(trxData || [])
  }

  // ===========================================================
  //  STEP 2: Fetch data on mount
  // ===========================================================
  useEffect(() => {
    fetchData()
  }, [])

  // ===========================================================
  //  STEP 3: Enable realtime updates for beneficiaries & transactions
  // ===========================================================
  useEffect(() => {
    const channel = supabase
      .channel('trust-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beneficiaries' },
        (payload) => {
          console.log('Realtime: Beneficiary change', payload)
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Realtime: Transaction change', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ===========================================================
  //  STEP 4: Handle Add Beneficiary Form
  // ===========================================================
  const handleAddBeneficiary = async (e: any) => {
    e.preventDefault()
    if (!fullName || !email) return alert('All fields required')
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be signed in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('beneficiaries').insert({
      full_name: fullName,
      email: email,
      status: 'active',
      added_by: user.id,
    })

    if (error) alert('Error: ' + error.message)
    else {
      alert('Beneficiary added!')
      setFullName('')
      setEmail('')
      fetchData()
    }

    setLoading(false)
  }

  // ===========================================================
  //  STEP 5: UI Layout — Clean and Structured
  // ===========================================================
  return (
    <main className="p-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Johnny’s Trust Dashboard
        </h1>
        <a href="/logout">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </a>
      </header>

      {/* DASHBOARD SUMMARY */}
      <TrustSummary />

      <TrustCharts />

      {/* TRANSACTION FORM */}
      <TransactionForm onTransactionAdded={fetchData} />

      {/* ADD BENEFICIARY FORM */}
      <section className="mb-10">
        <h2 className="font-semibold text-lg mb-3">Add New Beneficiary</h2>
        <form onSubmit={handleAddBeneficiary} className="flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="border p-2 rounded flex-1"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </section>

      {/* BENEFICIARIES LIST */}
      <section className="mb-10">
        <h2 className="font-semibold text-lg mb-3">Current Beneficiaries</h2>
        <ul className="space-y-2">
          {beneficiaries.map((b) => (
            <li
              key={b.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{b.full_name}</p>
                <p className="text-sm text-gray-500">{b.email}</p>
              </div>
              <span className="text-xs text-green-600">{b.status}</span>
            </li>
          ))}
          {beneficiaries.length === 0 && (
            <li className="text-gray-400 text-sm">No beneficiaries yet.</li>
          )}
        </ul>
      </section>

      {/* TRANSACTIONS LIST */}
      <section>
        <h2 className="font-semibold text-lg mb-3">Recent Transactions</h2>
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <span className="capitalize">{t.type}</span>
              <span>${t.amount}</span>
            </li>
          ))}
          {transactions.length === 0 && (
            <li className="text-gray-400 text-sm">No transactions recorded.</li>
          )}
        </ul>
      </section>
    </main>
  )
}
