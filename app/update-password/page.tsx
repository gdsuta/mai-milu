'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LockKey, Eye, EyeSlash, FloppyDisk, CircleNotch } from '@phosphor-icons/react'

const updateSchema = z.object({
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"]
})

type UpdateFormValues = z.infer<typeof updateSchema>

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema)
  })

  const onSubmitForm = async (data: UpdateFormValues) => {
    setLoading(true)

    try {
      // Menggunakan fungsi updateUser asli Anda
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) throw error

      alert("Kata sandi berhasil diperbarui! Silakan masuk kembali.")
      await supabase.auth.signOut() 
      router.push('/login')

    } catch (error: any) {
      alert("Gagal memperbarui sandi: " + (error.message || "Tautan mungkin sudah kadaluarsa."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 w-20 h-20 mx-auto"></div>
          <Image src="/logo.png" alt="Mai-Milu Logo" width={72} height={72} className="rounded-full shadow-md relative z-10 border-4 border-white" />
        </div>
        
        <h1 className="text-2xl font-black text-center text-indigo-900 mb-2 tracking-tight">Sandi Baru Mai-Milu</h1>
        <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
          Silakan buat kata sandi baru untuk akun Anda. Pastikan mudah diingat dan aman.
        </p>

        <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Kata Sandi Baru</label>
            <div className="relative">
              <LockKey weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                {...register('password')} 
                className={`w-full border py-3 pl-11 pr-12 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50/50'}`} 
                placeholder="Minimal 6 karakter" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeSlash weight="duotone" className="w-5 h-5" /> : <Eye weight="duotone" className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">Konfirmasi Sandi Baru</label>
            <div className="relative">
              <LockKey weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type={showConfirm ? "text" : "password"} 
                {...register('confirmPassword')} 
                className={`w-full border py-3 pl-11 pr-12 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50/50'}`} 
                placeholder="Ulangi kata sandi baru" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeSlash weight="duotone" className="w-5 h-5" /> : <Eye weight="duotone" className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} 
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-indigo-700 transition-all disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2 text-[15px]">
            {loading ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <FloppyDisk weight="fill" className="w-5 h-5" />}
            {loading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}