'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarRatingModal from './StarRatingModal'
import StarDisplay from './StarDisplay'
import BookingButton from './BookingButton' // <-- IMPORT KOMPONEN BARU KITA
import { Target, User, ArrowsClockwise, MapPin, Flag, CalendarBlank, Clock, MagnifyingGlass, Coins, Gift, Lightning, Trash, WhatsappLogo, PlusCircle, X } from '@phosphor-icons/react'

type Ride = {
  id: string
  driver_id: string
  origin: string
  destination: string
  departure_time: string
  available_seats: number
  price: number
  notes: string | null
  status: string
  is_recurring: boolean
  recurring_days: string[] | null
  profiles: {
    full_name: string
    avatar_url: string | null
    phone_number: string
  } | null
}

type DriverRating = {
  driver_id: string
  avg_score: number
  total_ratings: number
}

type MyRating = {
  ride_id: string
  score: number
  comment: string | null
}

// Tambahan tipe untuk data pemesanan saya di Beranda
type MyBooking = {
  id: string
  ride_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}

type RatingModal = {
  rideId: string
  driverId: string
  driverName: string
  driverAvatar: string | null
  existing: { score: number; comment: string | null } | null
}

type Props = {
  rides: Ride[]
  currentUserId: string
  userAddress: string
  deleteRide: (formData: FormData) => Promise<void>
}

// ... [LOGIKA RIDE MATCHING ALGORITHM TETAP SAMA] ...
type MatchResult = { score: number; reasons: string[] }

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2))
}

function routeScore(ride: Ride, userAddress: string): number {
  if (!userAddress) return 0
  const addrTokens = tokenize(userAddress)
  const origTokens = tokenize(ride.origin)
  const destTokens = tokenize(ride.destination)
  let originHits = 0, destHits = 0
  for (const t of addrTokens) {
    if (origTokens.has(t)) originHits++
    if (destTokens.has(t)) destHits++
  }
  return Math.min(100, originHits * 25 + destHits * 10)
}

function timeScore(departureTime: string): number {
  const hoursAway = (new Date(departureTime).getTime() - Date.now()) / 3600000
  if (hoursAway < 0) return 0
  if (hoursAway <= 2) return 40
  if (hoursAway <= 6) return 30
  if (hoursAway <= 24) return 20
  if (hoursAway <= 72) return 10
  return 5
}

function scoreRide(ride: Ride, userAddress: string): MatchResult {
  const reasons: string[] = []
  let score = 0
  const rs = routeScore(ride, userAddress)
  
  if (rs >= 25) { reasons.push('Dekat lokasimu'); score += rs } else { score += rs }
  const ts = timeScore(ride.departure_time)
  score += ts
  
  const h = (new Date(ride.departure_time).getTime() - Date.now()) / 3600000
  if (h <= 2) reasons.push('Segera berangkat')
  else if (h <= 6) reasons.push('Hari ini')
  
  if (ride.price === 0) { reasons.push('Gratis'); score += 10 } else if (ride.price <= 10000) { score += 5 }
  if (ride.available_seats >= 2) score += 5
  if (ride.is_recurring) { reasons.push('Rutin'); score += 8 }
  return { score, reasons }
}

export default function RideList({ rides, currentUserId, userAddress, deleteRide }: Props) {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'time' | 'price_asc' | 'price_desc'>('time')
  const [freeOnly, setFreeOnly] = useState(false)
  
  const [driverRatings, setDriverRatings] = useState<Record<string, DriverRating>>({})
  const [myRatings, setMyRatings] = useState<Record<string, MyRating>>({})
  const [myBookings, setMyBookings] = useState<Record<string, MyBooking>>({}) // State baru
  const [ratingModal, setRatingModal] = useState<RatingModal | null>(null)

  const matchedRides = useMemo(() => {
    return rides
      .filter(r => r.driver_id !== currentUserId)
      .map(r => ({ ride: r, ...scoreRide(r, userAddress) }))
      .filter(r => r.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [rides, currentUserId, userAddress])

  useEffect(() => {
    const driverIds = [...new Set(rides.map(r => r.driver_id))]
    if (driverIds.length === 0) return

    const fetchRatingsAndBookings = async () => {
      // 1. Ambil Rating Pengemudi
      const { data: drData } = await supabase.from('driver_ratings').select('driver_id, avg_score, total_ratings').in('driver_id', driverIds)
      if (drData) {
        const map: Record<string, DriverRating> = {}
        drData.forEach((r) => { if (r.driver_id) map[r.driver_id] = { driver_id: r.driver_id, avg_score: r.avg_score ?? 0, total_ratings: r.total_ratings ?? 0 } })
        setDriverRatings(map)
      }

      const rideIds = rides.map(r => r.id)
      
      // 2. Ambil Rating Saya
      const { data: myData } = await supabase.from('ratings').select('ride_id, score, comment').eq('passenger_id', currentUserId).in('ride_id', rideIds)
      if (myData) {
        const map: Record<string, MyRating> = {}
        myData.forEach((r) => { if (r.ride_id && r.score !== null) map[r.ride_id] = { ride_id: r.ride_id, score: r.score, comment: r.comment ?? null } })
        setMyRatings(map)
      }

      // 3. Ambil Pesanan Saya (Baru!)
      const { data: bookingsData } = await supabase.from('bookings').select('id, ride_id, status').eq('passenger_id', currentUserId).in('ride_id', rideIds)
      if (bookingsData) {
        const map: Record<string, MyBooking> = {}
        // Simpan pesanan aktif, jika 'cancelled', abaikan agar bisa pesan lagi
        bookingsData.forEach((b) => { if (b.ride_id && b.status !== 'cancelled') map[b.ride_id] = b as MyBooking })
        setMyBookings(map)
      }
    }

    fetchRatingsAndBookings()
  }, [rides, currentUserId, supabase])

  const handleRatingSubmitted = (driverId: string, rideId: string, newScore: number) => {
    setDriverRatings(prev => {
      const existing = prev[driverId]
      if (!existing) return { ...prev, [driverId]: { driver_id: driverId, avg_score: newScore, total_ratings: 1 } }
      const wasRated = !!myRatings[rideId]
      const total = wasRated ? existing.total_ratings : existing.total_ratings + 1
      const newAvg = wasRated ? ((existing.avg_score * existing.total_ratings) - myRatings[rideId].score + newScore) / existing.total_ratings : ((existing.avg_score * existing.total_ratings) + newScore) / total
      return { ...prev, [driverId]: { driver_id: driverId, avg_score: Math.round(newAvg * 10) / 10, total_ratings: total } }
    })
    setMyRatings(prev => ({ ...prev, [rideId]: { ride_id: rideId, score: newScore, comment: null } }))
  }

  const filtered = useMemo(() => {
    let result = [...rides]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(r => r.origin.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q))
    }
    if (freeOnly) result = result.filter(r => r.price === 0)
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
    else result.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
    return result
  }, [rides, search, sortBy, freeOnly])

  const hasActiveFilters = search.trim() !== '' || freeOnly || sortBy !== 'time'
  function clearFilters() { setSearch(''); setSortBy('time'); setFreeOnly(false) }

  const highlight = (text: string) => {
    if (!search.trim()) return text
    const q = search.trim()
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 text-gray-900 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>
  }

  return (
    <>
      {/* ... [KOMPONEN MATCHED RIDES DAN FILTER SAMA DENGAN SEBELUMNYA] ... */}
      
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 space-y-4">
        <div className="relative">
          <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari asal atau tujuan... (cth: Singaraja)" className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"><X weight="bold" className="w-4 h-4" /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Urutkan:</span>
          {([{ value: 'time', label: 'Waktu Terdekat', icon: <Clock weight="duotone" className="w-4 h-4 mr-1.5 inline-block" /> }, { value: 'price_asc', label: 'Harga Termurah', icon: <Coins weight="duotone" className="w-4 h-4 mr-1.5 inline-block" /> }, { value: 'price_desc', label: 'Harga Termahal', icon: <Coins weight="duotone" className="w-4 h-4 mr-1.5 inline-block" /> } ] as const).map(opt => (
            <button key={opt.value} onClick={()=>setSortBy(opt.value)} className={`text-xs px-3.5 py-2 rounded-full font-semibold border transition-all flex items-center ${sortBy===opt.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-400 hover:bg-white'}`}>{opt.icon} {opt.label}</button>
          ))}
          <button onClick={()=>setFreeOnly(!freeOnly)} className={`text-xs px-3.5 py-2 rounded-full font-semibold border transition-all flex items-center ml-auto ${freeOnly ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-green-50 text-green-700 border-green-200 hover:border-green-400 hover:bg-white'}`}><Gift weight="duotone" className="w-4 h-4 mr-1.5 inline-block" /> Gratis Saja</button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">{filtered.length === rides.length ? `${rides.length} tumpangan tersedia` : `${filtered.length} dari ${rides.length} tumpangan`}</p>
          {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">Hapus Filter <X weight="bold" className="w-3 h-3" /></button>}
        </div>
      </div>

      {/* Ride Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center mt-2">
          <MagnifyingGlass weight="duotone" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">{rides.length === 0 ? 'Belum ada tumpangan tersedia saat ini' : 'Tidak ada tumpangan yang cocok'}</h3>
          <p className="text-gray-500 mb-6 text-sm">{rides.length === 0 ? 'Jadilah yang pertama menawarkan!' : 'Coba ubah kata pencarian atau hapus filter yang aktif.'}</p>
          {rides.length === 0 ? <a href="/offer-ride" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"><PlusCircle weight="bold" className="w-5 h-5" /> Tawarkan Tumpangan</a> : <button onClick={clearFilters} className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">Hapus Semua Filter</button>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ride) => {
            const dateObj = new Date(ride.departure_time)
            const tanggal = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
            const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            const isOwner = currentUserId === ride.driver_id
            const isExpiringSoon = Math.floor((dateObj.getTime() - Date.now()) / 60000) <= 120
            
            let waNumber = ride.profiles?.phone_number.replace(/[^0-9]/g, '') || ''
            if (waNumber.startsWith('0')) waNumber = '62' + waNumber.substring(1)
            
            const driverRating = driverRatings[ride.driver_id] ?? null
            const myRating = myRatings[ride.id] ?? null
            const myBooking = myBookings[ride.id] ?? null

            return (
              <div key={ride.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative overflow-hidden group">
                {isOwner && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3.5 py-1.5 rounded-bl-xl shadow-sm">Tumpangan Anda</div>}
                {!isOwner && isExpiringSoon && <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-bl-xl shadow-sm animate-pulse flex items-center gap-1.5"><Lightning weight="fill" className="w-3.5 h-3.5" /> Segera Berangkat!</div>}

                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4 mt-2">
                  <div className="flex items-center gap-3.5">
                    {ride.profiles?.avatar_url ? (
                      <img src={ride.profiles.avatar_url} alt="Driver" className="w-12 h-12 rounded-full object-cover border border-gray-200"/>
                    ) : (
                      <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center"><User weight="duotone" className="w-6 h-6 text-gray-400" /></div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 text-lg leading-tight">{ride.profiles?.full_name}</p>
                      <div className="flex items-center flex-wrap gap-2 mt-1.5">
                        <span className="text-[11px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-md border border-green-200">Terverifikasi</span>
                        {ride.is_recurring && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1"><ArrowsClockwise weight="bold" className="w-3 h-3" /> Rutin</span>}
                      </div>
                      <div className="mt-1.5"><StarDisplay avgScore={driverRating?.avg_score ?? null} totalRatings={driverRating?.total_ratings ?? 0}/></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-600 tracking-tight">{ride.price === 0 ? 'GRATIS' : `Rp ${ride.price.toLocaleString('id-ID')}`}</p>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{ride.available_seats} Kursi Tersedia</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-50 p-1.5 rounded-md mt-0.5"><MapPin weight="duotone" className="w-4 h-4 text-indigo-600" /></div>
                      <div><p className="text-xs text-gray-400 font-medium mb-0.5">Berangkat dari</p><p className="font-bold text-gray-800">{highlight(ride.origin)}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-red-50 p-1.5 rounded-md mt-0.5"><Flag weight="duotone" className="w-4 h-4 text-red-500" /></div>
                      <div><p className="text-xs text-gray-400 font-medium mb-0.5">Tujuan ke</p><p className="font-bold text-gray-800">{highlight(ride.destination)}</p></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-center">
                    <p className="text-sm text-gray-700 mb-2 font-medium flex items-center gap-2.5"><CalendarBlank weight="duotone" className="w-5 h-5 text-gray-400" /> {tanggal}</p>
                    <p className="text-sm text-gray-700 mb-1 font-medium flex items-center gap-2.5"><Clock weight="duotone" className="w-5 h-5 text-gray-400" /> {jam} WITA</p>
                    {ride.notes && <div className="mt-3 pt-3 border-t border-gray-200"><p className="text-sm text-gray-500 italic leading-relaxed">"{ride.notes}"</p></div>}
                  </div>
                </div>
                
                {/* ACTIONS */}
                <div className="mt-5 flex flex-col gap-2">
                  {isOwner ? (
                    <div className="flex justify-end border-t border-gray-100 pt-4">
                      <form action={deleteRide} className="w-full md:w-auto">
                        <input type="hidden" name="rideId" value={ride.id}/>
                        <button type="submit" className="bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-bold hover:bg-red-100 border border-red-200 w-full md:w-auto transition-colors flex items-center justify-center gap-2 text-sm"><Trash weight="bold" className="w-4 h-4" /> Hapus Jadwal</button>
                      </form>
                    </div>
                  ) : (
                    <>
                      {/* KOMPONEN TOMBOL PESAN PINTAR KITA DISUNTIKKAN DI SINI */}
                      <BookingButton 
                        rideId={ride.id}
                        driverId={ride.driver_id}
                        currentUserId={currentUserId}
                        availableSeats={ride.available_seats}
                        initialBookingStatus={myBooking ? myBooking.status : 'none'}
                        initialBookingId={myBooking ? myBooking.id : null}
                        driverPhone={ride.profiles?.phone_number || ''}
                      />
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={()=>setRatingModal({ rideId: ride.id, driverId: ride.driver_id, driverName: ride.profiles?.full_name ?? 'Pengemudi', driverAvatar: ride.profiles?.avatar_url ?? null, existing: myRating })}
                              className={`px-4 py-2 rounded-lg font-bold text-xs border transition-all flex items-center gap-1.5 ${myRating ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                          {myRating ? `★ ${myRating.score}/5 Ulasan Anda` : '☆ Beri Ulasan'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <StarRatingModal
          rideId={ratingModal.rideId} driverId={ratingModal.driverId} driverName={ratingModal.driverName} driverAvatar={ratingModal.driverAvatar} existingRating={ratingModal.existing}
          onClose={()=>setRatingModal(null)} onSubmitted={(score) => { handleRatingSubmitted(ratingModal.driverId, ratingModal.rideId, score); setRatingModal(null) }}
        />
      )}
    </>
  )
}