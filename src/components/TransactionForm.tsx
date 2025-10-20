'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TransactionForm({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'distribution' | 'expense'>('distribution')
  const [loading, setLoading] = useState(false)

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return alert('Please enter an amount.')

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated.')

      const { error } = await supabase.from('transactions').insert({
        amount: parseFloat(amount),
        type,
        added_by: user.id,
      })

      if (error) throw error

      alert('Transaction added!')
      setAmount('')
      setType('distribution')

      if (onTransactionAdded) onTransactionAdded()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-8 border-t pt-6">
      <h2 className="font-semibold text-lg mb-3">Add Transaction</h2>
      <form onSubmit={handleAddTransaction} className="flex flex-col md:flex-row gap-2">
        <input
          className="border p-2 rounded flex-1"
          type="number"
          placeholder="Amount (e.g., 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value as 'distribution' | 'expense')}
        >
          <option value="distribution">Distribution</option>
          <option value="expense">Expense</option>
        </select>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>
    </section>
  )
}
