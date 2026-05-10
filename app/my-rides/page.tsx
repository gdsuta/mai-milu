import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MyRidesList from '@/components/MyRidesList'
import { createServer } from '@/lib/supabase/server'
import { PlusCircle, House } from '@phosphor-icons/react/dist/ssr'

export default async function MyRidesPage() {
  const supabase = await createServer()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user!.id)
    .single()

  if (profile?.verification_status !== 'verified') redirect('/verification')

  // ── FIX 1: Fetch rides WITH their bookings + passenger profiles ──────────
  // This is what was missing — rides were fetched without the bookings join
  const { data: rides } = await supabase
    .from('rides')
    .select(`
      id, origin, destination, departure_time, available_seats,
      price, notes, status, created_at, is_recurring, recurring_days,
      bookings (
        id, passenger_id, status, created_at,
        passenger:passenger_id (
          full_name, avatar_url, phone_number
        )
      )
    `)
    .eq('driver_id', user!.id)
    .order('departure_time', { ascending: false })

  // ── Server actions ────────────────────────────────────────────────────────

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

  // ── FIX 2: Add the missing respondToBooking server action ────────────────
  // MyRidesList expects this prop but it was never defined or passed
  async function respondToBooking(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) return

    const bookingId = formData.get('bookingId') as string
    const action    = formData.get('action') as string  // 'approve' or 'reject'

    await (supabaseServer.rpc as any)('respond_to_booking', {
      p_booking_id: bookingId,
      p_driver_id:  user.id,
      p_action:     action,
    })

    revalidatePath('/my-rides')
  }

  return (
    <>
      <Navbar
        userName={profile?.full_name ?? undefined}
        avatarUrl={profile?.avatar_url ?? undefined}
        showAdminLink={profile?.role === 'admin'}
      />
      <div className="min-h-screen bg-gray-50 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/home" className="text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                <House weight="duotone" className="w-5 h-5" /> Beranda
              </Link>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tumpangan Saya</h1>
            </div>
            <Link href="/offer-ride" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 shadow-sm">
              <PlusCircle weight="bold" className="w-5 h-5" /> Tambah
            </Link>
          </div>

          {/* ── FIX 3: Pass respondToBooking as a prop ── */}
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