'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface WellnessInsight {
  full_name: string
  total_entries: number
  avg_mood: number
  avg_sleep: number
  avg_exercise: number
  last_entry: string
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<WellnessInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      const { data, error } = await supabase
        .from('wellness_insights')
        .select('*')

      if (error) {
        console.error('Error fetching insights:', error.message)
      } else {
        setInsights(data || [])
      }
      setLoading(false)
    }

    fetchInsights()
  }, [])

  if (loading) return <p className="p-6 text-gray-500">Loading analytics...</p>
  if (!insights.length)
    return <p className="p-6 text-gray-500">No wellness data available yet.</p>

  const userInsight = insights[0]

  const chartData = [
    { name: 'Mood', value: userInsight.avg_mood },
    { name: 'Sleep', value: userInsight.avg_sleep },
    { name: 'Exercise', value: userInsight.avg_exercise }
  ]

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Wellness Analytics</h1>
        <a href="/logout">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </a>
      </header>

      {/* Summary Section */}
      <section className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm text-gray-500">Average Mood</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {userInsight.avg_mood}
          </h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm text-gray-500">Average Sleep (hours)</p>
          <h2 className="text-2xl font-bold text-green-600">
            {userInsight.avg_sleep}
          </h2>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-sm text-gray-500">Average Exercise (min)</p>
          <h2 className="text-2xl font-bold text-orange-600">
            {userInsight.avg_exercise}
          </h2>
        </div>
      </section>

      {/* Chart Section */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Wellness Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Export Section */}
<section className="text-center mt-8">
  <a
    href="/api/export"
    target="_blank"
    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
  >
    Export Wellness Data (CSV)
  </a>
</section>

      <footer className="mt-8 text-center text-gray-400 text-xs">
        Last entry: {new Date(userInsight.last_entry).toLocaleString()}
      </footer>
    </main>
  )
}
