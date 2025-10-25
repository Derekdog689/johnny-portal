'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SummaryCards from '@/components/SummaryCards';
import WellnessChart from '@/components/WellnessChart';
import TrustSummary from '@/components/TrustSummary';

export default function DashboardPage() {
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [role, setRole] = useState<'wellness' | 'trust'>('wellness');
  const [loading, setLoading] = useState(false);

  // fetch wellness data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('wellness')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) console.error('Error loading wellness data:', error);
      else setWellnessData(data || []);
    };
    fetchData();
  }, []);

  // averages
  const avgMood =
    wellnessData.length > 0
      ? (
          wellnessData.reduce((s, r) => s + (r.mood_level || 0), 0) /
          wellnessData.length
        ).toFixed(2)
      : 0;
  const avgSleep =
    wellnessData.length > 0
      ? (
          wellnessData.reduce((s, r) => s + (r.sleep_hours || 0), 0) /
          wellnessData.length
        ).toFixed(2)
      : 0;
  const avgExercise =
    wellnessData.length > 0
      ? (
          wellnessData.reduce((s, r) => s + (r.exercise_minutes || 0), 0) /
          wellnessData.length
        ).toFixed(2)
      : 0;

  // export PDF
  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wellness_report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Johnny Portal Dashboard</h1>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setRole('wellness')}
          className={`px-4 py-2 rounded ${
            role === 'wellness'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black'
          }`}
        >
          Wellness View
        </button>
        <button
          onClick={() => setRole('trust')}
          className={`px-4 py-2 rounded ${
            role === 'trust'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-black'
          }`}
        >
          Trust View
        </button>
      </div>

      {/* Conditional views */}
      {role === 'wellness' ? (
        <>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            {loading ? 'Generating PDF...' : 'Generate Wellness Report'}
          </button>

          <SummaryCards
            stats={{
              mood: avgMood,
              sleep: avgSleep,
              exercise: avgExercise,
            }}
          />

          <WellnessChart data={wellnessData} />

          {/* Wellness table */}
          <section className="mt-8 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Wellness Entries</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Mood</th>
                  <th className="p-2 border">Sleep (h)</th>
                  <th className="p-2 border">Exercise (m)</th>
                  <th className="p-2 border">Journal</th>
                </tr>
              </thead>
              <tbody>
                {wellnessData.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="border p-2">{r.mood_level}</td>
                    <td className="border p-2">{r.sleep_hours}</td>
                    <td className="border p-2">{r.exercise_minutes}</td>
                    <td className="border p-2">{r.journal_entry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <TrustSummary />
      )}
    </main>
  );
}
