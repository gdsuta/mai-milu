import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <>
      {/* Kita panggil Navbar kosong karena pengguna mungkin belum login saat membaca ini */}
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Syarat & Ketentuan Mai-Milu</h1>
          <p className="text-sm text-gray-500 mb-8">Pembaruan Terakhir: 1 April 2026</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">1. Pengantar</h2>
              <p>Selamat datang di Mai-Milu. Dengan mendaftar dan menggunakan aplikasi Mai-Milu, Anda setuju untuk tunduk pada Syarat dan Ketentuan ini. Mai-Milu adalah platform teknologi yang menghubungkan pengemudi yang memiliki kursi kosong dengan penumpang yang searah, khususnya untuk komunitas di Buleleng dan sekitarnya.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">2. Status Layanan</h2>
              <p><strong>Mai-Milu bukan perusahaan transportasi.</strong> Kami tidak mempekerjakan pengemudi dan tidak memiliki armada kendaraan. Kami hanya menyediakan platform (papan pengumuman digital) agar warga dapat saling berbagi tumpangan (carpooling).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3. Kewajiban Pengguna</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Anda wajib memberikan informasi identitas yang asli, akurat, dan terbaru (termasuk KTP) untuk tujuan verifikasi keamanan komunitas.</li>
                <li>Pengemudi wajib memiliki Surat Izin Mengemudi (SIM) yang sah dan kendaraan yang layak jalan.</li>
                <li>Pengguna dilarang menggunakan platform ini untuk tindakan melanggar hukum, penipuan, atau pelecehan.</li>
                <li>Setiap kesepakatan titik kumpul dan waktu keberangkatan adalah tanggung jawab antara Pengemudi dan Penumpang.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">4. Uang Bensin (Kontribusi)</h2>
              <p>Biaya yang tertera pada aplikasi adalah bentuk <strong>kontribusi patungan biaya bahan bakar (Uang Bensin)</strong>, bukan tarif komersial taksi. Pembayaran dilakukan secara langsung antara Penumpang dan Pengemudi di luar sistem aplikasi Mai-Milu.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">5. Batasan Tanggung Jawab</h2>
              <p>Mai-Milu (termasuk pendiri dan admin) tidak bertanggung jawab atas segala kerugian, cedera, kerusakan barang, atau perselisihan yang terjadi selama perjalanan. Pengguna secara sadar menanggung risiko yang melekat pada aktivitas berbagi tumpangan.</p>
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