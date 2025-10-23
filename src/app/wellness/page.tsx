'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WellnessPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [mood, setMood] = useState('')
  const [sleep, setSleep] = useState('')
  const [exercise, setExercise] = useState('')
  const [journal, setJournal] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // -----------------------------
  // Fetch wellness entries for authenticated user
  // -----------------------------
  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found')
      return
    }

    const { data: beneficiary, error: benError } = await supabase
      .from('beneficiaries')
      .select('id')
      .eq('email', user.email)
      .single()

    if (benError || !beneficiary) {
      console.error('Error finding beneficiary for user:', benError?.message)
      return
    }

    const { data, error } = await supabase
      .from('wellness')
      .select('*')
      .eq('beneficiary_id', beneficiary.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching wellness entries:', error.message)
    else setEntries(data || [])
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // -----------------------------
  // Handle wellness form submission
  // -----------------------------
  const handleAddEntry = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Please sign in first.')
      setLoading(false)
      return
    }

    const { data: beneficiary, error: benError } = await supabase
      .from('beneficiaries')
      .select('id')
      .eq('email', user.email)
      .single()

    if (benError || !beneficiary) {
      alert('No beneficiary record found for this user.')
      console.error('Beneficiary fetch error:', benError?.message)
      setLoading(false)
      return
    }

    const { error } = await supabase.from('wellness').insert({
      beneficiary_id: beneficiary.id,
      mood_level: mood ? parseInt(mood) : null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      exercise_minutes: exercise ? parseInt(exercise) : null,
      journal_entry: journal,
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Wellness entry saved!')
      setMood('')
      setSleep('')
      setExercise('')
      setJournal('')
      fetchEntries()
    }

    setLoading(false)
  }

  // -----------------------------
// Handle PDF Download (Vercel-safe)
// -----------------------------
const handleDownloadPDF = async () => {
  setDownloading(true)
  try {
    const res = await fetch('/api/export', { method: 'GET' })

    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`)
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wellness_report.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('PDF export failed:', err)
    alert('Unable to generate report. Please try again.')
  } finally {
    setDownloading(false)
  }
}

  // -----------------------------
  // Render Page
  // -----------------------------
  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Wellness Tracker</h1>
        <a href="/logout">
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Logout
          </button>
        </a>
      </header>

      {/* Add Entry Form */}
      <section className="mb-10">
        <h2 className="font-semibold text-lg mb-3">Add Daily Entry</h2>
        <form onSubmit={handleAddEntry} className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Mood (1–10)"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Sleep (hours)"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Exercise (minutes)"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Journal entry"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="border p-2 rounded col-span-2"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-2"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Entry'}
          </button>
        </form>
      </section>

      {/* Display Entries */}
      <section className="mb-10">
        <h2 className="font-semibold text-lg mb-3">Recent Entries</h2>
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="border rounded p-3 flex flex-col text-sm bg-gray-50"
            >
              <span>
                <strong>Mood:</strong> {e.mood_level ?? '–'} |{' '}
                <strong>Sleep:</strong> {e.sleep_hours ?? '–'}h |{' '}
                <strong>Exercise:</strong> {e.exercise_minutes ?? '–'} min
              </span>
              <span className="italic text-gray-600 mt-1">
                {e.journal_entry}
              </span>
              <span className="text-gray-400 text-xs mt-1">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="text-gray-400 text-sm">No entries yet.</li>
          )}
        </ul>
      </section>

      {/* Generate Report Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {downloading ? 'Generating PDF…' : 'Generate Wellness PDF'}
        </button>
      </div>
    </main>
  )
}