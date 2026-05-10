'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SignOut, ShieldCheck, User, CarProfile } from '@phosphor-icons/react'

type NavbarProps = {
  userName?: string
  avatarUrl?: string
  showAdminLink?: boolean
}

export default function Navbar({ userName, avatarUrl, showAdminLink }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo & Judul */}
        <Link href="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          {/* PERBAIKAN: Menghapus 'hidden sm:block' agar logo selalu muncul */}
          <div className="bg-indigo-50 rounded-full p-0.5 shadow-sm border border-indigo-100">
            <Image src="/logo.png" alt="Mai-Milu" width={36} height={36} className="rounded-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl leading-none tracking-tight text-indigo-700">Mai-Milu</h1>
            <p className="text-[9px] text-indigo-400 font-bold tracking-wider mt-0.5 uppercase hidden sm:block">Bali Carpool</p>
          </div>
        </Link>

        {/* Profil & Aksi */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* PERBAIKAN: Tautan Tumpangan Saya Dikembalikan! */}
          <Link href="/my-rides" className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${pathname === '/my-rides' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
            <CarProfile weight={pathname === '/my-rides' ? "fill" : "duotone"} className="w-6 h-6 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Tumpangan Saya</span>
          </Link>

          {/* Tautan Admin */}
          {showAdminLink && (
            <Link href="/admin" className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${pathname === '/admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
              <ShieldCheck weight={pathname === '/admin' ? "fill" : "duotone"} className="w-6 h-6 sm:w-5 sm:h-5" /> 
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-gray-200">
            {/* Avatar Pengguna */}
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName || "User"} className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-sm" />
            ) : (
              <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm">
                <User weight="duotone" className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            
            {/* Tombol Keluar (Hanya Icon di Mobile) */}
            <button 
              onClick={handleLogout} 
              className="bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-gray-200 hover:border-red-200"
              title="Keluar"
            >
              <span className="hidden sm:inline">Keluar</span>
              <SignOut weight="bold" className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}