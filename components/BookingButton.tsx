'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, CircleNotch, CheckCircle, XCircle, WhatsappLogo, Prohibit } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

type BookingStatus = 'none' | 'pending' | 'accepted' | 'cancelled' | 'rejected'

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
  rideId, driverId, currentUserId, availableSeats, 
  initialBookingStatus, initialBookingId, driverPhone
}: Props) {
  const supabase = createClient()
  const router = useRouter()

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
      const { data, error } = await supabase.rpc('book_ride' as any, {
        p_ride_id: rideId,
        p_passenger_id: currentUserId,
      })
      if (error) throw error
      if (!data.success) throw new Error(data.error)

      setBookingStatus('pending')
      setShowConfirm(false)
      router.refresh() // Refresh agar sisa kursi di UI berkurang
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
      const { data, error } = await supabase.rpc('cancel_booking' as any, {
        p_booking_id: bookingId,
        p_passenger_id: currentUserId,
      })
      if (error) throw error
      if (!data.success) throw new Error(data.error)

      setBookingStatus('cancelled')
      setBookingId(null)
      setShowCancelConfirm(false)
      router.refresh() // Refresh agar sisa kursi di UI bertambah
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      alert('Gagal membatalkan: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // Pengemudi tidak bisa memesan tumpangannya sendiri
  if (currentUserId === driverId) return null

  // Kondisi: Sedang Menunggu
  if (bookingStatus === 'pending') {
    return (
      <>
        <div className="flex gap-2 w-full mt-2 pt-2 border-t border-gray-100">
          <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-sm">
            <Ticket weight="duotone" className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700 font-bold text-sm">Menunggu Konfirmasi</span>
          </div>
          <button onClick={() => setShowCancelConfirm(true)} className="bg-white text-red-500 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm">
            Batal
          </button>
        </div>

        {/* Modal Batal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) setShowCancelConfirm(false) }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <XCircle weight="duotone" className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-center text-gray-800 mb-2">Batalkan Pesanan?</h3>
              <p className="text-sm text-center text-gray-500 mb-6 leading-relaxed">
                Kursi Anda akan dikembalikan ke dalam tumpangan dan pesanan dibatalkan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">Kembali</button>
                <button onClick={handleCancel} disabled={loading} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  {loading ? <CircleNotch className="w-5 h-5 animate-spin" /> : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Kondisi: Disetujui
  if (bookingStatus === 'accepted') {
    return (
      <div className="flex gap-2 w-full mt-2 pt-2 border-t border-gray-100">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle weight="fill" className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-bold text-sm">Disetujui</span>
        </div>
        <a href={`https://wa.me/${waNumber}?text=Halo, saya penumpang Mai-Milu yang kursinya sudah disetujui. Sampai jumpa!`} target="_blank" rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm">
          <WhatsappLogo weight="fill" className="w-5 h-5" />
        </a>
      </div>
    )
  }

  // Kondisi: Ditolak
  if (bookingStatus === 'rejected') {
    return (
      <div className="w-full mt-2 pt-2 border-t border-gray-100">
        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2">
          <Prohibit weight="bold" className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500 font-bold text-sm">Ditolak Pengemudi</span>
        </div>
      </div>
    )
  }

  // Kondisi: Kursi Habis (dan pengguna belum pesan)
  if (availableSeats <= 0 && (!bookingStatus || bookingStatus === 'none' || bookingStatus === 'cancelled')) {
    return (
      <div className="w-full mt-2 pt-2 border-t border-gray-100">
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2">
          <XCircle weight="duotone" className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 font-bold text-sm">Kursi Penuh</span>
        </div>
      </div>
    )
  }

  // Kondisi Default: Bisa Dipesan
  return (
    <>
      <div className="w-full mt-2 pt-2 border-t border-gray-100 flex gap-2">
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm">
          <WhatsappLogo weight="duotone" className="w-5 h-5" />
        </a>
        <button onClick={() => setShowConfirm(true)} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md">
          <Ticket weight="bold" className="w-5 h-5" /> Pesan Kursi
        </button>
      </div>

      {/* Modal Pesan */}
      {showConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4" onClick={e => { if (e.target === e.currentTarget) setShowConfirm(false) }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Ticket weight="duotone" className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-center text-gray-800 mb-2">Konfirmasi Pesanan</h3>
            <div className="bg-indigo-50/50 rounded-xl p-4 mb-6 border border-indigo-100 space-y-2">
              <p className="text-sm text-indigo-900 flex items-center gap-2 font-medium"><Ticket weight="duotone" className="w-4 h-4" /> Memerlukan konfirmasi pengemudi.</p>
              <p className="text-sm text-indigo-900 flex items-center gap-2 font-medium"><WhatsappLogo weight="duotone" className="w-4 h-4" /> Pengemudi bisa menelpon via WA.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={handleBook} disabled={loading} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                {loading ? <CircleNotch className="w-5 h-5 animate-spin" /> : 'Ya, Pesan!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}