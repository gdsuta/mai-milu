'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type BookingStatus = 'none' | 'pending' | 'confirmed' | 'cancelled'

type Props = {
  rideId: string
  driverId: string
  currentUserId: string
  availableSeats: number
  initialBookingStatus: BookingStatus
  initialBookingId: string | null
  driverPhone: string
}

export default function BookingButton({
  rideId,
  driverId,
  currentUserId,
  availableSeats,
  initialBookingStatus,
  initialBookingId,
  driverPhone,
}: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [bookingStatus, setBookingStatus] = useState<BookingStatus>(initialBookingStatus)
  const [bookingId, setBookingId] = useState<string | null>(initialBookingId)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  let waNumber = driverPhone.replace(/[^0-9]/g, '')
  if (waNumber.startsWith('0')) waNumber = '62' + waNumber.substring(1)

  const handleBook = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('book_ride', {
        p_ride_id: rideId,
        p_passenger_id: currentUserId, // PERBAIKAN: Harus p_passenger_id
      })
      if (error) throw error
      // PERBAIKAN: Baca pesan dari RPC (data.message)
      if (!data.success) throw new Error(data.message || 'Gagal memesan')

      setBookingId(data.booking_id)
      setBookingStatus('pending')
      setShowConfirm(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      alert('Gagal memesan: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!bookingId) return
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId,
        p_passenger_id: currentUserId, // PERBAIKAN: Harus p_passenger_id
      })
      if (error) throw error
      if (!data.success) throw new Error(data.message || 'Gagal membatalkan')

      setBookingStatus('cancelled')
      setBookingId(null)
      setShowCancelConfirm(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      alert('Gagal membatalkan: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  if (currentUserId === driverId) return null

  if (bookingStatus === 'pending') {
    return (
      <>
        <div className="flex gap-2 w-full">
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-center gap-2">
            <span className="text-blue-600 font-bold text-sm">🎫 Menunggu Konfirmasi</span>
          </div>
          <button onClick={() => setShowCancelConfirm(true)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">
            Batal
          </button>
        </div>

        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={e => { if (e.target === e.currentTarget) setShowCancelConfirm(false) }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Batalkan Pemesanan?</h3>
              <p className="text-sm text-gray-500 mb-6">Kursi akan dikembalikan dan pemesanan Anda akan dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition">Kembali</button>
                <button onClick={handleCancel} disabled={loading} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition disabled:bg-gray-300">
                  {loading ? 'Membatalkan...' : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (bookingStatus === 'confirmed') {
    return (
      <div className="flex gap-2 w-full">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-center gap-2">
          <span className="text-green-700 font-bold text-sm">✅ Kursi Terkonfirmasi</span>
        </div>
        <a href={`https://wa.me/${waNumber}?text=Halo, pemesanan kursi saya sudah dikonfirmasi. Sampai jumpa!`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition">
          💬 WA
        </a>
      </div>
    )
  }

  if (availableSeats <= 0 && bookingStatus === 'none') {
    return (
      <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-center text-sm text-gray-500 font-semibold">
        Kursi Penuh
      </div>
    )
  }

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2">
        🎫 Pesan Kursi
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={e => { if (e.target === e.currentTarget) setShowConfirm(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Konfirmasi Pemesanan</h3>
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm text-blue-800 space-y-1">
              <p>🎫 Pemesanan akan berstatus <strong>Menunggu Konfirmasi</strong></p>
              <p>💬 Pengemudi akan menghubungi Anda via WhatsApp untuk konfirmasi</p>
              <p>🚗 {availableSeats} kursi tersedia</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition">Batal</button>
              <button onClick={handleBook} disabled={loading} className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300">
                {loading ? 'Memproses...' : 'Ya, Pesan!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}