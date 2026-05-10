import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import RideList from '@/components/RideList'
import { createServer } from '@/lib/supabase/server' // <-- Impor rumus induk kita
import { PlusCircle } from '@phosphor-icons/react/dist/ssr'
export default async function HomePage() {
  const supabase = await createServer()

  // Ambil user. Kita hapus redirect(!user) karena Middleware sudah menanganinya.
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role, home_address')
    .eq('id', user!.id)
    .single()

  // Middleware tidak mengecek status verifikasi, jadi pengecekan ini tetap dipertahankan
  if (profile?.verification_status !== 'verified') {
    redirect('/verification')
  }

  const now = new Date().toISOString()

  const { data: rides } = await supabase
    .from('rides')
    .select(`
      id, driver_id, origin, destination, departure_time, available_seats, price, notes, status, is_recurring, recurring_days,
      profiles:driver_id (full_name, avatar_url, phone_number)
    `)
    .eq('status', 'tersedia')
    .gte('departure_time', now)
    .order('departure_time', { ascending: true })

  async function deleteRide(formData: FormData) {
    'use server'
    const supabaseServer = await createServer() // Sangat ringkas!
    const rideId = formData.get('rideId') as string
    await supabaseServer.from('rides').delete().eq('id', rideId)
    revalidatePath('/home')
  }

  return (
    <>
      <Navbar 
		userName={profile?.full_name ?? undefined} 
		avatarUrl={profile?.avatar_url ?? undefined} 
		showAdminLink={profile?.role === 'admin'} 
		/>

      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">

          <div className="mb-6">
            <Link href="/offer-ride" className="w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white font-bold p-4 rounded-xl mt-4 hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md">
   <PlusCircle weight="bold" className="w-6 h-6" /> Tawarkan Tumpangan
</Link>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tumpangan Tersedia</h2>
          </div>

          <RideList
            rides={(rides as any) ?? []}
            currentUserId={user!.id}
            userAddress={profile?.home_address ?? ''}
            deleteRide={deleteRide}
          />

        </main>
      </div>
    </>
  )
}