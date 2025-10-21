import { createClient } from "@supabase/supabase-js";

// ✅ Use environment variables or hardcoded fallback for local testing
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://szkrmhkajrlanblwzesr.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6a3JtaGthanJsYW5ibHd6ZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDk5MTMsImV4cCI6MjA3NjIyNTkxM30.Z7xXHwFv2tGhPajMsoDrvOTmFp85CXVQxWSZV_fH-kg;"

// ✅ Single shared client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
