'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect users to the Trust Dashboard automatically
    router.replace('/trust');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center text-gray-600">
      <p>Redirecting to Trust Dashboard...</p>
    </main>
  );
}
