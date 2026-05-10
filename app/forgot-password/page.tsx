'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Envelope, ArrowLeft, PaperPlaneRight, CircleNotch, CheckCircle } from '@phosphor-icons/react'

const forgotSchema = z.object({
  email: z.string().email("Format email tidak valid")
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema)
  })

  const onSubmitForm = async (data: ForgotFormValues) => {
    setLoading(true)
    try {
      // 1. Logika Keamanan Anda: Cek apakah email terdaftar menggunakan RPC
      const { data: isRegistered, error: checkError } = await supabase
        .rpc('check_email_registered', { email_input: data.email })

      if (checkError) throw checkError

      if (!isRegistered) {
        alert('Email ini tidak terdaftar di Mai-Milu. Pastikan Anda menggunakan email yang sama saat mendaftar, atau daftar akun baru.')
        setLoading(false)
        return
      }

      // 2. Kirim tautan reset dengan rute callback Anda
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })

      if (error) throw error
      setIsSuccess(true)

    } catch (error: any) {
      alert("Gagal mengirim tautan: " + (error.message || "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
        
        {/* Latar Belakang Dekoratif */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-indigo-50 to-transparent"></div>

        <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft weight="bold" className="w-6 h-6" />
        </Link>

        <div className="flex justify-center mb-6 relative mt-4">
          <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 w-20 h-20 mx-auto"></div>
          <Image src="/logo.png" alt="Mai-Milu Logo" width={72} height={72} className="rounded-full shadow-md relative z-10 border-4 border-white" />
        </div>
        
        <h1 className="text-2xl font-black text-center text-indigo-900 mb-2 tracking-tight">Atur Ulang Sandi</h1>
        
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mt-6">
            <CheckCircle weight="duotone" className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 mb-2">Tautan Terkirim!</h3>
            <p className="text-sm text-green-700 leading-relaxed">
              Silakan periksa kotak masuk (atau folder spam) email Anda untuk mengatur ulang kata sandi.
            </p>
            <Link href="/login" className="inline-block mt-5 text-indigo-600 font-bold hover:underline text-sm transition-all">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
            </p>

            <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Email Terdaftar</label>
                <div className="relative">
                  <Envelope weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    {...register('email')} 
                    className={`w-full border py-3 pl-11 pr-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50/50'}`} 
                    placeholder="anda@gmail.com" 
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} 
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-indigo-700 transition-all disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2 text-[15px]">
                {loading ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <PaperPlaneRight weight="fill" className="w-5 h-5" />}
                {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}