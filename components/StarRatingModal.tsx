'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  rideId: string
  driverId: string
  driverName: string
  driverAvatar: string | null
  existingRating?: { score: number; comment: string | null } | null
  onClose: () => void
  onSubmitted: (score: number) => void
}

const LABELS: Record<number, string> = {
  1: 'Sangat buruk',
  2: 'Kurang memuaskan',
  3: 'Cukup baik',
  4: 'Memuaskan',
  5: 'Luar biasa!',
}

export default function StarRatingModal({
  rideId,
  driverId,
  driverName,
  driverAvatar,
  existingRating,
  onClose,
  onSubmitted,
}: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(existingRating?.score ?? 0)
  const [comment, setComment] = useState(existingRating?.comment ?? '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const activeScore = hovered || selected

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Tidak terautentikasi')

      const payload = {
        ride_id: rideId,
        driver_id: driverId,
        passenger_id: user.id,
        score: selected,
        comment: comment.trim() || null,
      }

      const { error } = existingRating
        ? await supabase
            .from('ratings')
            .update({ score: selected, comment: comment.trim() || null })
            .eq('ride_id', rideId)
            .eq('passenger_id', user.id)
        : await supabase.from('ratings').insert(payload)

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        onSubmitted(selected)
        onClose()
      }, 1400)
    } catch (err: any) {
      alert('Gagal menyimpan ulasan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-200">

        {submitted ? (
          // Success state
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-lg font-bold text-gray-800">Terima kasih!</p>
            <p className="text-sm text-gray-500 mt-1">Ulasan Anda membantu komunitas Mai-Milu.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Beri Ulasan Pengemudi</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Driver info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
              {driverAvatar ? (
                <img src={driverAvatar} alt={driverName} className="w-12 h-12 rounded-full object-cover border" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👤</div>
              )}
              <div>
                <p className="font-bold text-gray-800">{driverName}</p>
                <p className="text-xs text-gray-500">Pengemudi Terverifikasi</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(star)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Beri ${star} bintang`}
                >
                  <span className={star <= activeScore ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>

            {/* Score label */}
            <p className="text-center text-sm font-semibold text-gray-500 mb-5 h-5">
              {activeScore ? LABELS[activeScore] : 'Ketuk bintang untuk memberi nilai'}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Komentar (opsional) — ceritakan pengalaman Anda..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-400 text-right mt-1 mb-4">{comment.length}/300</p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selected || loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : existingRating ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
