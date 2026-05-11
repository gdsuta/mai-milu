import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import ChatRoom from '@/components/ChatRoom'
import { CaretLeft, User } from '@phosphor-icons/react/dist/ssr'

export default async function ChatPage({ params }: { params: { bookingId: string } }) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // PERBAIKAN: Menggunakan relasi standar 'rides' dan 'profiles' tanpa alias kompleks
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id, passenger_id, status,
      rides ( driver_id, origin, destination ),
      profiles ( full_name, avatar_url )
    `)
    .eq('id', params.bookingId)
    .single()

  // Mencegah silent error dengan menampilkannya di log server
  if (error || !booking) {
    console.error("Chat Fetch Error:", error?.message)
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

  const ride = booking.rides as any
  const passenger = booking.profiles as any
  
  // Ekstrak profil pengemudi secara manual agar kueri utama tidak berat
  const { data: driver } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', ride.driver_id)
    .single()

  // Keamanan: Pastikan yang membuka halaman ini HANYA pengemudi atau penumpang
  const isPassenger = user.id === booking.passenger_id
  const isDriver = user.id === ride.driver_id

  if (!isPassenger && !isDriver) {
    redirect('/home') // Tendang pengguna yang mencoba mengintip chat
  }

  // Tentukan siapa "Lawan Bicara" (Other User) di chat ini
  const otherUserName = isDriver ? passenger.full_name : driver?.full_name
  const otherUserAvatar = isDriver ? passenger.avatar_url : driver?.avatar_url
  
  // Tentukan rute kembali (Back button)
  const backRoute = isDriver ? '/my-rides' : '/my-bookings'

  // Ambil riwayat pesan yang sudah ada (menggunakan 'as any' untuk bypass TypeScript sementara)
  const { data: messages } = await (supabase as any)
    .from('messages')
    .select('*')
    .eq('booking_id', params.bookingId)
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
        bookingId={params.bookingId}
        currentUserId={user.id}
        otherUserName={otherUserName}
        otherUserAvatar={otherUserAvatar}
        initialMessages={messages || []}
      />
    </div>
  )
}