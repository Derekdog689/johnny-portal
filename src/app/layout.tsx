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
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
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
