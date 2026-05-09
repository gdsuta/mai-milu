import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy' 
// Note: If you also renamed the helper file inside the lib/supabase folder to proxy.ts, 
// change the import line above to: import { updateSession } from '@/lib/supabase/proxy'

// 1. Rename the function from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}