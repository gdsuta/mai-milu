'use client'

import { useState } from 'react'

type Ride = {
  id: string
  origin: string
  destination: string
  departure_time: string
  available_seats: number
  price: number
  notes: string | null
  status: string
  created_at: string
  is_recurring: boolean
  recurring_days: string[] | null
}

type Props = {
  rides: Ride[]
  updateRideStatus: (formData: FormData) => Promise<void>
  deleteRide: (formData: FormData) => Promise<void>
}

type Tab = 'tersedia' | 'selesai' | 'dibatalkan' | 'kadaluarsa'

const TAB_CONFIG: Record<Tab, { label: string; emoji: string; color: string }> = {
  tersedia:   { label: 'Aktif',      emoji: '🟢', color: 'text-green-600 border-green-500' },
  selesai:    { label: 'Selesai',    emoji: '✅', color: 'text-blue-600 border-blue-500'  },
  dibatalkan: { label: 'Dibatalkan', emoji: '❌', color: 'text-red-600 border-red-500'    },
  kadaluarsa: { label: 'Kadaluarsa', emoji: '⏰', color: 'text-gray-500 border-gray-400'  },
}

const STATUS_BADGE: Record<string, string> = {
  tersedia:   'bg-green-100 text-green-700',
  selesai:    'bg-blue-100 text-blue-700',
  dibatalkan: 'bg-red-100 text-red-700',
  kadaluarsa: 'bg-gray-100 text-gray-500',
}

export default function MyRidesList({ rides, updateRideStatus, deleteRide }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('tersedia')
  const [confirmAction, setConfirmAction] = useState<{
    rideId: string; action: 'selesai' | 'dibatalkan' | 'delete'; origin: string; destination: string
  } | null>(null)

  const counts = {
    tersedia:   rides.filter(r => r.status === 'tersedia').length,
    selesai:    rides.filter(r => r.status === 'selesai').length,
    dibatalkan: rides.filter(r => r.status === 'dibatalkan').length,
    kadaluarsa: rides.filter(r => r.status === 'kadaluarsa').length,
  }

  const filtered = rides.filter(r => r.status === activeTab)

  const EMPTY_MESSAGES: Record<Tab, string> = {
    tersedia:   'Belum ada tumpangan aktif. Klik ➕ Tambah untuk menawarkan tumpangan baru.',
    selesai:    'Belum ada tumpangan yang ditandai selesai.',
    dibatalkan: 'Belum ada tumpangan yang dibatalkan.',
    kadaluarsa: 'Tidak ada tumpangan yang sudah kadaluarsa.',
  }

  return (
    <>
      {/* ── Tab Bar ── */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-4">
        {(Object.keys(TAB_CONFIG) as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg text-xs font-bold transition ${
              activeTab === tab
                ? `bg-gray-100 border-b-2 ${TAB_CONFIG[tab].color}`
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-lg mb-0.5">{TAB_CONFIG[tab].emoji}</span>
            <span>{TAB_CONFIG[tab].label}</span>
            {counts[tab] > 0 && (
              <span className={`mt-0.5 text-xs font-black ${activeTab === tab ? '' : 'text-gray-400'}`}>
                ({counts[tab]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Ride Cards ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <div className="text-4xl mb-3">{TAB_CONFIG[activeTab].emoji}</div>
          <p className="text-gray-500 text-sm">{EMPTY_MESSAGES[activeTab]}</p>
          {activeTab === 'tersedia' && (
            <a
              href="/offer-ride"
              className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 text-sm"
            >
              ➕ Tawarkan Tumpangan
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ride => {
            const dateObj = new Date(ride.departure_time)
            const tanggal = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
            const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            const isPast = dateObj < new Date()
            const isActive = ride.status === 'tersedia'

            return (
              <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-500 text-sm">📍</span>
                      <span className="font-bold text-gray-800">{ride.origin}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-gray-800">{ride.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>📅 {tanggal}</span>
                      <span>⏰ {jam} WITA</span>
                      <span>💺 {ride.available_seats} kursi</span>
                      <span>💰 {ride.price === 0 ? 'Gratis' : `Rp ${ride.price.toLocaleString('id-ID')}`}</span>
                    </div>
                    {ride.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">"{ride.notes}"</p>
                    )}
                  </div>

                  {/* Status badge + recurring badge */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[ride.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {TAB_CONFIG[ride.status as Tab]?.emoji} {TAB_CONFIG[ride.status as Tab]?.label ?? ride.status}
                    </span>
                    {ride.is_recurring && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
                        🔁 {ride.recurring_days?.join(' · ') ?? 'Rutin'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons — only for active rides */}
                {isActive && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {/* Mark as complete — only if departure time has passed */}
                    {isPast && (
                      <button
                        onClick={() => setConfirmAction({ rideId: ride.id, action: 'selesai', origin: ride.origin, destination: ride.destination })}
                        className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1"
                      >
                        ✅ Tandai Selesai
                      </button>
                    )}

                    {/* Cancel */}
                    <button
                      onClick={() => setConfirmAction({ rideId: ride.id, action: 'dibatalkan', origin: ride.origin, destination: ride.destination })}
                      className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100 transition flex items-center justify-center gap-1"
                    >
                      ❌ Batalkan
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmAction({ rideId: ride.id, action: 'delete', origin: ride.origin, destination: ride.destination })}
                      className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-1"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {/* For non-active rides, only show delete */}
                {!isActive && (
                  <div className="flex justify-end pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setConfirmAction({ rideId: ride.id, action: 'delete', origin: ride.origin, destination: ride.destination })}
                      className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
          onClick={e => { if (e.target === e.currentTarget) setConfirmAction(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {confirmAction.action === 'selesai'    && '✅ Tandai Selesai?'}
              {confirmAction.action === 'dibatalkan' && '❌ Batalkan Tumpangan?'}
              {confirmAction.action === 'delete'     && '🗑️ Hapus Tumpangan?'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmAction.origin} → {confirmAction.destination}
              <br />
              {confirmAction.action === 'selesai'    && 'Tumpangan akan ditandai sebagai selesai dan tidak akan muncul lagi di beranda.'}
              {confirmAction.action === 'dibatalkan' && 'Tumpangan akan dibatalkan dan penumpang yang sudah mendaftar tidak akan bisa menemukan tumpangan ini.'}
              {confirmAction.action === 'delete'     && 'Tumpangan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>

              {confirmAction.action === 'delete' ? (
                <form action={deleteRide} className="flex-1" onSubmit={() => setConfirmAction(null)}>
                  <input type="hidden" name="rideId" value={confirmAction.rideId} />
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition"
                  >
                    Hapus
                  </button>
                </form>
              ) : (
                <form action={updateRideStatus} className="flex-1" onSubmit={() => setConfirmAction(null)}>
                  <input type="hidden" name="rideId" value={confirmAction.rideId} />
                  <input type="hidden" name="status" value={confirmAction.action} />
                  <button
                    type="submit"
                    className={`w-full text-white font-bold py-2.5 rounded-xl transition ${
                      confirmAction.action === 'selesai' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {confirmAction.action === 'selesai' ? 'Tandai Selesai' : 'Batalkan'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
