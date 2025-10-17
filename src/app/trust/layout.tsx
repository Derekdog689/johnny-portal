"use client";
import React from "react";

export default function TrustLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
