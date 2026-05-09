import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/supabase' // <-- 1. Impor kamusnya

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Sisipkan <Database> di sini
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Tarik data pengguna saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. DAFTAR HALAMAN YANG DILINDUNGI
  // Tambahkan path halaman lain di sini jika diperlukan
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/home') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/offer-ride')

  // Jika belum login tapi mencoba masuk halaman yang dilindungi -> tendang ke /login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Jika SUDAH login tapi mencoba buka halaman /login atau /register -> arahkan ke /home
  const isAuthRoute = 
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // Jika aman, izinkan pengguna melanjutkan perjalanannya
  return supabaseResponse
}