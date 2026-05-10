'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// Impor ikon dari Phosphor
import { SignOut, ShieldCheck, User } from '@phosphor-icons/react'

type NavbarProps = {
  userName?: string
  avatarUrl?: string
  showAdminLink?: boolean
}

export default function Navbar({ userName, avatarUrl, showAdminLink }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & Judul */}
        <Link href="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="bg-white rounded-full p-0.5 shadow-sm border-2 border-blue-400/50 hidden sm:block">
            <Image src="/logo.png" alt="Mai-Milu" width={36} height={36} className="rounded-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl leading-none tracking-tight">Mai-Milu</h1>
            <p className="text-[10px] text-blue-200 font-bold tracking-wider mt-0.5 uppercase hidden sm:block">Bali Carpool Community</p>
          </div>
        </Link>

        {/* Profil & Aksi */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Tautan Admin (Jika Role = admin) */}
          {showAdminLink && (
            <Link href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-yellow-300 hover:text-yellow-100 transition-colors">
              <ShieldCheck weight="duotone" className="w-5 h-5" /> 
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          
          <div className="flex items-center gap-3">
            {/* Avatar Pengguna */}
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName || "User"} className="w-9 h-9 rounded-full object-cover border-2 border-blue-400 shadow-sm" />
            ) : (
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-sm">
                <User weight="bold" className="w-5 h-5 text-white" />
              </div>
            )}
            
            {/* Tombol Keluar */}
            <button 
              onClick={handleLogout} 
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-inner border border-blue-500"
            >
              <span className="hidden sm:inline">Keluar</span>
              <SignOut weight="bold" className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}