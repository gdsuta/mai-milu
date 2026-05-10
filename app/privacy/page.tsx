'use client'

import Image from 'next/image'
import { X } from '@phosphor-icons/react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER KHUSUS HALAMAN STATIS */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-50 rounded-full p-0.5 shadow-sm border border-indigo-100 shrink-0">
            <Image src="/logo.png" alt="Mai-Milu" width={32} height={32} className="rounded-full" />
          </div>
          <span className="font-black text-indigo-700 text-lg tracking-tight">Mai-Milu</span>
        </div>
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg border border-gray-200 transition-colors"
        >
          <X weight="bold" className="w-4 h-4" /> <span className="hidden sm:inline">Tutup Tab</span>
        </button>
      </header>

      {/* KONTEN */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 bg-white shadow-sm border-x border-gray-100">
        <h1 className="text-3xl font-black text-indigo-900 mb-2">Kebijakan Privasi</h1>
        <p className="text-gray-500 font-medium mb-8">Pembaruan Terakhir: 1 April 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Pengumpulan Data</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk namun tidak terbatas pada: Nama Lengkap, Alamat Email, Nomor WhatsApp, Alamat Rumah, Foto Selfie, dan Foto KTP.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Penggunaan Data</h2>
            <p>Data pribadi Anda digunakan secara eksklusif untuk: (a) Memverifikasi identitas pengguna demi keamanan komunitas. (b) Memfasilitasi komunikasi antar pengguna via WhatsApp terkait tumpangan. (c) Menjaga agar platform bebas dari akun palsu dan spam.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Perlindungan & Penghapusan</h2>
            <p>Mai-Milu tidak akan pernah menjual atau menyewakan data Anda kepada pihak ketiga. Dokumen sensitif seperti KTP akan diamankan secara digital dan akan langsung dihapus dari server kami segera setelah akun Anda selesai diverifikasi oleh Admin. Anda berhak meminta penghapusan akun dan seluruh data terkait kapan saja dengan menghubungi kami.</p>
          </section>
        </div>
        
        {/* Tombol tutup tambahan di bawah */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <button 
            onClick={() => window.close()} 
            className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Tutup Halaman Ini
          </button>
        </div>
      </main>
    </div>
  )
}