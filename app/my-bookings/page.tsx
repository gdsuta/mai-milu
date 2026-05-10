import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createServer } from '@/lib/supabase/server'
// Impor ikon SSR Phosphor
import { Ticket, CheckCircle, XCircle, MapPin, Flag, CalendarBlank, Clock, House, Coins, WhatsappLogo, User } from '@phosphor-icons/react/dist/ssr'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  pending:   { label: 'Menunggu',    icon: <Ticket weight="duotone" className="w-4 h-4" />,      bg: 'bg-blue-100',   text: 'text-blue-700'  },
  approved:  { label: 'Disetujui',   icon: <CheckCircle weight="fill" className="w-4 h-4" />,    bg: 'bg-green-100',  text: 'text-green-700' },
  rejected:  { label: 'Ditolak',     icon: <XCircle weight="duotone" className="w-4 h-4" />,     bg: 'bg-gray-200',   text: 'text-gray-600'  },
  cancelled: { label: 'Dibatalkan',  icon: <XCircle weight="duotone" className="w-4 h-4" />,     bg: 'bg-red-100',    text: 'text-red-700'   },
}

export default async function MyBookingsPage() {
  // PENGGUNAAN UTILITY KITA (Bersih & Aman)
  const supabase = await createServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('verification_status, full_name, avatar_url, role').eq('id', user.id).single()
  if (profile?.verification_status !== 'verified') redirect('/verification')

  // Tarik data pemesanan sekaligus detail tumpangan dan pengemudi
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, created_at,
      ride:ride_id (
        id, origin, destination, departure_time, price, available_seats, notes, status,
        driver:driver_id (id, full_name, avatar_url, phone_number)
      )
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false })

  // Server Action untuk membatalkan
  async function cancelBookingAction(formData: FormData) {
    'use server'
    const supabaseServer = await createServer()
    const { data: { user } } = await supabaseServer.auth.getUser()
    if (!user) return

    const bookingId = formData.get('bookingId') as string
    
    // Panggil RPC yang baru saja kita buat di langkah 1
    await (supabaseServer.rpc as any)('cancel_booking', {
      p_booking_id: bookingId,
      p_passenger_id: user.id,
    })
    
    revalidatePath('/my-bookings')
  }

  const activeBookings    = bookings?.filter(b => b.status !== 'cancelled' && b.status !== 'rejected') ?? []
  const historyBookings   = bookings?.filter(b => b.status === 'cancelled' || b.status === 'rejected') ?? []

  return (
    <>
      <Navbar userName={profile?.full_name ?? undefined} avatarUrl={profile?.avatar_url ?? undefined} showAdminLink={profile?.role === 'admin'} />
      <div className="min-h-screen bg-gray-50 pb-12 pt-6">
        <main className="max-w-2xl mx-auto p-4 mt-2">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                <House weight="duotone" className="w-5 h-5" /> Beranda
              </Link>
              <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-2.5">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Ticket weight="duotone" className="w-7 h-7 text-indigo-600" />
                </div>
                Pemesanan
              </h1>
            </div>
          </div>

          {/* Empty state */}
          {!bookings || bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
              <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <Ticket weight="duotone" className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Belum ada pemesanan</h3>
              <p className="text-gray-500 text-sm font-medium mb-6">Temukan tumpangan yang cocok dan pesan kursi Anda sekarang.</p>
              <Link href="/home" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                Cari Tumpangan
              </Link>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Pemesanan Aktif */}
              {activeBookings.length > 0 && (
                <section>
                  <h2 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    Pesanan Aktif ({activeBookings.length})
                  </h2>
                  <div className="space-y-4">
                    {activeBookings.map((booking: any) => {
                      const ride = booking.ride
                      const driver = ride?.driver
                      const dateObj = ride ? new Date(ride.departure_time) : null
                      const tanggal = dateObj?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
                      const jam = dateObj?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      
                      const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
                      let waNumber = driver?.phone_number?.replace(/[^0-9]/g, '') ?? ''
                      if (waNumber.startsWith('0')) waNumber = '62' + waNumber.substring(1)
                      const isRidePast = dateObj ? dateObj < new Date() : false

                      return (
                        <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                          
                          {/* Baris Atas: Badge & Tanggal Buat */}
                          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text}`}>
                              {statusCfg.icon} {statusCfg.label}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                              Dipesan: {new Date(booking.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>

                          {/* Info Driver */}
                          {driver && (
                            <Link href={`/driver/${driver.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                              {driver.avatar_url ? (
                                <img src={driver.avatar_url} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Driver" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-gray-400" /></div>
                              )}
                              <div>
                                <p className="font-bold text-gray-800 text-lg leading-tight">{driver.full_name}</p>
                                <p className="text-[11px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-md border border-green-200 inline-block mt-1">Pengemudi Terverifikasi</p>
                              </div>
                            </Link>
                          )}

                          {/* Rute & Waktu */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2.5">
                                <MapPin weight="duotone" className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span className="font-bold text-gray-800 text-sm leading-snug">{ride?.origin}</span>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <Flag weight="duotone" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <span className="font-bold text-gray-800 text-sm leading-snug">{ride?.destination}</span>
                              </div>
                            </div>
                            <div className="sm:border-l border-gray-200 sm:pl-4 space-y-1.5 flex flex-col justify-center">
                              <p className="text-xs text-gray-600 font-medium flex items-center gap-2"><CalendarBlank weight="duotone" className="w-4 h-4 text-gray-400" /> {tanggal}</p>
                              <p className="text-xs text-gray-600 font-medium flex items-center gap-2"><Clock weight="duotone" className="w-4 h-4 text-gray-400" /> {jam} WITA</p>
                              <p className="text-xs font-black text-blue-600 mt-1 flex items-center gap-2">
                                <Coins weight="duotone" className="w-4 h-4" /> {ride?.price === 0 ? 'GRATIS' : `Rp ${ride?.price?.toLocaleString('id-ID')}`}
                              </p>
                            </div>
                          </div>

                          {/* Tombol Aksi */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {waNumber && (
                              <a href={`https://wa.me/${waNumber}?text=Halo! Saya sudah memesan kursi untuk tumpangan ${ride?.origin} menuju ${ride?.destination} pada ${tanggal}. Mohon konfirmasinya.`} target="_blank" rel="noopener noreferrer"
                                className="flex-1 bg-[#25D366] text-white text-sm font-bold py-3 rounded-xl text-center hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <WhatsappLogo weight="fill" className="w-5 h-5" /> Chat Pengemudi
                              </a>
                            )}

                            {/* Hanya bisa dibatalkan jika masih pending/approved dan belum lewat waktu */}
                            {(booking.status === 'pending' || booking.status === 'approved') && !isRidePast && (
                              <form action={cancelBookingAction}>
                                <input type="hidden" name="bookingId" value={booking.id} />
                                <button type="submit" className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shadow-sm">
                                  Batal
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Riwayat (Dibatalkan/Ditolak) */}
              {historyBookings.length > 0 && (
                <section>
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4 px-1 border-t border-gray-200 pt-6">
                    Riwayat ({historyBookings.length})
                  </h2>
                  <div className="space-y-3">
                    {historyBookings.map((booking: any) => {
                      const ride = booking.ride
                      const statusCfg = STATUS_CONFIG[booking.status]
                      
                      return (
                        <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 opacity-75 hover:opacity-100 transition-opacity">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 truncate">
                              <MapPin weight="fill" className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate">{ride?.origin}</span>
                              <span className="text-gray-300 mx-1">→</span>
                              <span className="truncate">{ride?.destination}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max ${statusCfg.bg} ${statusCfg.text}`}>
                              {statusCfg.icon} {statusCfg.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

            </div>
          )}
        </main>
      </div>
    </>
  )
}