'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Import Link
import Image from 'next/image'

export default function RegisterPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', address: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  
  // 1. TAMBAHKAN STATE UNTUK CHECKBOX T&C
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 2. CEK APAKAH SYARAT SUDAH DISETUJUI
    if (!agreedToTerms) {
      alert("Ups! Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi Mai-Milu sebelum mendaftar.")
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError
      
      const userId = authData.user?.id
      if (!userId) throw new Error("Gagal membuat akun pengguna.")

      let avatarUrl = ''
      if (avatarFile) {
        const avatarPath = `${userId}/selfie-${Date.now()}`
        await supabase.storage.from('avatars').upload(avatarPath, avatarFile)
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl
      }

      let ktpUrl = ''
      if (ktpFile) {
        const ktpPath = `${userId}/ktp-${Date.now()}`
        await supabase.storage.from('identity_docs').upload(ktpPath, ktpFile)
        ktpUrl = ktpPath 
      }

      // Using upsert instead of update to safely handle retries.
      // If the DB trigger already created a profile row, this updates it.
      // If somehow no row exists yet, this inserts it. Either way, no crash.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: formData.fullName,
          phone_number: formData.phone,
          home_address: formData.address,
          avatar_url: avatarUrl,
          ktp_url: ktpUrl
        })

      if (profileError) throw profileError

      alert("Pendaftaran berhasil! Silakan tunggu verifikasi dari admin Mai-Milu.")
      router.push('/verification')

    } catch (error: any) {
      alert("Ups, terjadi kesalahan: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Mai-Milu Logo" width={80} height={80} className="rounded-full shadow-md" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">Mai-Milu</h1>
        <p className="text-center text-gray-500 mb-8">Mari berbagi tumpangan bersama masyarakat Bali lainnya di komunitas Mai-Milu.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="anda@gmail.com" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
            <div className="relative mt-1">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
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
          
          <hr className="my-2" />

          <div>
            <label className="text-sm font-semibold text-gray-700">Nama Lengkap (Sesuai KTP)</label>
            <input type="text" required onChange={e => setFormData({...formData, fullName: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="Putu / Kadek / Komang..." />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
            <input type="tel" required onChange={e => setFormData({...formData, phone: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="081..." />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Alamat Rumah</label>
            <textarea required onChange={e => setFormData({...formData, address: e.target.value})} 
              className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="Perumahan Delta, Jl Kuta No 8, Desa Panji, Buleleng " rows={2} />
          </div>
          
          <hr className="my-2" />

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-1">1. Unggah Foto Selfie (Jelas)</label>
            <p className="text-xs text-blue-600 mb-3">Ini akan menjadi foto profil Anda di aplikasi.</p>
            <input 
              type="file" 
              accept="image/*" 
              required 
              onChange={e => setAvatarFile(e.target.files?.[0] || null)} 
              className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <label className="block text-sm font-bold text-red-800 mb-1">2. Unggah Foto KTP</label>
            <p className="text-xs text-red-600 mb-3">Dijaga kerahasiaannya dengan ketat untuk keamanan komunitas.</p>
            <input 
              type="file" 
              accept="image/*" 
              required 
              onChange={e => setKtpFile(e.target.files?.[0] || null)} 
              className="w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" 
            />
          </div>
          
          {/* 3. TAMBAHKAN CHECKBOX T&C DI SINI */}
          <div className="flex items-start gap-2 p-2 mt-2">
            <input 
              type="checkbox" 
              id="terms_consent" 
              required 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            />
            <label htmlFor="terms_consent" className="text-sm text-gray-700 leading-snug">
              Saya menyetujui <Link href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">Syarat & Ketentuan</Link> serta <Link href="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">Kebijakan Privasi</Link> Mai-Milu.
            </label>
          </div>

          <button type="submit" disabled={loading || !agreedToTerms} 
            className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mt-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Memproses data Anda...' : 'Kirim Data Verifikasi'}
          </button>

        </form>
      </div>
    </div>
  )
}