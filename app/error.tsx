'use client' // File error WAJIB menjadi Client Component

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Mencatat error di terminal atau console browser
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="text-6xl mb-4">🚨</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Waduh, terjadi kesalahan!</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Sistem kami mengalami sedikit gangguan saat mencoba memuat halaman ini. Jangan khawatir, coba muat ulang halamannya.
      </p>
      <button
        onClick={() => reset()}
        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md transition flex items-center justify-center gap-2 mx-auto"
      >
        🔄 Coba Lagi
      </button>
    </div>
  )
}