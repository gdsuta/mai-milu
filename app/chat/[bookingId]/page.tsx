import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import ChatRoom from '@/components/ChatRoom'
import { CaretLeft, User } from '@phosphor-icons/react/dist/ssr'

// PERBAIKAN 1: params harus didefinisikan sebagai Promise
export default async function ChatPage({ params }: { params: Promise<{ bookingId: string }> }) {
  // WAJIB di-await untuk mendapatkan ID yang benar
  const { bookingId } = await params
  
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // PERBAIKAN 2: Gunakan sintaks relasi yang terbukti sukses di app/my-rides/page.tsx
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id, passenger_id, status,
      ride:ride_id ( driver_id, origin, destination ),
      passenger:passenger_id ( full_name, avatar_url )
    `)
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    console.error("Chat Fetch Error:", error?.message || "Booking tidak ditemukan di database.")
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-gray-800">Obrolan tidak ditemukan</h1>
        <p className="text-gray-500 text-sm mt-2">Pesanan mungkin sudah dihapus atau tidak valid.</p>
        <Link href="/home" className="mt-6 text-indigo-600 font-bold bg-white px-6 py-2 rounded-lg shadow-sm border border-gray-200">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const ride = booking.ride as any
  const passenger = booking.passenger as any
  
  const { data: driver } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', ride.driver_id)
    .single()

  const isPassenger = user.id === booking.passenger_id
  const isDriver = user.id === ride.driver_id

  if (!isPassenger && !isDriver) {
    redirect('/home')
  }

  const otherUserName = isDriver ? passenger.full_name : driver?.full_name
  const otherUserAvatar = isDriver ? passenger.avatar_url : driver?.avatar_url
  const backRoute = isDriver ? '/my-rides' : '/my-bookings'

  // FUNGSI BARU: Tandai semua pesan masuk sebagai "Telah Dibaca" saat obrolan dibuka
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('booking_id', bookingId)
    .neq('sender_id', user.id) // Hanya tandai pesan milik lawan bicara
    .eq('is_read', false)

  // Ambil riwayat pesan yang sudah ada untuk ditampilkan di ruang chat
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header Chat */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href={backRoute} className="text-gray-500 hover:text-indigo-600 transition-colors p-1 -ml-1">
            <CaretLeft weight="bold" className="w-6 h-6" />
          </Link>
          
          <div className="flex items-center gap-2.5">
            {otherUserAvatar ? (
              <img src={otherUserAvatar} alt={otherUserName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                <User weight="duotone" className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-sm leading-tight">{otherUserName}</span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5 truncate max-w-37.5 sm:max-w-xs">
                {ride.origin} → {ride.destination}
              </span>
            </div>
          </div>
        </div>

        {/* Lencana Status Pesanan */}
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider hidden sm:block ${
          booking.status === 'accepted' ? 'bg-green-100 text-green-700' : 
          booking.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {booking.status === 'accepted' ? 'Disetujui' : booking.status === 'pending' ? 'Menunggu' : booking.status}
        </span>
      </header>

      {/* Komponen Ruang Chat Utama */}
      <ChatRoom 
        bookingId={bookingId}
        currentUserId={user.id}
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        initialMessages={messages || []}
      />
    </div>
  )
}