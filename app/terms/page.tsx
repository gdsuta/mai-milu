"use client";

import { X } from "@phosphor-icons/react";

export default function TermsPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --indigo:    #4338ca;
  --indigo-d:  #3730a3;
  --gray-900:  #111827;
  --gray-700:  #374151;
  --gray-500:  #6b7280;
  --gray-200:  #e5e7eb;
  --gray-100:  #f3f4f6;
  --white:     #ffffff;
  --radius-xl: 20px;
}
html { scroll-behavior: smooth; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--gray-700); background: #f9fafb; overflow-x: hidden; }
h1,h2,h3,h4 { font-family: 'Sora', sans-serif; color: var(--gray-900); line-height: 1.15; }

nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 1.5rem;
}
.nav-inner {
  max-width: 800px; margin: auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 64px;
}
.nav-logo { display: flex; align-items: center; gap: .6rem; text-decoration: none; }
.nav-logo-icon { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; }
.nav-logo span { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--indigo); }

.btn-primary {
  background: var(--indigo); color: var(--white);
  padding: .85rem 1.8rem; border-radius: 10px;
  font-weight: 700; font-size: .95rem; border: none; cursor: pointer;
  transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-primary:hover { background: var(--indigo-d); transform: translateY(-1px); }
.btn-ghost {
  background: transparent; color: var(--gray-500);
  padding: .4rem .9rem; border-radius: 8px;
  font-weight: 700; font-size: .85rem; border: 1px solid var(--gray-200); cursor: pointer;
  transition: all .2s; display: inline-flex; align-items: center; gap: .4rem; font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-ghost:hover { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }

.legal-container {
  max-width: 800px; margin: 3rem auto; padding: 3rem;
  background: var(--white); border-radius: var(--radius-xl);
  box-shadow: 0 4px 20px rgba(0,0,0,.03); border: 1px solid var(--gray-100);
}
.legal-container h1 { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 800; color: var(--indigo); margin-bottom: .5rem; }
.last-updated { font-size: .9rem; color: var(--gray-500); font-weight: 600; margin-bottom: 2.5rem; }
.legal-section { margin-bottom: 2rem; }
.legal-section h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; }
.legal-section p { font-size: .95rem; line-height: 1.8; color: var(--gray-700); }

@media(max-width: 640px) {
  .legal-container { margin: 1.5rem 1rem; padding: 1.5rem; }
}`,
        }}
      />

      <nav>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <img
                src="/icon-72x72.png"
                alt="Mai-Milu Logo"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            </div>
            <span>Mai-Milu</span>
          </a>
          <button onClick={() => window.close()} className="btn-ghost">
            <X weight="bold" size="1.1em" />{" "}
            <span className="hidden sm:inline">Tutup Tab</span>
          </button>
        </div>
      </nav>

      <main className="legal-container">
        <h1>Syarat & Ketentuan</h1>
        <p className="last-updated">Pembaruan Terakhir: 1 April 2026</p>

        <div className="legal-section">
          <h2>1. Pengantar</h2>
          <p>
            Selamat datang di Mai-Milu. Dengan mendaftar dan menggunakan
            aplikasi Mai-Milu, Anda setuju untuk tunduk pada Syarat dan
            Ketentuan ini. Mai-Milu adalah platform teknologi yang menghubungkan
            pengemudi yang memiliki kursi kosong dengan penumpang yang searah,
            khususnya untuk komunitas di Buleleng dan sekitarnya.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Status Layanan</h2>
          <p>
            <strong>Mai-Milu bukan perusahaan transportasi.</strong> Kami tidak
            mempekerjakan pengemudi dan tidak memiliki armada kendaraan. Kami
            hanya menyediakan platform digital untuk mempertemukan anggota
            komunitas. Kesepakatan biaya (uang bensin) dan perjalanan sepenuhnya
            menjadi tanggung jawab antara pengemudi dan penumpang.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Keamanan & Verifikasi</h2>
          <p>
            Untuk menjaga keamanan komunitas, seluruh pengguna wajib mengunggah
            foto wajah (Selfie) dan foto Kartu Tanda Penduduk (KTP) yang sah.
            Data ini disimpan dengan aman dan hanya digunakan oleh Admin untuk
            proses verifikasi. Kegagalan mematuhi norma kesopanan atau indikasi
            penipuan akan mengakibatkan pemblokiran akun secara permanen.
          </p>
        </div>

        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--gray-200)",
            textAlign: "center",
          }}
        >
          <button onClick={() => window.close()} className="btn-primary">
            Tutup Halaman Ini
          </button>
        </div>
      </main>
    </>
  );
}
