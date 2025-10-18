'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/trust';
  };

  return (
    <main className='min-h-screen grid place-items-center p-6'>
      <form onSubmit={handleSignIn} className='space-y-4 w-full max-w-sm bg-white p-6 rounded shadow'>
        <h1 className='text-2xl font-bold'>Sign In</h1>
        <input type='email' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 w-full' required />
        <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} className='border p-2 w-full' required />
        <button type='submit' className='bg-blue-600 text-white p-2 rounded w-full'>Sign In</button>
        <p className='text-center text-sm'>No account? <Link href='/signup' className='underline'>Sign up</Link></p>
      </form>
    </main>
  );
}
