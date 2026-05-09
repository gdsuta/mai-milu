'use client'

import { useState } from 'react'
import Link from 'next/link'

type Driver = {
  id: string
  full_name: string
  avatar_url: string | null
  verification_status: string
  role: string
}

type Review = {
  id: string
  score: number
  comment: string | null
  created_at: string
  passenger: { full_name: string; avatar_url: string | null } | null
}

type Ride = {
  id: string
  origin: string
  destination: string
  departure_time: string
  price: number
  available_seats: number
  is_recurring: boolean
  recurring_days: string[] | null
}

type DistributionItem = { star: number; count: number }

type Props = {
  driver: Driver
  avgScore: number | null
  totalRatings: number
  distribution: DistributionItem[]
  reviews: Review[]
  completedRides: Ride[]
  upcomingRides: Ride[]
  totalCompleted: number
  totalCancelled: number
  isOwnProfile: boolean
}

const STAR_LABELS: Record<number, string> = {
  5: 'Luar biasa',
  4: 'Memuaskan',
  3: 'Cukup baik',
  2: 'Kurang memuaskan',
  1: 'Sangat buruk',
}

function StarRow({ count, star, maxCount }: { count: number; star: number; maxCount: number }) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-gray-600 font-medium">{star}</span>
      <span className="text-yellow-400">★</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-gray-500">{count}</span>
    </div>
  )
}

function RideCard({ ride, type }: { ride: Ride; type: 'completed' | 'upcoming' }) {
  const dateObj = new Date(ride.departure_time)
  const tanggal = dateObj.toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
  const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-blue-400 text-sm">📍</span>
          <span className="font-semibold text-gray-800 text-sm truncate">{ride.origin}</span>
          <span className="text-gray-400 text-xs">→</span>
          <span className="font-semibold text-gray-800 text-sm truncate">{ride.destination}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span>📅 {tanggal}</span>
          <span>⏰ {jam} WITA</span>
          {ride.is_recurring && (
            <span className="text-purple-600 font-semibold">🔁 Rutin</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-blue-700 text-sm">
          {ride.price === 0 ? 'GRATIS' : `Rp ${ride.price.toLocaleString('id-ID')}`}
        </p>
        {type === 'completed' && (
          <span className="text-xs text-green-600 font-semibold">✅ Selesai</span>
        )}
        {type === 'upcoming' && (
          <span className="text-xs text-blue-600 font-semibold">
            {ride.available_seats} kursi
          </span>
        )}
      </div>
    </div>
  )
}

export default function DriverProfile({
  driver, avgScore, totalRatings, distribution, reviews,
  completedRides, upcomingRides, totalCompleted, totalCancelled, isOwnProfile
}: Props) {
  const [activeTab, setActiveTab] = useState<'ulasan' | 'riwayat' | 'mendatang'>('ulasan')

  const maxCount = Math.max(...distribution.map(d => d.count), 1)
  const completionRate = totalCompleted + totalCancelled > 0
    ? Math.round((totalCompleted / (totalCompleted + totalCancelled)) * 100)
    : null

  const filledStars = avgScore ? Math.round(avgScore) : 0

  return (
    <div className="space-y-4">

      {/* ── Back button ── */}
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm transition"
      >
        ← Kembali ke Beranda
      </Link>

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        {isOwnProfile && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 mb-4 text-xs text-blue-700 font-semibold text-center">
            Ini adalah halaman profil publik Anda — seperti yang dilihat penumpang lain
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Avatar */}
          {driver.avatar_url ? (
            <img
              src={driver.avatar_url}
              alt={driver.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
              👤
            </div>
          )}

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{driver.full_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✅ Pengemudi Terverifikasi
              </span>
              {driver.role === 'admin' && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  🛡️ Admin
                </span>
              )}
            </div>

            {/* Star summary */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <span
                    key={s}
                    className={`text-xl ${s <= filledStars ? 'text-yellow-400' : 'text-gray-200'}`}
                  >★</span>
                ))}
              </div>
              {avgScore ? (
                <span className="text-lg font-bold text-gray-800">{avgScore.toFixed(1)}</span>
              ) : null}
              <span className="text-sm text-gray-400">
                ({totalRatings} {totalRatings === 1 ? 'ulasan' : 'ulasan'})
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">{totalCompleted}</p>
            <p className="text-xs text-gray-500 mt-0.5">Perjalanan Selesai</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-black text-gray-900">
              {completionRate !== null ? `${completionRate}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Tingkat Penyelesaian</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">
              {avgScore ? avgScore.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Rating Rata-rata</p>
          </div>
        </div>
      </div>

      {/* ── Rating distribution ── */}
      {totalRatings > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Distribusi Penilaian</h2>
          <div className="space-y-2">
            {distribution.map(d => (
              <StarRow key={d.star} star={d.star} count={d.count} maxCount={maxCount} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        {([
          { id: 'ulasan',    label: '⭐ Ulasan',         count: reviews.length },
          { id: 'mendatang', label: '🟢 Akan Datang',    count: upcomingRides.length },
          { id: 'riwayat',   label: '✅ Riwayat',         count: completedRides.length },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-gray-100 text-gray-800 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-gray-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}

      {/* Reviews tab */}
      {activeTab === 'ulasan' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">Belum ada ulasan dengan komentar.</p>
            </div>
          ) : (
            reviews.map(review => {
              const date = new Date(review.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })
              return (
                <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start gap-3 mb-2">
                    {review.passenger?.avatar_url ? (
                      <img
                        src={review.passenger.avatar_url}
                        className="w-9 h-9 rounded-full object-cover border flex-shrink-0"
                        alt="Reviewer"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">👤</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {review.passenger?.full_name ?? 'Penumpang'}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{date}</span>
                      </div>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={`text-sm ${s <= review.score ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {STAR_LABELS[review.score]}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 italic mt-2 pl-12">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Upcoming rides tab */}
      {activeTab === 'mendatang' && (
        <div className="space-y-3">
          {upcomingRides.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🚗</div>
              <p className="text-gray-500 text-sm">Tidak ada tumpangan yang akan datang saat ini.</p>
              <Link href="/home" className="inline-block mt-3 text-sm text-blue-600 font-semibold hover:underline">
                Lihat semua tumpangan tersedia →
              </Link>
            </div>
          ) : (
            upcomingRides.map(ride => (
              <RideCard key={ride.id} ride={ride} type="upcoming" />
            ))
          )}
        </div>
      )}

      {/* Ride history tab */}
      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          {completedRides.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">Belum ada riwayat perjalanan selesai.</p>
            </div>
          ) : (
            completedRides.map(ride => (
              <RideCard key={ride.id} ride={ride} type="completed" />
            ))
          )}
        </div>
      )}

    </div>
  )
}
