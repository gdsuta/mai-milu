import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function HomePage() {
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
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/verification')
  }

  // Auto-expire: only fetch rides whose departure time is in the future.
  // This prevents stale rides from showing without needing a manual cleanup job.
  const now = new Date().toISOString()

  const { data: rides } = await supabase
    .from('rides')
    .select(`
      id, driver_id, origin, destination, departure_time, available_seats, price, notes, status,
      profiles:driver_id (full_name, avatar_url, phone_number)
    `)
    .eq('status', 'tersedia')
    .gte('departure_time', now)
    .order('departure_time', { ascending: true })

  async function deleteRide(formData: FormData) {
    'use server'
    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
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
    
    const rideId = formData.get('rideId') as string
    await supabaseServer.from('rides').delete().eq('id', rideId)
    revalidatePath('/home') 
  }

  return (
    <>
      {/* Kita hilangkan 'showOfferRideButton={true}' agar tombol di pojok kanan atas menghilang */}
      <Navbar userName={profile?.full_name} avatarUrl={profile?.avatar_url} showAdminLink={profile?.role === 'admin'} />
      
      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">
          
          {/* TOMBOL BARU: Jelas, besar, dan sangat ramah sentuhan (mobile-friendly) */}
          <div className="mb-8">
            <Link href="/offer-ride" className="w-full bg-green-600 text-white px-4 py-4 rounded-xl font-bold hover:bg-green-700 shadow-md transition flex items-center justify-center gap-2 text-lg">
              <span className="text-xl">➕</span> Tawarkan Tumpangan
            </Link>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tumpangan Tersedia</h2>
          </div>

          {(!rides || rides.length === 0) ? (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center mt-2">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada tumpangan tersedia saat ini</h3>
              <p className="text-gray-500 mb-4">Tumpangan yang sudah lewat waktunya disembunyikan otomatis. Jadilah yang pertama menawarkan!</p>
              <a href="/offer-ride" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition text-sm">
                ➕ Tawarkan Tumpangan
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride: any) => {
                const dateObj = new Date(ride.departure_time)
                const tanggal = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
                const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                const isOwner = user.id === ride.driver_id
                const minutesUntilDeparture = Math.floor((dateObj.getTime() - Date.now()) / 60000)
                const isExpiringSoon = minutesUntilDeparture <= 120 // within 2 hours
				let waNumber = ride.profiles?.phone_number.replace(/[^0-9]/g, '') || ''
                if (waNumber.startsWith('0')) {
                  waNumber = '62' + waNumber.substring(1)
                }
                return (
                  <div key={ride.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative overflow-hidden">
                    {isOwner && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Tumpangan Anda
                      </div>
                    )}
                    {!isOwner && isExpiringSoon && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg animate-pulse">
                        ⚡ Segera Berangkat!
                      </div>
                    )}

                    <div className="flex justify-between items-start border-b pb-4 mb-4 mt-2">
                      <div className="flex items-center gap-3">
                        {ride.profiles?.avatar_url ? (
                          <img src={ride.profiles.avatar_url} alt="Driver" className="w-12 h-12 rounded-full object-cover border" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800">{ride.profiles?.full_name}</p>
                          <p className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Pengemudi Terverifikasi</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{ride.price === 0 ? 'GRATIS' : `Rp ${ride.price.toLocaleString('id-ID')}`}</p>
                        <p className="text-sm text-gray-500">{ride.available_seats} Kursi Tersedia</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-500">📍</span>
                          <p className="font-semibold text-gray-800">{ride.origin}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-500">🏁</span>
                          <p className="font-semibold text-gray-800">{ride.destination}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-600 mb-1">📅 {tanggal}</p>
                        <p className="text-sm text-gray-600 mb-1">⏰ {jam} WITA</p>
                        {ride.notes && (
                          <p className="text-sm text-gray-500 italic mt-2 border-t pt-2">"{ride.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t text-center flex justify-center gap-3">
                      {isOwner ? (
                        <form action={deleteRide} className="w-full md:w-auto">
                          <input type="hidden" name="rideId" value={ride.id} />
                          <button type="submit" className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 border border-red-200 w-full md:w-auto transition flex items-center justify-center gap-2 text-sm">
                            🗑️ Hapus
                          </button>
                        </form>
                      ) : (
                        <a 
                          href={`https://wa.me/${waNumber}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 w-full md:w-auto transition flex items-center justify-center gap-2 text-sm"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}