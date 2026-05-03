import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Kebijakan Privasi Mai-Milu</h1>
          <p className="text-sm text-gray-500 mb-8">Pembaruan Terakhir: 1 April 2026</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">1. Data yang Kami Kumpulkan</h2>
              <p>Untuk menjaga keamanan komunitas Mai-Milu, kami mengumpulkan data pribadi saat Anda mendaftar, yang meliputi:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Nama Lengkap (sesuai identitas)</li>
                <li>Alamat Email dan Nomor WhatsApp aktif</li>
                <li>Alamat Domisili</li>
                <li>Foto Wajah (Selfie) untuk profil pengemudi/penumpang</li>
                <li>Foto Kartu Tanda Penduduk (KTP)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">2. Penggunaan Foto KTP</h2>
              <p>Foto KTP <strong>HANYA</strong> digunakan satu kali oleh Tim Admin untuk memverifikasi keaslian identitas Anda demi mencegah akun palsu atau penipuan. Foto KTP Anda disimpan secara terenkripsi di server awan (Supabase) dan <strong>TIDAK PERNAH</strong> ditampilkan kepada pengguna lain di dalam aplikasi.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3. Bagaimana Kami Menggunakan Data Anda</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Untuk membuat dan memelihara akun Anda.</li>
                <li>Untuk menampilkan Nama dan Foto Profil Anda di halaman Beranda saat Anda menawarkan tumpangan.</li>
                <li>Untuk menyediakan tombol "Hubungi via WhatsApp" agar penumpang dapat menghubungi pengemudi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">4. Berbagi Data</h2>
              <p>Kami <strong>TIDAK AKAN PERNAH</strong> menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Informasi nomor telepon Anda hanya akan terbuka saat pengguna lain mengklik tombol WhatsApp pada tumpangan yang Anda tawarkan.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">5. Keamanan Data</h2>
              <p>Kami menerapkan standar keamanan industri menggunakan otentikasi Supabase dan Row Level Security (RLS) untuk melindungi data Anda dari akses yang tidak sah.</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <Link href="/register" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition">
              Kembali ke Pendaftaran
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}