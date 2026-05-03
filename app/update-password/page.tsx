'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // TAMBAHAN: State untuk mengontrol buka/tutup mata kata sandi
  const [showPassword, setShowPassword] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: password })
      if (error) throw error
      
      alert("Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.")
      router.push('/login')
    } catch (error: any) {
      alert("Gagal memperbarui kata sandi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Buat Sandi Baru</h1>
        <p className="text-gray-500 mb-6 text-sm text-center">Silakan masukkan kata sandi baru Anda di bawah ini.</p>
        
        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Kata Sandi Baru</label>
            
            {/* TAMBAHAN: Kotak input yang dibungkus div relative beserta tombol matanya */}
            <div className="relative mt-1">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border border-gray-300 p-2 pr-10 rounded-lg text-gray-900" 
                placeholder="Minimal 6 karakter" 
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
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold p-3 rounded-lg mt-2 hover:bg-green-700 disabled:bg-gray-400">
            {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}