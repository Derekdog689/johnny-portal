'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TrustSummary() {
  const [total, setTotal] = useState(0)
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [cap, setCap] = useState(80000) // editable later

  useEffect(() => {
    const fetchTotals = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')

      if (error) {
        console.error('Error fetching transactions:', error)
        return
      }

      const distributions = data.filter((t) => t.type === 'distribution')
      const totalAmount = distributions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      )

      setTotal(totalAmount)
      setAverage(distributions.length > 0 ? totalAmount / distributions.length : 0)
      setCount(distributions.length)
    }

    fetchTotals()
  }, [])

  const remaining = cap - total
  const percent = Math.min((total / cap) * 100, 100)

  return (
    <section className="mb-8">
      <h2 className="font-semibold text-lg mb-4">Trust Dashboard Summary</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 border rounded text-center">
          <p className="text-sm text-gray-500">Total Distributed</p>
          <p className="text-xl font-bold text-green-600">${total.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <p className="text-sm text-gray-500">Average Distribution</p>
          <p className="text-xl font-bold text-blue-600">${average.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded text-center">
          <p className="text-sm text-gray-500">Transactions Count</p>
          <p className="text-xl font-bold text-indigo-600">{count}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border rounded p-4">
        <p className="text-sm text-gray-500 mb-2">
          Budget Progress — Cap: ${cap.toLocaleString()}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Distributed: ${total.toLocaleString()} | Remaining: ${remaining.toLocaleString()}
        </p>
      </div>
    </section>
  )
}
