import "./globals.css";
import "./landing.css";
import type { Metadata } from "next";
import {
  TreePalm,
  Ticket,
  LockKey,
  Star,
  Car,
  MapPin,
  FlagCheckered,
  Clock,
  Repeat,
  Plus,
  CheckCircle,
  IdentificationCard,
  ChatTeardropText,
  MapTrifold,
  Target,
  ShieldCheck,
  Camera,
  Lightning,
  DeviceMobile,
  User,
  WhatsappLogo,
  XCircle,
  List,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Mai-Milu — Bali Carpool Community",
  description:
    "Platform carpooling komunitas untuk warga Bali. Menghubungkan pengemudi dengan kursi kosong dan penumpang yang searah.",
  openGraph: {
    title: "Mai-Milu — Bali Carpool Community",
    description: "Berbagi tumpangan di Bali, lebih mudah.",
    url: "https://mai-milu.vercel.app",
    siteName: "Mai-Milu",
    locale: "id_ID",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      {/* ── Navbar ── */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">
              <img
                src="/icon-72x72.png"
                alt="Mai-Milu Logo"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            </div>
            <span>Mai-Milu</span>
          </a>

          {/* Mobile Menu Toggle */}
          <input
            type="checkbox"
            id="menu-toggle"
            className="mobile-menu-toggle"
          />
          <label htmlFor="menu-toggle" className="mobile-menu-btn">
            <List size="1.8em" weight="bold" />
          </label>

          <ul className="nav-links">
            <li>
              <a href="#fitur">Fitur</a>
            </li>
            <li>
              <a href="#keamanan">Keamanan</a>
            </li>
            <li>
              <a href="#cara-kerja">Cara Kerja</a>
            </li>
            <li>
              <a href="https://mai-milu.vercel.app/login" className="nav-cta">
                Masuk
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">
              <TreePalm weight="fill" size="1.2em" /> Komunitas Carpool Bali
            </div>
            <h1>
              Berbagi Tumpangan
              <br />
              di <em>Bali</em>, Lebih Mudah.
            </h1>
            <p>
              Mai-Milu menghubungkan pengemudi dengan kursi kosong dan penumpang
              yang searah. Hemat biaya, kurangi macet, bangun komunitas — mulai
              dari Singaraja sampai Denpasar.
            </p>
            <div className="hero-btns">
              <a
                href="https://mai-milu.vercel.app/register"
                className="btn-primary"
              >
                <Ticket weight="fill" size="1.2em" /> Daftar Sekarang
              </a>
              <a href="https://mai-milu.vercel.app/login" className="btn-ghost">
                Sudah punya akun?
              </a>
            </div>
            <div className="hero-rating">
              <div className="hero-rating-item">
                <div className="stars">
                  <Star weight="fill" />
                  <Star weight="fill" />
                  <Star weight="fill" />
                  <Star weight="fill" />
                  <Star weight="fill" />
                </div>{" "}
                Pengemudi Terverifikasi
              </div>
              <div className="hero-rating-item">
                <LockKey weight="fill" size="1.2em" /> Sistem Pemesanan Aman
              </div>
            </div>
          </div>

          <div className="hero-phone">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="phone-nav">
                  <div className="phone-nav-dot">
                    <img
                      src="/icon-72x72.png"
                      alt="Mai-Milu Logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  Mai-Milu
                </div>
                <div className="phone-content">
                  <div className="phone-offer-btn">
                    <Plus weight="bold" size="1.2em" /> Tawarkan Tumpangan
                  </div>
                  <div className="phone-section-title">Tumpangan Tersedia</div>

                  <div className="phone-card">
                    <div className="phone-card-row1">
                      <div>
                        <div className="phone-driver">I Made Prema</div>
                        <div className="phone-badge">
                          <CheckCircle weight="fill" size="1.2em" />{" "}
                          Terverifikasi
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="phone-price">Rp 12.000</div>
                        <div style={{ fontSize: "8px", color: "#6b7280" }}>
                          2 kursi
                        </div>
                      </div>
                    </div>
                    <div className="phone-route">
                      <MapPin weight="fill" size="1.2em" /> Singaraja →{" "}
                      <FlagCheckered weight="fill" size="1.2em" /> Denpasar
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock weight="fill" size="1.2em" /> Selasa, 5 Mei · 07.30
                      WITA
                    </div>
                    <div className="phone-book-btn">
                      <Ticket weight="fill" size="1.2em" /> Pesan Kursi
                    </div>
                  </div>

                  <div className="phone-card">
                    <div className="phone-card-row1">
                      <div>
                        <div className="phone-driver">Ni Putu Kaila</div>
                        <div className="phone-badge">
                          <CheckCircle weight="fill" size="1.2em" />{" "}
                          Terverifikasi
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="phone-price">Rp 20.000</div>
                        <div style={{ fontSize: "8px", color: "#6b7280" }}>
                          3 kursi
                        </div>
                      </div>
                    </div>
                    <div className="phone-route">
                      <MapPin weight="fill" size="1.2em" /> Sangsit →{" "}
                      <FlagCheckered weight="fill" size="1.2em" /> Ubud
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock weight="fill" size="1.2em" /> Senin–Jumat · 08.00
                      WITA <Repeat weight="bold" size="1.2em" />
                    </div>
                    <div className="phone-book-btn">
                      <Ticket weight="fill" size="1.2em" /> Pesan Kursi
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-float">
              <span className="phone-float-dot"></span>3 tumpangan aktif
            </div>
            <div className="phone-float2">
              <Ticket weight="fill" size="1.2em" /> Kursi Terkonfirmasi!
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="stats-inner">
          <div className="fade-up">
            <div className="stat-num">500+</div>
            <div className="stat-label">Anggota Terverifikasi</div>
          </div>
          <div className="fade-up">
            <div className="stat-num">1.200+</div>
            <div className="stat-label">Tumpangan Selesai</div>
          </div>
          <div className="fade-up">
            <div className="stat-num">8</div>
            <div className="stat-label">Kabupaten di Bali</div>
          </div>
          <div className="fade-up">
            <div className="stat-num">
              4,8 <Star weight="fill" size="0.8em" color="var(--amber)" />
            </div>
            <div className="stat-label">Rating Rata-rata</div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how" id="cara-kerja">
        <div className="section-head">
          <div className="section-tag">Cara Kerja</div>
          <h2>Tiga Langkah Sederhana</h2>
          <p>Dari pendaftaran hingga perjalanan, semua terstruktur dan aman.</p>
        </div>
        <div className="steps">
          <div className="step fade-up">
            <div className="step-icon">
              <IdentificationCard weight="duotone" size="1em" />
            </div>
            <div className="step-num">1</div>
            <h3>Daftar & Verifikasi KTP</h3>
            <p>
              Upload foto selfie dan KTP untuk diverifikasi admin. Komunitas
              yang aman dimulai dari identitas yang jelas.
            </p>
          </div>
          <div className="step fade-up">
            <div className="step-icon">
              <Car weight="duotone" size="1em" />
            </div>
            <div className="step-num">2</div>
            <h3>Temukan atau Tawarkan Tumpangan</h3>
            <p>
              Browse tumpangan yang tersedia, gunakan filter rute, atau posting
              jadwal rutin mingguan Anda.
            </p>
          </div>
          <div className="step fade-up">
            <div className="step-icon">
              <Ticket weight="duotone" size="1em" />
            </div>
            <div className="step-num">3</div>
            <h3>Pesan Kursi & Jalan Bersama</h3>
            <p>
              Pesan langsung dalam aplikasi, chat dengan pengemudi, dan beri
              ulasan setelah perjalanan.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="fitur">
        <div className="section-head">
          <div className="section-tag">Fitur Unggulan</div>
          <h2>Semua yang Kamu Butuhkan</h2>
          <p>Dibangun khusus untuk kebutuhan komuter Bali sehari-hari.</p>
        </div>
        <div className="features-grid">
          <div className="feat-card fade-up">
            <div className="feat-icon">
              <Repeat weight="duotone" size="1em" />
            </div>
            <h3>Jadwal Rutin (Sen–Jum)</h3>
            <p>
              Pengemudi bisa buat jadwal berulang hingga 8 minggu ke depan.
              Sekali posting, langsung banyak perjalanan.
            </p>
          </div>
          <div className="feat-card green fade-up">
            <div className="feat-icon">
              <Ticket weight="duotone" size="1em" />
            </div>
            <h3>Sistem Pemesanan Kursi</h3>
            <p>
              Penumpang bisa pesan kursi langsung di aplikasi. Pengemudi
              konfirmasi atau tolak — semua terekam otomatis.
            </p>
          </div>
          <div className="feat-card amber fade-up">
            <div className="feat-icon">
              <ChatTeardropText weight="duotone" size="1em" />
            </div>
            <h3>In-App Chat Real-time</h3>
            <p>
              Komunikasi driver-penumpang langsung di dalam app dengan Supabase
              Realtime. Tidak perlu bergantung pada WhatsApp.
            </p>
          </div>
          <div className="feat-card fade-up">
            <div className="feat-icon">
              <Star weight="duotone" size="1em" />
            </div>
            <h3>Rating & Ulasan Driver</h3>
            <p>
              Setelah perjalanan, penumpang beri ulasan 1–5 bintang. Profil
              publik driver menampilkan distribusi rating dan komentar.
            </p>
          </div>
          <div className="feat-card green fade-up">
            <div className="feat-icon">
              <MapTrifold weight="duotone" size="1em" />
            </div>
            <h3>Kalkulator Jarak Otomatis</h3>
            <p>
              Integrasi OpenRouteService + Nominatim OSM menghitung estimasi
              jarak dan merekomendasikan uang bensin.
            </p>
          </div>
          <div className="feat-card amber fade-up">
            <div className="feat-icon">
              <Target weight="duotone" size="1em" />
            </div>
            <h3>Algoritma Pencocokan Rute</h3>
            <p>
              Tiga tumpangan paling cocok muncul di atas listing — berdasarkan
              lokasi rumah, waktu keberangkatan, dan harga.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="trust" id="keamanan">
        <div className="trust-inner">
          <div>
            <div className="section-tag" style={{ textAlign: "left" }}>
              Keamanan & Kepercayaan
            </div>
            <h2
              style={{
                fontSize: "clamp(1.7rem,3vw,2.4rem)",
                fontWeight: 800,
                marginBottom: ".9rem",
              }}
            >
              Komunitas yang
              <br />
              Aman dan Terverifikasi
            </h2>
            <p
              style={{
                lineHeight: 1.7,
                color: "var(--gray-500)",
                fontSize: ".95rem",
              }}
            >
              Mai-Milu bukan sekadar daftar nomor. Setiap anggota melalui
              verifikasi KTP manual oleh admin sebelum bisa posting atau memesan
              tumpangan.
            </p>
            <div className="trust-pills">
              <div className="trust-pill">
                <IdentificationCard weight="fill" size="1.2em" /> Verifikasi KTP
              </div>
              <div className="trust-pill">
                <LockKey weight="fill" size="1.2em" /> Row Level Security
              </div>
              <div className="trust-pill">
                <ShieldCheck weight="fill" size="1.2em" /> RPC Atomik
              </div>
              <div className="trust-pill">
                <Camera weight="fill" size="1.2em" /> Foto Selfie Wajib
              </div>
              <div className="trust-pill">
                <Lightning weight="fill" size="1.2em" /> Transaksi Aman
              </div>
            </div>
          </div>
          <div className="trust-visual">
            <div className="trust-item">
              <div className="trust-item-icon">
                <IdentificationCard weight="duotone" size="1em" />
              </div>
              <div>
                <h4>Verifikasi KTP Wajib</h4>
                <p>Foto KTP + selfie dikonfirmasi admin sebelum akun aktif</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <LockKey weight="duotone" size="1em" />
              </div>
              <div>
                <h4>Database Terlindungi RLS</h4>
                <p>
                  Row Level Security di setiap tabel — pengguna hanya bisa akses
                  data miliknya
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <Ticket weight="duotone" size="1em" />
              </div>
              <div>
                <h4>Pemesanan Anti-Race Condition</h4>
                <p>
                  RPC atomik dengan row-lock mencegah double-booking dan kursi
                  negatif
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">
                <DeviceMobile weight="duotone" size="1em" />
              </div>
              <div>
                <h4>PWA Installable</h4>
                <p>
                  Install langsung dari browser — tersedia di Android & iOS
                  tanpa App Store
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="social">
        <div className="social-inner">
          <div className="section-head">
            <div className="section-tag">Kata Mereka</div>
            <h2>Dipercaya Komunitas Bali</h2>
            <p>
              Dari komuter harian sampai driver paruh waktu — Mai-Milu membantu
              semua.
            </p>
          </div>
          <div className="reviews">
            <div className="review fade-up">
              <div className="review-stars">
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
              </div>
              <p className="review-text">
                "Aplikasinya sangat membantu untuk perjalanan rutin
                Singaraja–Denpasar. Jadwal rutin mingguan bikin saya hemat
                bensin setiap bulan."
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#4338ca20", color: "#a5b4fc" }}
                >
                  <User weight="fill" size="1.2em" />
                </div>
                <div>
                  <div className="review-author-name">I Made Wirawan</div>
                  <div className="review-author-role">
                    Pengemudi Rutin, Singaraja
                  </div>
                </div>
              </div>
            </div>
            <div className="review fade-up">
              <div className="review-stars">
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
              </div>
              <p className="review-text">
                "Sebagai penumpang, saya merasa aman karena setiap driver sudah
                terverifikasi KTP. Fitur chat langsung di app juga sangat
                nyaman!"
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#16a34a20", color: "#86efac" }}
                >
                  <User weight="fill" size="1.2em" />
                </div>
                <div>
                  <div className="review-author-name">Ni Luh Ayu Pratiwi</div>
                  <div className="review-author-role">Penumpang, Buleleng</div>
                </div>
              </div>
            </div>
            <div className="review fade-up">
              <div className="review-stars">
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="fill" />
                <Star weight="duotone" />
              </div>
              <p className="review-text">
                "Sistem pemesanan kursinya jauh lebih rapi dari grup WhatsApp
                dulu. Penumpang pesan, saya konfirmasi — beres. Kami semua
                hemat."
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#f59e0b20", color: "#fcd34d" }}
                >
                  <User weight="fill" size="1.2em" />
                </div>
                <div>
                  <div className="review-author-name">Kadek Bagus Ariawan</div>
                  <div className="review-author-role">Pengemudi, Gianyar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compare ── */}
      <section className="compare">
        <div className="section-head">
          <div className="section-tag">Perbandingan</div>
          <h2>Mai-Milu vs Cara Lama</h2>
          <p>
            Lihat seberapa jauh Mai-Milu meningkatkan pengalaman carpool Bali.
          </p>
        </div>
        <div className="compare-table">
          <table>
            <thead>
              <tr>
                <th>Fitur</th>
                <th>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <img
                      src="/icon-72x72.png"
                      alt="Mai-Milu Logo"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                      }}
                    />
                    Mai-Milu
                  </div>
                </th>
                <th>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <WhatsappLogo weight="fill" size="1.2em" /> Grup WA
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Verifikasi identitas pengemudi</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Pemesanan kursi terstruktur</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Chat langsung driver–penumpang</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Jadwal rutin (Sen–Jum)</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Kalkulator harga otomatis</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Rating & ulasan driver</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Profil driver publik</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
              <tr>
                <td>Bisa diinstall di HP (PWA)</td>
                <td>
                  <CheckCircle className="yes" weight="fill" />
                </td>
                <td>
                  <XCircle className="no" weight="fill" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="cta-inner">
          <h2>Siap Bergabung dengan Komunitas?</h2>
          <p>
            Daftar sekarang, verifikasi KTP Anda, dan mulai berbagi tumpangan
            bersama ribuan warga Bali.
          </p>
          <div className="cta-btns">
            <a
              href="https://mai-milu.vercel.app/register"
              className="btn-white"
            >
              <Ticket weight="fill" size="1.2em" /> Daftar Gratis
            </a>
            {/* PERBAIKAN: Tombol Login kini menggunakan .btn-outline-white */}
            <a
              href="https://mai-milu.vercel.app/login"
              className="btn-outline-white"
            >
              Sudah punya akun? Login
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <img
                src="/icon-72x72.png"
                alt="Mai-Milu Logo"
                style={{ width: "24px", height: "24px", borderRadius: "50%" }}
              />{" "}
              Mai-Milu
            </div>
            <p className="footer-desc">
              Platform carpooling komunitas untuk warga Bali. Mengurangi macet,
              menghemat biaya, mempererat semeton.
            </p>
          </div>
          <div className="footer-col">
            <h5>Aplikasi</h5>
            <ul>
              <li>
                <a href="https://mai-milu.vercel.app/register">Daftar</a>
              </li>
              <li>
                <a href="https://mai-milu.vercel.app/login">Masuk</a>
              </li>
              <li>
                <a href="https://mai-milu.vercel.app/home">Cari Tumpangan</a>
              </li>
              <li>
                <a href="https://mai-milu.vercel.app/offer-ride">
                  Tawarkan Tumpangan
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Informasi</h5>
            <ul>
              <li>
                <a
                  href="https://mai-milu.vercel.app/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="https://mai-milu.vercel.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a
              href="https://mai-milu.vercel.app/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Syarat
            </a>
            <a
              href="https://mai-milu.vercel.app/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privasi
            </a>
          </div>
          <div className="footer-col">
            <h5>Pengembang</h5>
            <ul>
              {/* PERBAIKAN: Nama pengembang dan kontak baru */}
              <li className="developer-name">Gede Suta Pinatih</li>
              <li>
                <a
                  href="https://t.me/+6281239156586"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram: +62 812-3915-6586
                </a>
              </li>
              <li>
                <a href="mailto:gdsuta@gmail.com">Email: gdsuta@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2026 Mai-Milu — Bali Carpool Community. Made with ❤️ in Bali.
          </span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="https://mai-milu.vercel.app/terms">Syarat</a>
            <a href="https://mai-milu.vercel.app/privacy">Privasi</a>
          </div>
        </div>
      </footer>
    </>
  );
}
