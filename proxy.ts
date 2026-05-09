import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Operkan semua pemeriksaan ke fungsi pelindung yang kita buat di Langkah 1
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua rute halaman, KECUALI file statis dan gambar
     * agar Middleware tidak membuang energi mengecek hal-hal yang tidak perlu.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}