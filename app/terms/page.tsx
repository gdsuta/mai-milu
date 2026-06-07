"use client";
import "../landing.css";
import { X } from "@phosphor-icons/react";

export default function TermsPage() {
  return (
    <>
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
