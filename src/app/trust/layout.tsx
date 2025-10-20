"use client";
import Link from "next/link";

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Johnny’s Trust Dashboard</h1>
        <Link
          href="/logout"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </Link>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
