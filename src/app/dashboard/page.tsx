"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <main className="p-8 min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Trust Dashboard</h1>

      <section className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-sm uppercase font-semibold">Total Distributed</h2>
          <p className="text-2xl font-bold text-green-700">$3,500</p>
        </div>

        <div className="bg-blue-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-sm uppercase font-semibold">Average Distribution</h2>
          <p className="text-2xl font-bold text-blue-700">$875</p>
        </div>

        <div className="bg-yellow-100 p-6 rounded-xl shadow text-center">
          <h2 className="text-sm uppercase font-semibold">Transaction Count</h2>
          <p className="text-2xl font-bold text-yellow-700">4</p>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p>This will later display trust-wide analytics, beneficiary wellness scores, and trends.</p>
      </section>
    </main>
  );
}
