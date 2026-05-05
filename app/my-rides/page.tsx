import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Navbar from '@/components/Navbar'
import MyRidesList from '@/components/MyRidesList'

export default async function MyRidesPage() {
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
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') redirect('/verification')

  // Fetch ALL of the driver's rides (all statuses, all times)
  const { data: rides } = await supabase
    .from('rides')
    .select('id, origin, destination, departure_time, available_seats, price, notes, status, created_at')
    .eq('driver_id', user.id)
    .order('departure_time', { ascending: false })

  async function updateRideStatus(formData: FormData) {
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
    const newStatus = formData.get('status') as string
    await supabaseServer.from('rides').update({ status: newStatus }).eq('id', rideId)
    revalidatePath('/my-rides')
  }

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
    revalidatePath('/my-rides')
  }

  return (
    <>
      <Navbar
        userName={profile?.full_name}
        avatarUrl={profile?.avatar_url}
        showAdminLink={profile?.role === 'admin'}
      />
      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <a
                href="/home"
                className="text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition flex items-center gap-1"
              >
                ← Beranda
              </a>
              <h1 className="text-2xl font-bold text-gray-800">🚗 Tumpangan Saya</h1>
            </div>
            <a
              href="/offer-ride"
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition text-sm flex items-center gap-1"
            >
              ➕ Tambah
            </a>
          </div>

          <MyRidesList
            rides={(rides as any) ?? []}
            updateRideStatus={updateRideStatus}
            deleteRide={deleteRide}
          />
        </main>
      </div>
    </>
  )
}