'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'

const COLORS = ['#4CAF50', '#FF7043']

export default function TrustCharts() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState({ distributions: 0, expenses: 0 })
  const [filter, setFilter] = useState('30D') // default: last 30 days

  // ===========================================================
  //  FETCH FUNCTION
  // ===========================================================
  const fetchTransactions = async () => {
    const sinceDate = getFilterDate(filter)
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, created_at')
      .gte('created_at', sinceDate)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching transactions:', error.message)
      return
    }

    setTransactions(data || [])

    const distributions = data
      .filter((t) => t.type === 'distribution')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = data
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    setSummary({ distributions, expenses })
  }

  // ===========================================================
  //  INITIAL LOAD + SUBSCRIPTIONS
  // ===========================================================
  useEffect(() => {
    fetchTransactions()

    // Real-time updates when transactions table changes
    const channel = supabase
      .channel('chart-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  // ===========================================================
  //  DATE FILTER HELPER
  // ===========================================================
  function getFilterDate(f: string) {
    const now = new Date()
    if (f === '7D') now.setDate(now.getDate() - 7)
    else if (f === '30D') now.setDate(now.getDate() - 30)
    else if (f === 'YTD') now.setMonth(0, 1)
    return now.toISOString()
  }

  // ===========================================================
  //  EXPORT TO CSV
  // ===========================================================
  const handleExportCSV = () => {
    if (!transactions.length) return alert('No transactions to export.')

    const csv = Papa.unparse(
      transactions.map((t) => ({
        Date: new Date(t.created_at).toLocaleDateString(),
        Type: t.type,
        Amount: t.amount,
      }))
    )

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `trust-transactions-${filter}.csv`)
  }

  // ===========================================================
  //  CHART DATA
  // ===========================================================
  const pieData = [
    { name: 'Distributions', value: summary.distributions },
    { name: 'Expenses', value: summary.expenses },
  ]

  const barData = transactions.map((t) => ({
    date: new Date(t.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    amount: t.amount,
    type: t.type,
  }))

  // ===========================================================
  //  UI
  // ===========================================================
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Trust Analytics Overview</h2>

        <div className="flex gap-2">
          {/* FILTER BUTTONS */}
          {['7D', '30D', 'YTD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border text-sm ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}

          {/* EXPORT BUTTON */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-md font-semibold mb-3">
            Distribution vs Expense
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-md font-semibold mb-3">Transaction History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#2196F3" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
