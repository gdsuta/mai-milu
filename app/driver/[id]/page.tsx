import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DriverProfile from '@/components/DriverProfile'

type Props = {
  params: Promise<{ id: string }>
}

export default async function DriverProfilePage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch (error) {}
        }
      }
    }
  )

  // Auth check — must be logged in to view profiles
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('verification_status, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.verification_status !== 'verified') redirect('/verification')

  // ── Fetch the driver's public profile ─────────────────────────────────────
  const { data: driver } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, verification_status, role')
    .eq('id', id)
    .single()

  if (!driver || driver.verification_status !== 'verified') notFound()

  // ── Fetch driver's aggregate rating ───────────────────────────────────────
  const { data: ratingData } = await supabase
    .from('driver_ratings')
    .select('avg_score, total_ratings')
    .eq('driver_id', id)
    .single()

  // ── Fetch recent reviews (with commenter name) ────────────────────────────
  const { data: reviews } = await supabase
    .from('ratings')
    .select(`
      id, score, comment, created_at,
      passenger:passenger_id (full_name, avatar_url)
    `)
    .eq('driver_id', id)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // ── Fetch score distribution (for the rating breakdown bar) ───────────────
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('score')
    .eq('driver_id', id)

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allRatings?.filter(r => r.score === star).length ?? 0,
  }))

  // ── Fetch completed rides (public history) ────────────────────────────────
  const { data: completedRides } = await supabase
    .from('rides')
    .select('id, origin, destination, departure_time, price, available_seats, is_recurring, recurring_days')
    .eq('driver_id', id)
    .eq('status', 'selesai')
    .order('departure_time', { ascending: false })
    .limit(5)

  // ── Fetch upcoming active rides ────────────────────────────────────────────
  const now = new Date().toISOString()
  const { data: upcomingRides } = await supabase
    .from('rides')
    .select('id, origin, destination, departure_time, price, available_seats, is_recurring, recurring_days')
    .eq('driver_id', id)
    .eq('status', 'tersedia')
    .gte('departure_time', now)
    .order('departure_time', { ascending: true })
    .limit(5)

  // ── Ride stats ─────────────────────────────────────────────────────────────
  const { count: totalRides } = await supabase
    .from('rides')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', id)
    .eq('status', 'selesai')

  const { count: cancelledRides } = await supabase
    .from('rides')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', id)
    .eq('status', 'dibatalkan')

  return (
    <>
      <Navbar 
		userName={profile?.full_name ?? undefined} 
		avatarUrl={profile?.avatar_url ?? undefined} 
		showAdminLink={profile?.role === 'admin'} 
		/>
      <div className="min-h-screen bg-gray-100 pb-12 pt-6">
        <main className="max-w-2xl mx-auto p-4 mt-2">
          <DriverProfile
            driver={driver}
            avgScore={ratingData?.avg_score ?? null}
            totalRatings={ratingData?.total_ratings ?? 0}
            distribution={distribution}
            reviews={(reviews as any) ?? []}
            completedRides={(completedRides as any) ?? []}
            upcomingRides={(upcomingRides as any) ?? []}
            totalCompleted={totalRides ?? 0}
            totalCancelled={cancelledRides ?? 0}
            isOwnProfile={user.id === id}
          />
        </main>
      </div>
    </>
  )
}
