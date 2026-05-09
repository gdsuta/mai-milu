import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server' // <-- Impor rumus induk kita

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/verification'

  if (code) {
    const supabase = await createServer() // Sangat ringkas!
    
    // Proses penukaran tiket (code) menjadi Sesi Login
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Jika berhasil pada tembakan pertama, langsung arahkan
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // JIKA TERJADI ERROR (Biasanya karena Next.js menembak 2 kali):
      // Kita cek dulu, apakah sebenarnya Sesi Login sudah berhasil dibuat?
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Abaikan errornya, karena pengguna sebenarnya sudah berhasil login!
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      // Jika benar-benar gagal, catat error di terminal agar kita tahu penyebabnya
      console.error("Auth Callback Error:", error.message)
    }
  }

  // Jika tiket tidak ada atau sudah sangat kedaluwarsa
  return NextResponse.redirect(`${origin}/login?error=Tautan_tidak_valid`)
}