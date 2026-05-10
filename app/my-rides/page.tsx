import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Navbar from '@/components/Navbar'
import MyRidesList from '@/components/MyRidesList'
import { createServer } from '@/lib/supabase/server'
import { House, CarProfile, PlusCircle } from '@phosphor-icons/react/dist/ssr'

export default async function MyRidesPage() {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user!.id)
    .single()

  if (profile?.verification_status !== 'verified') redirect('/verification')

  // PERBAIKAN: Mengembalikan sintaks relasi ke 'passenger:passenger_id' sesuai skema asli Anda
  const { data: rides, error } = await supabase
    .from('rides')
    .select(`
      id, origin, destination, departure_time, available_seats, price, notes, status, created_at, is_recurring, recurring_days,
      bookings (
        id, passenger_id, status, created_at,
        passenger:passenger_id ( full_name, avatar_url, phone_number )
      )
    `)
    .eq('driver_id', user!.id)
    .order('departure_time', { ascending: false })

  // Mencegah error tertelan secara diam-diam
  if (error) {
    console.error("Supabase Query Error:", error.message)
  }

  async function updateRideStatus(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const rideId = formData.get('rideId') as string
    const newStatus = formData.get('status') as string
    await supabaseServer.from('rides').update({ status: newStatus }).eq('id', rideId)
    revalidatePath('/my-rides')
  }

  async function deleteRide(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const rideId = formData.get('rideId') as string
    await supabaseServer.from('rides').delete().eq('id', rideId)
    revalidatePath('/my-rides')
  }

  async function respondToBooking(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const bookingId = formData.get('bookingId') as string
    const rideId = formData.get('rideId') as string
    const action = formData.get('action') as 'approve' | 'reject'

    if (action === 'approve') {
      await supabaseServer.from('bookings').update({ status: 'accepted' }).eq('id', bookingId)
    } else if (action === 'reject') {
      await supabaseServer.from('bookings').update({ status: 'rejected' }).eq('id', bookingId)
      // Jika ditolak, kembalikan 1 kursi ke tabel rides
      const { data: ride } = await supabaseServer.from('rides').select('available_seats').eq('id', rideId).single()
      if (ride) {
        await supabaseServer.from('rides').update({ available_seats: ride.available_seats + 1 }).eq('id', rideId)
      }
    }
    revalidatePath('/my-rides')
  }

  return (
    <>
      <Navbar userName={profile?.full_name ?? undefined} avatarUrl={profile?.avatar_url ?? undefined} showAdminLink={profile?.role === 'admin'} />
      <div className="min-h-screen bg-gray-50 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <a href="/home" className="text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto">
                <House weight="duotone" className="w-5 h-5" /> Beranda
              </a>
              <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-2.5 mt-2 sm:mt-0">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <CarProfile weight="duotone" className="w-7 h-7 text-indigo-600" />
                </div>
                Tumpangan Saya
              </h1>
            </div>
            <a href="/offer-ride" className="bg-linear-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all text-sm flex items-center justify-center gap-2 shadow-md w-full sm:w-auto">
              <PlusCircle weight="bold" className="w-5 h-5" /> Tawarkan Baru
            </a>
          </div>

          <MyRidesList
            rides={(rides as any) ?? []}
            updateRideStatus={updateRideStatus}
            deleteRide={deleteRide}
            respondToBooking={respondToBooking}
          />
        </main>
      </div>
    </>
  )
}