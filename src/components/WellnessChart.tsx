'use client';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function WellnessChart({ data }: any) {
  return (
    <div className="bg-white p-4 mt-6 shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Wellness Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
          <XAxis dataKey="created_at" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mood_level" stroke="#3b82f6" name="Mood" />
          <Line type="monotone" dataKey="sleep_hours" stroke="#10b981" name="Sleep (h)" />
          <Line type="monotone" dataKey="exercise_minutes" stroke="#f59e0b" name="Exercise (m)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
