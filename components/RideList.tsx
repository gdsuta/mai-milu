'use client'

import { useState, useMemo, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import StarRatingModal from './StarRatingModal'
import StarDisplay from './StarDisplay'

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

// ─────────────────────────────────────────────
// RIDE MATCHING ALGORITHM
// Scores each ride 0-100 against the user home address + time.
// ─────────────────────────────────────────────
type MatchResult = { score: number; reasons: string[] }

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
  )
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
  if (hoursAway < 0)   return 0
  if (hoursAway <= 2)  return 40
  if (hoursAway <= 6)  return 30
  if (hoursAway <= 24) return 20
  if (hoursAway <= 72) return 10
  return 5
}

function scoreRide(ride: Ride, userAddress: string): MatchResult {
  const reasons: string[] = []
  let score = 0

  const rs = routeScore(ride, userAddress)
  if (rs >= 25) { reasons.push('Dekat lokasimu'); score += rs }
  else { score += rs }

  const ts = timeScore(ride.departure_time)
  score += ts
  const h = (new Date(ride.departure_time).getTime() - Date.now()) / 3600000
  if (h <= 2)  reasons.push('Segera berangkat')
  else if (h <= 6) reasons.push('Hari ini')

  if (ride.price === 0)        { reasons.push('Gratis'); score += 10 }
  else if (ride.price <= 10000) score += 5
  if (ride.available_seats >= 2) score += 5
  if (ride.is_recurring)       { reasons.push('Rutin'); score += 8 }

  return { score, reasons }
}

export default function RideList({ rides, currentUserId, userAddress, deleteRide }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'time' | 'price_asc' | 'price_desc'>('time')
  const [freeOnly, setFreeOnly] = useState(false)

  const [driverRatings, setDriverRatings] = useState<Record<string, DriverRating>>({})

  // Top 3 matched rides for this user (excludes own rides, min score > 5)
  const matchedRides = useMemo(() => {
    return rides
      .filter(r => r.driver_id !== currentUserId)
      .map(r => ({ ride: r, ...scoreRide(r, userAddress) }))
      .filter(r => r.score > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [rides, currentUserId, userAddress])
  const [myRatings, setMyRatings] = useState<Record<string, MyRating>>({})
  const [ratingModal, setRatingModal] = useState<RatingModal | null>(null)

  useEffect(() => {
    const driverIds = [...new Set(rides.map(r => r.driver_id))]
    if (driverIds.length === 0) return

    const fetchRatings = async () => {
      const { data: drData } = await supabase
        .from('driver_ratings')
        .select('driver_id, avg_score, total_ratings')
        .in('driver_id', driverIds)

      if (drData) {
        const map: Record<string, DriverRating> = {}
        drData.forEach(r => { map[r.driver_id] = r })
        setDriverRatings(map)
      }

      const rideIds = rides.map(r => r.id)
      const { data: myData } = await supabase
        .from('ratings')
        .select('ride_id, score, comment')
        .eq('passenger_id', currentUserId)
        .in('ride_id', rideIds)

      if (myData) {
        const map: Record<string, MyRating> = {}
        myData.forEach(r => { map[r.ride_id] = r })
        setMyRatings(map)
      }
    }

    fetchRatings()
  }, [rides, currentUserId])

  const handleRatingSubmitted = (driverId: string, rideId: string, newScore: number) => {
    setDriverRatings(prev => {
      const existing = prev[driverId]
      if (!existing) {
        return { ...prev, [driverId]: { driver_id: driverId, avg_score: newScore, total_ratings: 1 } }
      }
      const wasRated = !!myRatings[rideId]
      const total = wasRated ? existing.total_ratings : existing.total_ratings + 1
      const newAvg = wasRated
        ? ((existing.avg_score * existing.total_ratings) - myRatings[rideId].score + newScore) / existing.total_ratings
        : ((existing.avg_score * existing.total_ratings) + newScore) / total
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

  function clearFilters() {
    setSearch('')
    setSortBy('time')
    setFreeOnly(false)
  }

  const highlight = (text: string) => {
    if (!search.trim()) return text
    const q = search.trim()
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <>
      {/* ── Matched Rides Section ── */}
      {matchedRides.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h3 className="font-bold text-gray-800">Cocok untuk Anda</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Berdasarkan lokasi & waktu
            </span>
          </div>
          <div className="space-y-2">
            {matchedRides.map(({ ride, score, reasons }) => {
              const dateObj = new Date(ride.departure_time)
              const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              const tanggal = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
              let waNumber = ride.profiles?.phone_number.replace(/[^0-9]/g, '') ?? ''
              if (waNumber.startsWith('0')) waNumber = '62' + waNumber.substring(1)
              const driverRating = driverRatings[ride.driver_id] ?? null

              return (
                <div key={ride.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
                  {/* Driver + score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {ride.profiles?.avatar_url
                        ? <img src={ride.profiles.avatar_url} className="w-9 h-9 rounded-full object-cover border border-blue-200" alt="Driver" />
                        : <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-sm">👤</div>
                      }
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{ride.profiles?.full_name}</p>
                        {driverRating && (
                          <StarDisplay avgScore={driverRating.avg_score} totalRatings={driverRating.total_ratings} />
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-700">
                        {ride.price === 0 ? 'GRATIS' : `Rp ${ride.price.toLocaleString('id-ID')}`}
                      </p>
                      <p className="text-xs text-gray-500">{ride.available_seats} kursi</p>
                    </div>
                  </div>

                  {/* Route + time */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-400">📍</span>
                    <span className="font-semibold">{ride.origin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-semibold">{ride.destination}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>📅 {tanggal}</span>
                    <span>⏰ {jam} WITA</span>
                    {ride.is_recurring && <span className="text-purple-600 font-semibold">🔁 Rutin</span>}
                  </div>

                  {/* Match reason tags */}
                  {reasons.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {reasons.map((r, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                          {r}
                        </span>
                      ))}
                      <span className="text-xs bg-white text-blue-400 border border-blue-200 font-semibold px-2 py-0.5 rounded-full ml-auto">
                        Skor {score}
                      </span>
                    </div>
                  )}

                  {/* WhatsApp CTA */}
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 rounded-lg text-center transition flex items-center justify-center gap-2"
                  >
                    💬 Hubungi via WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 mb-1">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">Semua Tumpangan</span>
            <hr className="flex-1 border-gray-200" />
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari asal atau tujuan... (cth: Singaraja, Denpasar)"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Urutkan:</span>
          {([
            { value: 'time',       label: '⏰ Waktu Terdekat' },
            { value: 'price_asc',  label: '💰 Harga Termurah' },
            { value: 'price_desc', label: '💰 Harga Termahal' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                sortBy === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ml-auto ${
              freeOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
            }`}
          >
            🎁 Gratis Saja
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {filtered.length === rides.length ? `${rides.length} tumpangan tersedia` : `${filtered.length} dari ${rides.length} tumpangan`}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Hapus Filter ×</button>
          )}
        </div>
      </div>

      {/* Ride Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center mt-2">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {rides.length === 0 ? 'Belum ada tumpangan tersedia saat ini' : 'Tidak ada tumpangan yang cocok'}
          </h3>
          <p className="text-gray-500 mb-4">
            {rides.length === 0
              ? 'Tumpangan yang sudah lewat waktunya disembunyikan otomatis. Jadilah yang pertama menawarkan!'
              : 'Coba ubah kata pencarian atau hapus filter yang aktif.'}
          </p>
          {rides.length === 0 ? (
            <a href="/offer-ride" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition text-sm">➕ Tawarkan Tumpangan</a>
          ) : (
            <button onClick={clearFilters} className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition text-sm">Hapus Semua Filter</button>
          )}
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

            return (
              <div key={ride.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative overflow-hidden">
                {isOwner && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">Tumpangan Anda</div>
                )}
                {!isOwner && isExpiringSoon && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg animate-pulse">⚡ Segera Berangkat!</div>
                )}

                <div className="flex justify-between items-start border-b pb-4 mb-4 mt-2">
                  <div className="flex items-center gap-3">
                    {ride.profiles?.avatar_url ? (
                      <img src={ride.profiles.avatar_url} alt="Driver" className="w-12 h-12 rounded-full object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{ride.profiles?.full_name}</p>
                      <p className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Pengemudi Terverifikasi</p>
                      {ride.is_recurring && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 inline-block mt-1 ml-1">
                          🔁 Rutin
                        </span>
                      )}
                      <div className="mt-1">
                        <StarDisplay avgScore={driverRating?.avg_score ?? null} totalRatings={driverRating?.total_ratings ?? 0} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {ride.price === 0 ? 'GRATIS' : `Rp ${ride.price.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-sm text-gray-500">{ride.available_seats} Kursi Tersedia</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-500">📍</span>
                      <p className="font-semibold text-gray-800">{highlight(ride.origin)}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500">🏁</span>
                      <p className="font-semibold text-gray-800">{highlight(ride.destination)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">📅 {tanggal}</p>
                    <p className="text-sm text-gray-600 mb-1">⏰ {jam} WITA</p>
                    {ride.notes && (
                      <p className="text-sm text-gray-500 italic mt-2 border-t pt-2">"{ride.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex flex-wrap justify-center gap-2">
                  {isOwner ? (
                    <form action={deleteRide} className="w-full md:w-auto">
                      <input type="hidden" name="rideId" value={ride.id} />
                      <button type="submit" className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 border border-red-200 w-full md:w-auto transition flex items-center justify-center gap-2 text-sm">
                        🗑️ Hapus
                      </button>
                    </form>
                  ) : (
                    <>
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 flex-1 md:flex-none transition flex items-center justify-center gap-2 text-sm"
                      >
                        💬 WhatsApp
                      </a>
                      <button
                        onClick={() => setRatingModal({
                          rideId: ride.id,
                          driverId: ride.driver_id,
                          driverName: ride.profiles?.full_name ?? 'Pengemudi',
                          driverAvatar: ride.profiles?.avatar_url ?? null,
                          existing: myRating,
                        })}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border transition flex items-center gap-1 ${
                          myRating
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {myRating ? `★ ${myRating.score}/5` : '☆ Beri Ulasan'}
                      </button>
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
          rideId={ratingModal.rideId}
          driverId={ratingModal.driverId}
          driverName={ratingModal.driverName}
          driverAvatar={ratingModal.driverAvatar}
          existingRating={ratingModal.existing}
          onClose={() => setRatingModal(null)}
          onSubmitted={(score) => {
            handleRatingSubmitted(ratingModal.driverId, ratingModal.rideId, score)
            setRatingModal(null)
          }}
        />
      )}
    </>
  )
}
