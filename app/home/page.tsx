import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import RideList from '@/components/RideList'

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
    .select('verification_status, full_name, avatar_url, role, home_address')
    .eq('id', user.id)
    .single()

  if (profile?.verification_status !== 'verified') {
    redirect('/verification')
  }

  // Fetch all future available rides once on the server.
  // RideList handles search/filter/sort on the client with no extra round-trips.
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
      <Navbar
        userName={profile?.full_name}
        avatarUrl={profile?.avatar_url}
        showAdminLink={profile?.role === 'admin'}
      />

      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        <main className="max-w-3xl mx-auto p-4 mt-2">

          <div className="mb-6">
            <Link
              href="/offer-ride"
              className="w-full bg-green-600 text-white px-4 py-4 rounded-xl font-bold hover:bg-green-700 shadow-md transition flex items-center justify-center gap-2 text-lg"
            >
              <span className="text-xl">➕</span> Tawarkan Tumpangan
            </Link>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tumpangan Tersedia</h2>
          </div>

          <RideList
            rides={(rides as any) ?? []}
            currentUserId={user.id}
            userAddress={profile?.home_address ?? ''}
            deleteRide={deleteRide}
          />

        </main>
      </div>
    </>
  )
}
