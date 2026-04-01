'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userName?: string
  avatarUrl?: string | null
  showAdminLink?: boolean
  showOfferRideButton?: boolean
}

export default function Navbar({ userName, avatarUrl, showAdminLink = false, showOfferRideButton = false }: NavbarProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Fungsi pintar untuk mengambil maksimal 2 kata pertama dari nama
  const getGreetingName = (fullName: string) => {
    return fullName.split(' ').slice(0, 2).join(' ')
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo dan Nama Aplikasi */}
        <Link href="/home" className="flex items-center gap-2">
            <div className="bg-white rounded-full p-0.5 shadow-sm">
              <Image src="/logo.png" alt="Mai-Milu Logo" width={36} height={36} className="rounded-full" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold text-white leading-none tracking-wide">
                Mai-Milu
              </span>
              <span className="text-[10px] sm:text-xs text-blue-100 font-medium mt-1 tracking-wider">
                Bali Carpool Community
              </span>
            </div>
          </Link>

        {/* Info Pengguna, Tombol, dan Logout */}
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm hidden md:inline-block font-medium">Halo, {getGreetingName(userName)}!</span>
          )}
          {avatarUrl && (
            <Image src={avatarUrl} alt="Profile" width={40} height={40} className="rounded-full border-2 border-white object-cover shadow-sm" />
          )}

          {showOfferRideButton && (
            <Link href="/offer-ride" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm transition flex items-center gap-2">
              <span className="text-lg font-bold">+</span> <span className="hidden md:inline">Tawarkan Tumpangan</span>
            </Link>
          )}

          {showAdminLink && (
            <Link href="/admin" className="text-sm text-blue-100 hover:text-white underline font-medium">
              Admin
            </Link>
          )}

          <button onClick={handleLogout} className="text-sm bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg font-medium transition shadow-sm">
            Keluar
          </button>
        </div>
      </div>
    </nav>
  )
}