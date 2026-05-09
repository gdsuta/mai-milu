import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase' // <-- 1. Impor kamusnya

export function createClient() {
  // 2. Sisipkan <Database> di sini
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}