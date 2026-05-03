'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // PERBAIKAN: Arahkan tautan email ke rute 'auth/callback' terlebih dahulu untuk membuat sesi,
        // lalu biarkan sistem yang meneruskannya (?next=) ke halaman update-password.
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: any) {
      alert("Gagal mengirim tautan: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Mai-Milu Logo" width={60} height={60} className="rounded-full shadow-md" />
        </div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Lupa Kata Sandi?</h1>
        
        {success ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-6">
            <p className="text-green-800 font-semibold">Tautan pemulihan telah dikirim!</p>
            <p className="text-sm text-green-700 mt-2">Silakan periksa kotak masuk (atau folder spam) email Anda.</p>
            <Link href="/login" className="inline-block mt-4 text-blue-600 font-bold hover:underline text-sm">Kembali ke Login</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6 text-sm">Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
            <form onSubmit={handleResetRequest} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email Terdaftar</label>
                <input type="email" required onChange={e => setEmail(e.target.value)} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="anda@contoh.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg mt-2 hover:bg-blue-700 disabled:bg-gray-400">
                {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </button>
            </form>
            <Link href="/login" className="inline-block mt-6 text-gray-500 hover:text-blue-600 font-medium text-sm">
              &larr; Kembali ke halaman Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}