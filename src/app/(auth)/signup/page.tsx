'use client';
import { useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email for verification.');
  };

  return (
    <main className='min-h-screen grid place-items-center p-6'>
      <form onSubmit={handleSignUp} className='space-y-4 w-full max-w-sm bg-white p-6 rounded shadow'>
        <h1 className='text-2xl font-bold'>Create Account</h1>
        <input type='email' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} className='border p-2 w-full' required />
        <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} className='border p-2 w-full' required />
        <button type='submit' className='bg-green-600 text-white p-2 rounded w-full'>Sign Up</button>
        <p className='text-center text-sm'>Already have an account? <Link href='/signin' className='underline'>Sign in</Link></p>
      </form>
    </main>
  );
}
