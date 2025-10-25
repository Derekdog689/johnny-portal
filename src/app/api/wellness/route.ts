import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from('wellness')
      .select('created_at, mood_level, sleep_hours, exercise_minutes, journal_entry')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Wellness fetch error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
