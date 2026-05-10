'use client'

import Image from 'next/image'
import { X } from '@phosphor-icons/react'

export default function TermsPage() {
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
        <h1 className="text-3xl font-black text-indigo-900 mb-2">Syarat & Ketentuan</h1>
        <p className="text-gray-500 font-medium mb-8">Pembaruan Terakhir: 1 April 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Pengantar</h2>
            <p>Selamat datang di Mai-Milu. Dengan mendaftar dan menggunakan aplikasi Mai-Milu, Anda setuju untuk tunduk pada Syarat dan Ketentuan ini. Mai-Milu adalah platform teknologi yang menghubungkan pengemudi yang memiliki kursi kosong dengan penumpang yang searah, khususnya untuk komunitas di Buleleng dan sekitarnya.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Status Layanan</h2>
            <p><strong>Mai-Milu bukan perusahaan transportasi.</strong> Kami tidak mempekerjakan pengemudi dan tidak memiliki armada kendaraan. Kami hanya menyediakan platform digital untuk mempertemukan anggota komunitas. Kesepakatan biaya (uang bensin) dan perjalanan sepenuhnya menjadi tanggung jawab antara pengemudi dan penumpang.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Keamanan & Verifikasi</h2>
            <p>Untuk menjaga keamanan komunitas, seluruh pengguna wajib mengunggah foto wajah (Selfie) dan foto Kartu Tanda Penduduk (KTP) yang sah. Data ini disimpan dengan aman dan hanya digunakan oleh Admin untuk proses verifikasi. Kegagalan mematuhi norma kesopanan atau indikasi penipuan akan mengakibatkan pemblokiran akun secara permanen.</p>
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