'use client'

import { useState } from 'react'

interface ZoomableImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackText?: string
}

export default function ZoomableImage({ src, alt, className = '', fallbackText = 'Tidak ada' }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Jika tidak ada gambar, tampilkan kotak abu-abu
  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center text-xs text-gray-500 ${className}`}>
        {fallbackText}
      </div>
    )
  }

  return (
    <>
      {/* Gambar Kecil (Thumbnail) */}
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-blue-400 transition-all ${className}`}
        onClick={() => setIsOpen(true)}
        title="Klik untuk memperbesar"
      />

      {/* Tampilan Layar Penuh (Modal) jika isOpen = true */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)} // Tutup jika background diklik
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
            
            {/* Tombol Tutup */}
            <button 
              className="absolute -top-10 right-0 md:right-4 text-white hover:text-red-400 text-lg font-bold bg-black/50 px-4 py-1 rounded-full transition"
              onClick={() => setIsOpen(false)}
            >
              ✕ Tutup
            </button>

            {/* Gambar Besar */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-4 border-white/10"
              onClick={(e) => e.stopPropagation()} // Mencegah gambar tertutup jika gambar itu sendiri diklik
            />
          </div>
        </div>
      )}
    </>
  )
}