import "./globals.css";
import React from "react";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Johnny Portal",
  description: "Trust Dashboard & Beneficiary Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
        {/* NAVIGATION HEADER - ADD YOUR LINKS HERE */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Johnny's Portal</h1>
          <nav className="flex gap-4 text-sm">
            {/* Main Navigation - Add or remove links as needed */}
            <a href="/trust" className="hover:underline">
              Trust
            </a>
            <a href="/wellness" className="hover:underline">
              Wellness
            </a>
            {/* MARKER FOR FUTURE NAV LINKS */}
            {/* <a href="/reports" className="hover:underline">Reports</a> */}
            {/* <a href="/settings" className="hover:underline">Settings</a> */}
          </nav>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

        {/* TOAST NOTIFICATIONS */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#fff", color: "#111827" },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
