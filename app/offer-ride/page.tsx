'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function OfferRidePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<{ id: string, fullName: string, avatarUrl: string | null, role: string } | null>(null)

  // State baru untuk Kalkulator Jarak
  const [isCalculating, setIsCalculating] = useState(false)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url, role').eq('id', user.id).single()
        if (profile) setUserProfile({ id: profile.id, fullName: profile.full_name, avatarUrl: profile.avatar_url, role: profile.role })
      }
    }
    getUserProfile()
  }, [supabase])

  const [formData, setFormData] = useState({
    origin: '', destination: '', departureDate: '', departureTime: '',
    availableSeats: 1, price: 0, notes: ''
  })

  // === FUNGSI PINTAR: MENGHITUNG JARAK VIA OPENROUTESERVICE ===
  const handleCalculateDistance = async () => {
    if (!formData.origin || !formData.destination) {
      alert("Silakan isi lokasi Asal dan Tujuan terlebih dahulu!")
      return
    }

    setIsCalculating(true)
    setDistanceKm(null)

    const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY

    try {
    // 1. Ubah Nama Tempat menjadi Titik Koordinat (Geocoding)
      const getCoords = async (place: string) => {
        // SOLUSI PRO: Kita buang pencarian ORS, dan ganti menggunakan API Nominatim (OSM)
        // Nominatim jauh lebih akurat mengenali nama desa/kecamatan di Indonesia tanpa nyasar.
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place + ', Bali, Indonesia')}&format=json&limit=1`
        
        const res = await fetch(url)
        const data = await res.json()
        
        if (data && data.length > 0) {
          // Nominatim memberikan data latitude & longitude, kita ubah formatnya untuk ORS
          return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        }
        
        throw new Error(`Titik lokasi "${place}" tidak ditemukan. Coba gunakan nama desa terdekat.`)
      }

      const coordsOrigin = await getCoords(formData.origin)
      const coordsDest = await getCoords(formData.destination)

      // 2. Hitung Rute Berkendara Mobil
      const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${coordsOrigin[0]},${coordsOrigin[1]}&end=${coordsDest[0]},${coordsDest[1]}&preference=shortest`
      
      const routeRes = await fetch(routeUrl)
      const routeData = await routeRes.json()

      let distanceInKm = 0;

      if (routeData.features && routeData.features.length > 0) {
        // Rencana A: Satelit berhasil menemukan jalan aspal
        const distanceInMeters = routeData.features[0].properties.segments[0].distance
        distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10 
      } else {
        // RENCANA B (FALLBACK): Satelit gagal menemukan jalan raya yang nyambung.
        // Kita hitung jarak lurus (Rumus Haversine) lalu dikalikan faktor kelokan (1.4)
        const toRad = (value: number) => value * Math.PI / 180;
        const R = 6371; // Radius Bumi dalam KM
        
        const dLat = toRad(coordsDest[1] - coordsOrigin[1]);
        const dLon = toRad(coordsDest[0] - coordsOrigin[0]);
        const lat1 = toRad(coordsOrigin[1]);
        const lat2 = toRad(coordsDest[1]);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const straightDistance = R * c;
        
        // Kalikan 1.4 untuk kompensasi jalan berkelok di Bali
        distanceInKm = Math.round(straightDistance * 1.4 * 10) / 10;
        
        // Beritahu pengguna
        alert(`Catatan: Rute jalan raya spesifik tidak ditemukan satelit. Menggunakan estimasi jarak aman (${distanceInKm} KM).`);
      }

      // Tampilkan hasil akhir ke layar
      setDistanceKm(distanceInKm)
      
      // Rekomendasi harga (Misal: Rp 1.000 per KM, dibulatkan kelipatan 5.000)
      const suggestedPrice = Math.round(distanceInKm * 1000 / 5000) * 5000 
      setFormData(prev => ({ ...prev, price: suggestedPrice }))

    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat menghubungi satelit peta.")
    } finally {
      setIsCalculating(false)
    }
  } // <--- INILAH KURUNG KURAWAL YANG HILANG SEBELUMNYA!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.id) return setLoading(true)

    try {
      const departureTimestamp = new Date(`${formData.departureDate}T${formData.departureTime}`).toISOString()
      
      // Tambahkan info jarak ke catatan secara otomatis jika ada
      let finalNotes = formData.notes
      if (distanceKm) {
        finalNotes = `(Estimasi Jarak: ${distanceKm} km) ` + finalNotes
      }

      const { error } = await supabase
        .from('rides')
        .insert({
          driver_id: userProfile.id, origin: formData.origin, destination: formData.destination,
          departure_time: departureTimestamp, available_seats: formData.availableSeats,
          price: formData.price, notes: finalNotes
        })
      if (error) throw error
      alert("Mantap! Tumpangan Anda berhasil dipublikasikan.")
      router.push('/home')
      router.refresh() 
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar userName={userProfile?.fullName} avatarUrl={userProfile?.avatarUrl} showAdminLink={userProfile?.role === 'admin'} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10 pt-10">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tawarkan Tumpangan</h1>
            <Link href="/home" className="text-gray-500 hover:text-red-500 text-sm font-bold bg-gray-100 px-3 py-1 rounded-lg">✕ Batal</Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">📍 Berangkat Dari</label>
                <input type="text" required onChange={e => setFormData({...formData, origin: e.target.value})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Sangsit" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">🏁 Tujuan Akhir</label>
                <input type="text" required onChange={e => setFormData({...formData, destination: e.target.value})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Rendang" />
              </div>
            </div>

            {/* TOMBOL KALKULATOR JARAK */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-blue-800">
                {distanceKm ? (
                  <p>Estimasi Jarak: <span className="font-bold text-lg">{distanceKm} KM</span></p>
                ) : (
                  <p className="text-xs">Klik tombol di samping untuk menghitung jarak dan rekomendasi uang bensin.</p>
                )}
              </div>
              <button 
                type="button" 
                onClick={handleCalculateDistance}
                disabled={isCalculating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap w-full sm:w-auto shadow-sm"
              >
                {isCalculating ? 'Menghitung...' : '🗺️ Hitung Jarak'}
              </button>
            </div>
            
            <hr className="my-1" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">📅 Tanggal</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, departureDate: e.target.value})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">⏰ Jam (WITA)</label>
                <input type="time" required onChange={e => setFormData({...formData, departureTime: e.target.value})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" />
              </div>
            </div>

            <hr className="my-1" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700">💺 Kursi Kosong</label>
                <input type="number" min="1" max="10" required onChange={e => setFormData({...formData, availableSeats: parseInt(e.target.value)})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" defaultValue={1} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">⛽ Uang Bensin (Rp)</label>
                <input type="number" min="0" step="1000" required 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} 
                  className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900 bg-green-50 focus:ring-2 focus:ring-green-500" 
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">📝 Catatan Tambahan</label>
              <textarea onChange={e => setFormData({...formData, notes: e.target.value})} 
                className="w-full border border-gray-300 p-2 rounded-lg mt-1 text-gray-900" placeholder="Titik kumpul yang lebih spesifik..." rows={2} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold p-3 rounded-lg mt-2 hover:bg-green-700 disabled:bg-gray-400 shadow-md">
              {loading ? 'Menyimpan Jadwal...' : 'Publikasikan Tumpangan'}
            </button>
          </form>

        </div>
      </div>
    </>
  )
}