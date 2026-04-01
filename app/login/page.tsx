'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // === PERBAIKAN LOGIKA RUTE PINTASAN ===
        if (profile?.role === 'admin') {
          router.push('/admin') // Admin masuk ke Dasbor Admin
        } else if (profile?.role === 'user') {
          router.push('/home') // Pengguna yang sudah diverifikasi langsung ke Beranda!
        } else {
          router.push('/verification') // Pengguna baru/pending tetap di Ruang Tunggu
        }
      }

    } catch (error: any) {
      alert("Gagal masuk: Pastikan email dan kata sandi Anda benar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
		<Image src="/logo.png" alt="Mai-Milu Logo" width={80} height={80} className="rounded-full shadow-md" />
		</div>
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Mai-Milu</h1>
        <p className="text-center text-gray-500 mb-8">
          Selamat datang Semeton Bali!<br />
          Silahkan login untuk masuk ke menu utama.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            {/* Tambahan text-gray-900 di sini */}
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="anda@gmail.com" />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">Lupa sandi?</Link>
            </div>
            <div className="relative mt-1">
              {/* Tambahan text-gray-900 di sini */}
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className="w-full border border-gray-300 p-2 pr-10 rounded-lg text-gray-900" 
                placeholder="Masukkan kata sandi Anda" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} 
            className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Belum punya akun? <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar di sini</Link>
        </p>

      </div>
    </div>
  )
}