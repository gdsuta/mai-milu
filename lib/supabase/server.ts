import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase' // <-- 1. Impor kamusnya

export async function createServer() {
  const cookieStore = await cookies()
  
  // 2. Sisipkan <Database> di sini
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { 
            cookiesToSet.forEach(({ name, value, options }) => { 
              cookieStore.set({ name, value, ...options }) 
            }) 
          } catch (error) {}
        }
      }
    }
  )
}