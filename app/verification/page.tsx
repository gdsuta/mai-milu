import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import Navbar from '@/components/Navbar' // Import Navbar baru

export default async function VerificationPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set({ name, value, ...options }) }) } catch (error) {}
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Anda Belum Login</h1>
          <p className="text-gray-600 mb-6">Silakan login atau daftar untuk melihat status verifikasi Anda.</p>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Navbar userName={profile?.full_name} avatarUrl={profile?.avatar_url} showAdminLink={profile?.role === 'admin'} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-20">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full relative">
          
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Mai-Milu</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Halo, {profile?.full_name}!</h2>

          {profile?.verification_status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Akun Sedang Ditinjau</h3>
              <p className="text-yellow-700 text-sm">
                Terima kasih telah bergabung! Tim Admin kami sedang memverifikasi identitas Anda untuk memastikan keamanan komunitas Mai-Milu Bali. Harap tunggu sebentar ya.
              </p>
            </div>
          )}

          {profile?.verification_status === 'verified' && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Akun Terverifikasi!</h3>
              <p className="text-green-700 text-sm mb-4">
                Selamat! Identitas Anda telah dikonfirmasi. Anda sekarang dapat mulai mencari atau menawarkan tumpangan.
              </p>
              <Link href="/home" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 w-full text-center transition shadow-sm">
                Masuk ke Aplikasi
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}