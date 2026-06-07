"use client";
import "../landing.css";
import { X } from "@phosphor-icons/react";

export default function PrivacyPage() {
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
        <h1>Kebijakan Privasi</h1>
        <p className="last-updated">Pembaruan Terakhir: 1 April 2026</p>

        <div className="legal-section">
          <h2>1. Pengumpulan Data</h2>
          <p>
            Kami mengumpulkan informasi yang Anda berikan secara langsung,
            termasuk namun tidak terbatas pada: Nama Lengkap, Alamat Email,
            Nomor WhatsApp, Alamat Rumah, Foto Selfie, dan Foto KTP.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Penggunaan Data</h2>
          <p>
            Data pribadi Anda digunakan secara eksklusif untuk: (a)
            Memverifikasi identitas pengguna demi keamanan komunitas. (b)
            Memfasilitasi komunikasi antar pengguna via WhatsApp terkait
            tumpangan. (c) Menjaga agar platform bebas dari akun palsu dan spam.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Perlindungan & Penghapusan</h2>
          <p>
            Mai-Milu tidak akan pernah menjual atau menyewakan data Anda kepada
            pihak ketiga. Dokumen sensitif seperti KTP akan diamankan secara
            digital dan akan langsung dihapus dari server kami segera setelah
            akun Anda selesai diverifikasi oleh Admin. Anda berhak meminta
            penghapusan akun dan seluruh data terkait kapan saja dengan
            menghubungi kami.
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
