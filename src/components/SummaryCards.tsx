export default function SummaryCards({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white p-4 shadow rounded-lg text-center">
        <h3 className="text-gray-500 text-sm">Average Mood</h3>
        <p className="text-2xl font-semibold text-blue-600">{stats.mood}</p>
      </div>
      <div className="bg-white p-4 shadow rounded-lg text-center">
        <h3 className="text-gray-500 text-sm">Average Sleep (h)</h3>
        <p className="text-2xl font-semibold text-green-600">{stats.sleep}</p>
      </div>
      <div className="bg-white p-4 shadow rounded-lg text-center">
        <h3 className="text-gray-500 text-sm">Average Exercise (m)</h3>
        <p className="text-2xl font-semibold text-orange-600">{stats.exercise}</p>
      </div>
    </div>
  );
}
