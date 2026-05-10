'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// Impor ikon dari Phosphor
import { MapPin, Flag, Calculator, ArrowsClockwise, CalendarBlank, Clock, Users, GasPump, FileText, CheckCircle, CircleNotch, X } from '@phosphor-icons/react'

const rideSchema = z.object({
  origin: z.string().min(3, "Lokasi asal minimal 3 karakter"),
  destination: z.string().min(3, "Tujuan akhir minimal 3 karakter"),
  departureDate: z.string().optional(),
  departureTime: z.string().min(1, "Jam wajib diisi"),
  availableSeats: z.number({ message: "Wajib diisi angka" }).min(1, "Minimal 1 kursi").max(10, "Maksimal 10 kursi"),
  price: z.number({ message: "Wajib diisi angka" }).min(0, "Harga tidak boleh minus"),
  notes: z.string().optional()
})

type RideFormValues = z.infer<typeof rideSchema>

const DAYS = [
  { id: 'Sen', label: 'Sen', jsDay: 1 },
  { id: 'Sel', label: 'Sel', jsDay: 2 },
  { id: 'Rab', label: 'Rab', jsDay: 3 },
  { id: 'Kam', label: 'Kam', jsDay: 4 },
  { id: 'Jum', label: 'Jum', jsDay: 5 },
]

function nextDateForDay(jsDay: number, timeStr: string): string | null {
  const now = new Date()
  const today = now.getDay()
  let daysAhead = jsDay - today
  if (daysAhead <= 0) daysAhead += 7

  if (daysAhead === 7) {
    const [h, m] = timeStr.split(':').map(Number)
    const departureToday = new Date()
    departureToday.setHours(h, m, 0, 0)
    if (now < departureToday) daysAhead = 0
  }

  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  return date.toISOString().split('T')[0]
}

function getDatesForDay(jsDay: number, weeksAhead: number, startDate: string): string[] {
  const dates: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  for (let w = 0; w < weeksAhead; w++) {
    const d = new Date(start)
    d.setDate(start.getDate() + w * 7)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function OfferRidePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<{ id: string, fullName: string, avatarUrl: string | null, role: string } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)

  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sen', 'Sel', 'Rab', 'Kam', 'Jum'])
  const [weeksAhead, setWeeksAhead] = useState(4)

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<RideFormValues>({
    resolver: zodResolver(rideSchema),
    defaultValues: {
      availableSeats: 1,
      price: 0,
      notes: ''
    }
  })

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url, role').eq('id', user.id).single()
        if (profile) setUserProfile({ 
          id: profile.id, 
          fullName: profile.full_name ?? "Pengguna Tanpa Nama", 
          avatarUrl: profile.avatar_url, 
          role: profile.role ?? "user" 
        })
      }
    }
    getUserProfile()
  }, [supabase])

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const recurringRideCount = isRecurring ? selectedDays.length * weeksAhead : 1

  const handleCalculateDistance = async () => {
    const origin = getValues('origin')
    const destination = getValues('destination')
    
    if (!origin || !destination) {
      alert('Silakan isi lokasi Asal dan Tujuan terlebih dahulu!')
      return
    }
    
    setIsCalculating(true)
    setDistanceKm(null)
    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY
    try {
      const getCoords = async (place: string) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place + ', Bali, Indonesia')}&format=json&limit=1`
        const res = await fetch(url)
        const data = await res.json()
        if (data && data.length > 0) return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        throw new Error(`Titik lokasi "${place}" tidak ditemukan. Coba gunakan nama desa terdekat.`)
      }
      const coordsOrigin = await getCoords(origin)
      const coordsDest = await getCoords(destination)
      const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${coordsOrigin[0]},${coordsOrigin[1]}&end=${coordsDest[0]},${coordsDest[1]}&preference=shortest`
      const routeRes = await fetch(routeUrl)
      const routeData = await routeRes.json()
      let distanceInKm = 0
      if (routeData.features && routeData.features.length > 0) {
        distanceInKm = Math.round((routeData.features[0].properties.segments[0].distance / 1000) * 10) / 10
      } else {
        const toRad = (v: number) => v * Math.PI / 180
        const R = 6371
        const dLat = toRad(coordsDest[1] - coordsOrigin[1])
        const dLon = toRad(coordsDest[0] - coordsOrigin[0])
        const a = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(toRad(coordsOrigin[1])) * Math.cos(toRad(coordsDest[1]))
        distanceInKm = Math.round(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * R * 1.4 * 10) / 10
        alert(`Catatan: Rute jalan raya tidak ditemukan. Menggunakan estimasi (${distanceInKm} KM).`)
      }
      setDistanceKm(distanceInKm)
      
      setValue('price', Math.round(distanceInKm * 1000 / 5000) * 5000, { shouldValidate: true })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Terjadi kesalahan'
      alert(msg)
    } finally {
      setIsCalculating(false)
    }
  }

  const onSubmitForm = async (values: RideFormValues) => {
    if (!userProfile?.id) {
      alert('Profil pengguna belum dimuat. Coba refresh halaman.')
      return
    }
    if (isRecurring && selectedDays.length === 0) {
      alert('Pilih minimal satu hari untuk jadwal rutin!')
      return
    }
    if (!isRecurring && !values.departureDate) {
      alert('Silakan isi tanggal keberangkatan.')
      return
    }

    setLoading(true)

    try {
      let finalNotes = values.notes || ''
      if (distanceKm) finalNotes = `(Estimasi Jarak: ${distanceKm} km) ` + finalNotes

      if (!isRecurring) {
        const departureTimestamp = new Date(`${values.departureDate}T${values.departureTime}`).toISOString()
        const { error } = await supabase.from('rides').insert({
          driver_id: userProfile.id,
          origin: values.origin,
          destination: values.destination,
          departure_time: departureTimestamp,
          available_seats: values.availableSeats,
          price: values.price,
          notes: finalNotes,
          is_recurring: false,
        })
        if (error) throw error
        alert('Mantap! Tumpangan Anda berhasil dipublikasikan.')

      } else {
        const ridesPayload: any[] = []

        for (const dayId of selectedDays) {
          const dayConfig = DAYS.find(d => d.id === dayId)!
          const firstDate = nextDateForDay(dayConfig.jsDay, values.departureTime)
          if (!firstDate) continue

          const dates = getDatesForDay(dayConfig.jsDay, weeksAhead, firstDate)
          for (const date of dates) {
            const departureTimestamp = new Date(`${date}T${values.departureTime}`).toISOString()
            if (new Date(departureTimestamp) < new Date()) continue

            ridesPayload.push({
              driver_id: userProfile.id,
              origin: values.origin,
              destination: values.destination,
              departure_time: departureTimestamp,
              available_seats: values.availableSeats,
              price: values.price,
              notes: finalNotes,
              is_recurring: true,
              recurring_days: selectedDays,
            })
          }
        }

        if (ridesPayload.length === 0) {
          alert('Tidak ada jadwal yang bisa dibuat. Semua tanggal yang dipilih sudah lewat.')
          setLoading(false)
          return
        }

        const { error } = await supabase.from('rides').insert(ridesPayload)
        if (error) throw error
        alert(`Mantap! ${ridesPayload.length} jadwal rutin berhasil dipublikasikan untuk ${weeksAhead} minggu ke depan.`)
      }

      router.push('/home')
      router.refresh()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Terjadi kesalahan'
      alert('Gagal menyimpan: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar 
        userName={userProfile?.fullName ?? undefined} 
        avatarUrl={userProfile?.avatarUrl ?? undefined} 
        showAdminLink={userProfile?.role === 'admin'} 
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10 pt-10">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tawarkan Tumpangan</h1>
            <Link href="/home" className="text-gray-500 hover:text-red-500 text-sm font-bold bg-gray-100 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <X weight="bold" className="w-4 h-4" /> Batal
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <MapPin weight="duotone" className="w-5 h-5 text-blue-500" /> Berangkat Dari
                </label>
                <input type="text" {...register('origin')}
                  className={`w-full border p-2.5 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.origin ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="Cth: Sangsit" 
                />
                {errors.origin && <p className="text-red-500 text-xs mt-1.5">{errors.origin.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Flag weight="duotone" className="w-5 h-5 text-red-500" /> Tujuan Akhir
                </label>
                <input type="text" {...register('destination')}
                  className={`w-full border p-2.5 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.destination ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="Cth: Rendang" 
                />
                {errors.destination && <p className="text-red-500 text-xs mt-1.5">{errors.destination.message}</p>}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-blue-800">
                {distanceKm
                  ? <p>Estimasi Jarak: <span className="font-black text-lg ml-1">{distanceKm} KM</span></p>
                  : <p className="text-xs">Klik tombol di samping untuk menghitung jarak dan rekomendasi uang bensin.</p>
                }
              </div>
              <button type="button" onClick={handleCalculateDistance} disabled={isCalculating}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap w-full sm:w-auto shadow-sm flex items-center justify-center gap-2 transition-colors">
                {isCalculating ? <CircleNotch weight="bold" className="w-4 h-4 animate-spin" /> : <Calculator weight="duotone" className="w-5 h-5" />}
                {isCalculating ? 'Menghitung...' : 'Hitung Jarak'}
              </button>
            </div>

            <hr className="my-1 border-gray-100" />

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-purple-800 flex items-center gap-2">
                    <ArrowsClockwise weight="bold" className="w-4 h-4" /> Jadwal Rutin
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Aktifkan untuk membuat jadwal berulang setiap minggu.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${isRecurring ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {isRecurring && (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-purple-700 mb-2.5 uppercase tracking-wide">Hari yang aktif:</p>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map(day => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold border-2 transition-all ${
                            selectedDays.includes(day.id)
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-purple-700 mb-2.5 uppercase tracking-wide">Berlaku selama:</p>
                    <div className="flex gap-2">
                      {[1, 2, 4, 8].map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWeeksAhead(w)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                            weeksAhead === w
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {w} minggu
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDays.length > 0 && (
                    <div className="bg-purple-100 rounded-lg px-4 py-3 text-xs text-purple-800 font-medium flex items-center gap-2 mt-2">
                      <CalendarBlank weight="duotone" className="w-5 h-5 shrink-0" /> 
                      <span>Akan membuat <span className="font-black text-sm mx-1">{recurringRideCount}</span> jadwal tumpangan ({selectedDays.join(', ')} × {weeksAhead} minggu)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="my-1 border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!isRecurring && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                    <CalendarBlank weight="duotone" className="w-5 h-5 text-gray-500" /> Tanggal
                  </label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} {...register('departureDate')}
                    className={`w-full border p-2.5 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.departureDate ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {errors.departureDate && <p className="text-red-500 text-xs mt-1.5">{errors.departureDate.message}</p>}
                </div>
              )}
              <div className={isRecurring ? 'md:col-span-2' : ''}>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Clock weight="duotone" className="w-5 h-5 text-gray-500" /> Jam (WITA)
                </label>
                <input type="time" {...register('departureTime')}
                  className={`w-full border p-2.5 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.departureTime ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.departureTime && <p className="text-red-500 text-xs mt-1.5">{errors.departureTime.message}</p>}
                {isRecurring && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5"><ArrowsClockwise className="w-3 h-3" /> Jadwal akan dimulai dari hari terpilih berikutnya.</p>
                )}
              </div>
            </div>

            <hr className="my-1 border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Users weight="duotone" className="w-5 h-5 text-gray-500" /> Kursi Kosong
                </label>
                <input type="number" {...register('availableSeats', { valueAsNumber: true })}
                  className={`w-full border p-2.5 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${errors.availableSeats ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.availableSeats && <p className="text-red-500 text-xs mt-1.5">{errors.availableSeats.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <GasPump weight="duotone" className="w-5 h-5 text-gray-500" /> Uang Bensin (Rp)
                </label>
                <input type="number" step="1000" {...register('price', { valueAsNumber: true })}
                  className={`w-full border p-2.5 rounded-lg text-gray-900 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none transition-shadow ${errors.price ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                <FileText weight="duotone" className="w-5 h-5 text-gray-500" /> Catatan Tambahan
              </label>
              <textarea {...register('notes')}
                className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Titik kumpul yang lebih spesifik..." rows={3} 
              />
            </div>

            <button type="submit" disabled={loading || (isRecurring && selectedDays.length === 0)}
              className="w-full bg-green-600 text-white font-bold p-3.5 rounded-xl mt-3 hover:bg-green-700 disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2.5 transition-all text-[15px]">
              {loading ? (
                <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
              ) : isRecurring ? (
                <ArrowsClockwise weight="bold" className="w-5 h-5" />
              ) : (
                <CheckCircle weight="bold" className="w-5 h-5" />
              )}
              
              {loading
                ? 'Menyimpan Jadwal...'
                : isRecurring
                  ? `Publikasikan ${recurringRideCount} Jadwal Rutin`
                  : 'Publikasikan Tumpangan'
              }
            </button>
          </form>
        </div>
      </div>
    </>
  )
}