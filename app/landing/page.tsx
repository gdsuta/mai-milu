import type { Metadata } from "next";

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
      {/* ── Google Fonts ──
           Add this to app/layout.tsx if not already present:
           import { Sora, Plus_Jakarta_Sans } from 'next/font/google'
           Or keep the <link> tag below in your root layout. ──*/}
      <style
        dangerouslySetInnerHTML={{
          __html: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --indigo:    #4338ca;
  --indigo-d:  #3730a3;
  --indigo-l:  #eef2ff;
  --amber:     #f59e0b;
  --amber-l:   #fffbeb;
  --green:     #16a34a;
  --green-l:   #f0fdf4;
  --gray-900:  #111827;
  --gray-700:  #374151;
  --gray-500:  #6b7280;
  --gray-200:  #e5e7eb;
  --gray-100:  #f3f4f6;
  --white:     #ffffff;
  --radius-xl: 20px;
  --radius-lg: 14px;
  --shadow-lg: 0 20px 60px rgba(67,56,202,.12);
}

html { scroll-behavior: smooth; }
body { font-family: 'Plus Jakarta Sans', sans-serif; color: var(--gray-700); background: var(--white); overflow-x: hidden; }
h1,h2,h3,h4 { font-family: 'Sora', sans-serif; color: var(--gray-900); line-height: 1.15; }

/* ── Navbar ──────────────────────────────────────── */
nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--gray-200);
  padding: 0 1.5rem;
}
.nav-inner {
  max-width: 1120px; margin: auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 64px;
}
.nav-logo { display: flex; align-items: center; gap: .6rem; text-decoration: none; }
.nav-logo-icon {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--indigo), #6d28d9);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}
.nav-logo span { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--indigo); }
.nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
.nav-links a { text-decoration: none; font-size: .9rem; font-weight: 600; color: var(--gray-700); transition: color .2s; }
.nav-links a:hover { color: var(--indigo); }
.nav-cta {
  background: var(--indigo); color: var(--white) !important;
  padding: .5rem 1.2rem; border-radius: 8px; transition: background .2s !important;
}
.nav-cta:hover { background: var(--indigo-d) !important; }
@media(max-width:640px){.nav-links{display:none;}}

/* ── Hero ────────────────────────────────────────── */
.hero {
  background: linear-gradient(160deg, #f0f4ff 0%, #faf5ff 55%, #fff7ed 100%);
  padding: 6rem 1.5rem 4rem;
  position: relative; overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute; top: -120px; right: -120px;
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero::after {
  content: '';
  position: absolute; bottom: -80px; left: -80px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,.10) 0%, transparent 70%);
  pointer-events: none;
}
.hero-inner {
  max-width: 1120px; margin: auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: var(--indigo-l); color: var(--indigo);
  padding: .35rem .9rem; border-radius: 999px;
  font-size: .8rem; font-weight: 700; margin-bottom: 1.5rem;
  letter-spacing: .03em;
}
.hero h1 { font-size: clamp(2.2rem, 4vw, 3.4rem); font-weight: 800; margin-bottom: 1.25rem; }
.hero h1 em { font-style: normal; color: var(--indigo); }
.hero p { font-size: 1.05rem; color: var(--gray-500); line-height: 1.7; margin-bottom: 2rem; max-width: 460px; }
.hero-btns { display: flex; gap: .85rem; flex-wrap: wrap; }
.btn-primary {
  background: var(--indigo); color: var(--white);
  padding: .85rem 1.8rem; border-radius: 10px;
  font-weight: 700; font-size: .95rem; text-decoration: none;
  transition: all .2s; box-shadow: 0 4px 20px rgba(67,56,202,.3);
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-primary:hover { background: var(--indigo-d); transform: translateY(-1px); }
.btn-ghost {
  background: transparent; color: var(--indigo);
  padding: .85rem 1.8rem; border-radius: 10px;
  font-weight: 700; font-size: .95rem; text-decoration: none;
  border: 2px solid var(--indigo); transition: all .2s;
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-ghost:hover { background: var(--indigo-l); }
.hero-rating { display: flex; align-items: center; gap: 1.5rem; margin-top: 1.5rem; }
.hero-rating-item { display: flex; align-items: center; gap: .5rem; font-size: .85rem; font-weight: 600; color: var(--gray-500); }
.stars { color: var(--amber); letter-spacing: -.1em; font-size: 1rem; }

/* Phone mockup */
.hero-phone { position: relative; display: flex; justify-content: center; align-items: flex-end; }
.phone-frame {
  width: 260px; height: 520px; border-radius: 38px;
  background: var(--gray-900);
  box-shadow: 0 40px 100px rgba(0,0,0,.25), 0 0 0 10px #1f2937;
  overflow: hidden; position: relative; flex-shrink: 0;
}
.phone-notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100px; height: 28px; background: var(--gray-900);
  border-radius: 0 0 18px 18px; z-index: 10;
}
.phone-screen {
  width: 100%; height: 100%;
  background: linear-gradient(160deg, #f0f4ff, #fff);
  display: flex; flex-direction: column; overflow: hidden;
}
.phone-nav {
  background: var(--white); border-bottom: 1px solid var(--gray-200);
  padding: 38px 12px 10px;
  display: flex; align-items: center; gap: 8px;
  font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 800; color: var(--indigo);
}
.phone-nav-dot { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--indigo), #6d28d9); display:flex;align-items:center;justify-content:center;font-size:9px;color:white; }
.phone-content { padding: 10px; flex: 1; overflow: hidden; }
.phone-offer-btn {
  width: 100%; background: var(--indigo); border-radius: 10px;
  padding: 9px 0; text-align: center; color: white;
  font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 700;
  margin-bottom: 12px;
}
.phone-section-title { font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 800; color: var(--gray-900); margin-bottom: 7px; }
.phone-card {
  background: var(--white); border-radius: 12px;
  border: 1px solid var(--gray-200); padding: 9px;
  margin-bottom: 7px; box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.phone-card-row1 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.phone-driver { font-family: 'Sora', sans-serif; font-size: 9px; font-weight: 700; color: var(--gray-900); }
.phone-price { font-family: 'Sora', sans-serif; font-size: 10px; font-weight: 800; color: var(--indigo); }
.phone-badge { background: var(--green-l); color: var(--green); font-size: 7px; font-weight: 700; padding: 2px 5px; border-radius: 4px; display:inline-block;margin-top:2px; }
.phone-route { font-size: 8px; color: var(--gray-500); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.phone-wa-btn { background: #25d366; border-radius: 6px; padding: 4px 0; text-align: center; color: white; font-size: 8px; font-weight: 700; margin-top: 5px; }
.phone-book-btn { background: var(--indigo); border-radius: 6px; padding: 4px 0; text-align: center; color: white; font-size: 8px; font-weight: 700; margin-top: 5px; }
.phone-float {
  position: absolute; top: 30%; right: -28px;
  background: var(--white); border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,.12); padding: 8px 12px;
  font-size: 8px; font-family: 'Sora', sans-serif; font-weight: 700; color: var(--gray-900);
  white-space: nowrap;
}
.phone-float-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; margin-right: 4px; }
.phone-float2 {
  position: absolute; bottom: 28%; left: -36px;
  background: var(--indigo); border-radius: 12px;
  box-shadow: 0 8px 30px rgba(67,56,202,.3); padding: 8px 12px;
  font-size: 8px; font-family: 'Sora', sans-serif; font-weight: 700; color: white;
  white-space: nowrap;
}
@media(max-width:900px){
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero-phone { margin-top: 2rem; }
  .hero-btns { justify-content: center; }
  .hero-rating { justify-content: center; }
  .phone-float,.phone-float2 { display: none; }
  .hero p { max-width: 100%; }
}

/* ── Stats ───────────────────────────────────────── */
.stats {
  background: var(--indigo); padding: 3rem 1.5rem;
}
.stats-inner {
  max-width: 1120px; margin: auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center;
}
.stat-num { font-family: 'Sora', sans-serif; font-size: 2.4rem; font-weight: 800; color: var(--white); line-height: 1; }
.stat-label { font-size: .85rem; font-weight: 600; color: rgba(255,255,255,.65); margin-top: .4rem; }
@media(max-width:640px){ .stats-inner { grid-template-columns: repeat(2, 1fr); } }

/* ── How it works ────────────────────────────────── */
.how { padding: 5.5rem 1.5rem; background: var(--white); }
.section-head { text-align: center; margin-bottom: 3.5rem; }
.section-tag {
  display: inline-block; background: var(--indigo-l); color: var(--indigo);
  font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: .3rem .9rem; border-radius: 999px; margin-bottom: 1rem;
}
.section-head h2 { font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 800; margin-bottom: .8rem; }
.section-head p { font-size: 1rem; color: var(--gray-500); max-width: 520px; margin: auto; line-height: 1.7; }
.steps {
  max-width: 900px; margin: auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;
}
.step { text-align: center; }
.step-num {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--indigo-l); color: var(--indigo);
  font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem; position: relative;
}
.step-num::after {
  content: '';
  position: absolute; right: -100%; top: 50%; width: 100%; height: 2px;
  background: var(--gray-200); z-index: 0;
}
.step:last-child .step-num::after { display: none; }
.step h3 { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; }
.step p { font-size: .88rem; color: var(--gray-500); line-height: 1.6; }
.step-icon { font-size: 1.8rem; margin-bottom: .75rem; }
@media(max-width:640px){ .steps { grid-template-columns: 1fr; } .step-num::after { display: none; } }

/* ── Features ────────────────────────────────────── */
.features { padding: 5.5rem 1.5rem; background: var(--gray-100); }
.features-grid {
  max-width: 1120px; margin: auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.feat-card {
  background: var(--white); border-radius: var(--radius-xl);
  padding: 1.75rem; border: 1px solid var(--gray-200);
  transition: box-shadow .2s, transform .2s;
}
.feat-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
.feat-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--indigo-l); display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 1.1rem;
}
.feat-card.green .feat-icon { background: var(--green-l); }
.feat-card.amber .feat-icon { background: var(--amber-l); }
.feat-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; }
.feat-card p { font-size: .87rem; color: var(--gray-500); line-height: 1.65; }
@media(max-width:900px){ .features-grid { grid-template-columns: repeat(2,1fr); } }
@media(max-width:580px){ .features-grid { grid-template-columns: 1fr; } }

/* ── Trust / Safety ──────────────────────────────── */
.trust { padding: 5.5rem 1.5rem; background: var(--white); }
.trust-inner {
  max-width: 1120px; margin: auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
}
.trust-pills { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.trust-pill {
  display: flex; align-items: center; gap: .5rem;
  background: var(--indigo-l); color: var(--indigo);
  font-size: .82rem; font-weight: 700; padding: .5rem 1rem;
  border-radius: 999px;
}
.trust-visual {
  background: linear-gradient(135deg, var(--indigo-l) 0%, #ede9fe 100%);
  border-radius: var(--radius-xl); padding: 2.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.trust-item {
  background: var(--white); border-radius: var(--radius-lg);
  padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}
.trust-item-icon { font-size: 1.5rem; flex-shrink: 0; }
.trust-item h4 { font-size: .9rem; font-weight: 700; margin-bottom: .15rem; }
.trust-item p { font-size: .8rem; color: var(--gray-500); }
@media(max-width:780px){ .trust-inner { grid-template-columns: 1fr; } }

/* ── Testimonial / Social proof ──────────────────── */
.social { padding: 5.5rem 1.5rem; background: var(--gray-900); }
.social-inner { max-width: 1120px; margin: auto; }
.social .section-head h2 { color: var(--white); }
.social .section-head p { color: rgba(255,255,255,.55); }
.social .section-tag { background: rgba(255,255,255,.1); color: rgba(255,255,255,.7); }
.reviews {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem;
}
.review {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--radius-xl); padding: 1.75rem;
}
.review-stars { color: var(--amber); font-size: 1rem; margin-bottom: .75rem; }
.review-text { font-size: .9rem; color: rgba(255,255,255,.8); line-height: 1.7; margin-bottom: 1.25rem; }
.review-author { display: flex; align-items: center; gap: .75rem; }
.review-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  flex-shrink: 0;
}
.review-author-name { font-size: .85rem; font-weight: 700; color: var(--white); }
.review-author-role { font-size: .75rem; color: rgba(255,255,255,.45); }
@media(max-width:780px){ .reviews { grid-template-columns: 1fr; } }

/* ── Compare table ───────────────────────────────── */
.compare { padding: 5.5rem 1.5rem; background: var(--white); }
.compare-table { max-width: 860px; margin: 3rem auto 0; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--gray-200); }
.compare-table table { width: 100%; border-collapse: collapse; font-size: .9rem; }
.compare-table th { background: var(--indigo); color: var(--white); padding: .9rem 1.2rem; text-align: left; font-family: 'Sora', sans-serif; font-weight: 700; }
.compare-table th:first-child { width: 50%; }
.compare-table td { padding: .85rem 1.2rem; border-bottom: 1px solid var(--gray-200); }
.compare-table tr:last-child td { border-bottom: none; }
.compare-table tr:nth-child(even) td { background: var(--gray-100); }
.yes { color: var(--green); font-size: 1.1rem; }
.no  { color: #ef4444; font-size: 1.1rem; }

/* ── CTA ─────────────────────────────────────────── */
.cta {
  padding: 6rem 1.5rem; text-align: center;
  background: linear-gradient(135deg, var(--indigo) 0%, #6d28d9 100%);
  position: relative; overflow: hidden;
}
.cta::before {
  content: ''; position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.cta-inner { position: relative; max-width: 620px; margin: auto; }
.cta h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 800; color: var(--white); margin-bottom: 1rem; }
.cta p { font-size: 1rem; color: rgba(255,255,255,.7); line-height: 1.7; margin-bottom: 2.5rem; }
.cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-white {
  background: var(--white); color: var(--indigo);
  padding: .9rem 2rem; border-radius: 10px;
  font-weight: 700; font-size: .95rem; text-decoration: none;
  transition: all .2s; box-shadow: 0 4px 20px rgba(0,0,0,.2);
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0,0,0,.25); }
.btn-outline-white {
  background: transparent; color: var(--white);
  padding: .9rem 2rem; border-radius: 10px; border: 2px solid rgba(255,255,255,.4);
  font-weight: 700; font-size: .95rem; text-decoration: none;
  transition: all .2s;
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-outline-white:hover { border-color: white; background: rgba(255,255,255,.1); }

/* ── Footer ──────────────────────────────────────── */
footer { background: var(--gray-900); padding: 3.5rem 1.5rem 2rem; color: rgba(255,255,255,.6); }
.footer-inner { max-width: 1120px; margin: auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2.5rem; }
.footer-brand { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--white); margin-bottom: .75rem; display: flex; align-items: center; gap: .5rem; }
.footer-desc { font-size: .85rem; line-height: 1.7; max-width: 260px; }
.footer-col h5 { font-family: 'Sora', sans-serif; font-size: .85rem; font-weight: 700; color: var(--white); margin-bottom: .85rem; text-transform: uppercase; letter-spacing: .06em; }
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: .55rem; }
.footer-col a { color: rgba(255,255,255,.55); text-decoration: none; font-size: .85rem; transition: color .2s; }
.footer-col a:hover { color: var(--white); }
.footer-bottom { max-width: 1120px; margin: 2.5rem auto 0; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,.1); display: flex; justify-content: space-between; align-items: center; font-size: .8rem; flex-wrap: wrap; gap: 1rem; }
.footer-bottom a { color: rgba(255,255,255,.4); text-decoration: none; }
.footer-bottom a:hover { color: white; }
@media(max-width:780px){ .footer-inner { grid-template-columns: 1fr 1fr; } }
@media(max-width:480px){ .footer-inner { grid-template-columns: 1fr; } }

/* ── Animations ──────────────────────────────────── */
@keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
.fade-up { opacity: 0; animation: fadeUp .6s ease forwards; }
.fade-up:nth-child(1) { animation-delay: .1s; }
.fade-up:nth-child(2) { animation-delay: .2s; }
.fade-up:nth-child(3) { animation-delay: .3s; }
.fade-up:nth-child(4) { animation-delay: .4s; }
.fade-up:nth-child(5) { animation-delay: .5s; }
.fade-up:nth-child(6) { animation-delay: .6s; }`,
        }}
      />

      {/* ── Navbar ── */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">🚗</div>
            <span>Mai-Milu</span>
          </a>
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
            <div className="hero-badge">🌴 Komunitas Carpool Bali</div>
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
                🎫 Daftar Sekarang
              </a>
              <a href="https://mai-milu.vercel.app/login" className="btn-ghost">
                Sudah punya akun?
              </a>
            </div>
            <div className="hero-rating">
              <div className="hero-rating-item">
                <span className="stars">★★★★★</span> Pengemudi Terverifikasi
              </div>
              <div className="hero-rating-item">🔒 Sistem Pemesanan Aman</div>
            </div>
          </div>

          <div className="hero-phone">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="phone-nav">
                  <div className="phone-nav-dot">🚗</div>
                  Mai-Milu
                </div>
                <div className="phone-content">
                  <div className="phone-offer-btn">➕ Tawarkan Tumpangan</div>
                  <div className="phone-section-title">Tumpangan Tersedia</div>

                  <div className="phone-card">
                    <div className="phone-card-row1">
                      <div>
                        <div className="phone-driver">I Made Prema</div>
                        <div className="phone-badge">✅ Terverifikasi</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="phone-price">Rp 12.000</div>
                        <div style={{ fontSize: "8px", color: "#6b7280" }}>
                          2 kursi
                        </div>
                      </div>
                    </div>
                    <div className="phone-route">
                      📍 Singaraja → 🏁 Denpasar
                    </div>
                    <div style={{ fontSize: "8px", color: "#6b7280" }}>
                      ⏰ Selasa, 5 Mei · 07.30 WITA
                    </div>
                    <div className="phone-book-btn">🎫 Pesan Kursi</div>
                  </div>

                  <div className="phone-card">
                    <div className="phone-card-row1">
                      <div>
                        <div className="phone-driver">Ni Putu Kaila</div>
                        <div className="phone-badge">✅ Terverifikasi</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="phone-price">Rp 20.000</div>
                        <div style={{ fontSize: "8px", color: "#6b7280" }}>
                          3 kursi
                        </div>
                      </div>
                    </div>
                    <div className="phone-route">📍 Sangsit → 🏁 Ubud</div>
                    <div style={{ fontSize: "8px", color: "#6b7280" }}>
                      ⏰ Senin–Jumat · 08.00 WITA 🔁
                    </div>
                    <div className="phone-book-btn">🎫 Pesan Kursi</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-float">
              <span className="phone-float-dot"></span>3 tumpangan aktif
            </div>
            <div className="phone-float2">🎫 Kursi Terkonfirmasi!</div>
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
            <div className="stat-num">4,8 ★</div>
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
            <div className="step-icon">🪪</div>
            <div className="step-num">1</div>
            <h3>Daftar & Verifikasi KTP</h3>
            <p>
              Upload foto selfie dan KTP untuk diverifikasi admin. Komunitas
              yang aman dimulai dari identitas yang jelas.
            </p>
          </div>
          <div className="step fade-up">
            <div className="step-icon">🚗</div>
            <div className="step-num">2</div>
            <h3>Temukan atau Tawarkan Tumpangan</h3>
            <p>
              Browse tumpangan yang tersedia, gunakan filter rute, atau posting
              jadwal rutin mingguan Anda.
            </p>
          </div>
          <div className="step fade-up">
            <div className="step-icon">🎫</div>
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
            <div className="feat-icon">🔁</div>
            <h3>Jadwal Rutin (Sen–Jum)</h3>
            <p>
              Pengemudi bisa buat jadwal berulang hingga 8 minggu ke depan.
              Sekali posting, langsung banyak perjalanan.
            </p>
          </div>
          <div className="feat-card green fade-up">
            <div className="feat-icon">🎫</div>
            <h3>Sistem Pemesanan Kursi</h3>
            <p>
              Penumpang bisa pesan kursi langsung di aplikasi. Pengemudi
              konfirmasi atau tolak — semua terekam otomatis.
            </p>
          </div>
          <div className="feat-card amber fade-up">
            <div className="feat-icon">💬</div>
            <h3>In-App Chat Real-time</h3>
            <p>
              Komunikasi driver-penumpang langsung di dalam app dengan Supabase
              Realtime. Tidak perlu bergantung pada WhatsApp.
            </p>
          </div>
          <div className="feat-card fade-up">
            <div className="feat-icon">⭐</div>
            <h3>Rating & Ulasan Driver</h3>
            <p>
              Setelah perjalanan, penumpang beri ulasan 1–5 bintang. Profil
              publik driver menampilkan distribusi rating dan komentar.
            </p>
          </div>
          <div className="feat-card green fade-up">
            <div className="feat-icon">🗺️</div>
            <h3>Kalkulator Jarak Otomatis</h3>
            <p>
              Integrasi OpenRouteService + Nominatim OSM menghitung estimasi
              jarak dan merekomendasikan uang bensin.
            </p>
          </div>
          <div className="feat-card amber fade-up">
            <div className="feat-icon">🎯</div>
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
              <div className="trust-pill">🪪 Verifikasi KTP</div>
              <div className="trust-pill">🔒 Row Level Security</div>
              <div className="trust-pill">🛡️ RPC Atomik</div>
              <div className="trust-pill">📷 Foto Selfie Wajib</div>
              <div className="trust-pill">⚡ Transaksi Aman</div>
            </div>
          </div>
          <div className="trust-visual">
            <div className="trust-item">
              <div className="trust-item-icon">🪪</div>
              <div>
                <h4>Verifikasi KTP Wajib</h4>
                <p>Foto KTP + selfie dikonfirmasi admin sebelum akun aktif</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">🔒</div>
              <div>
                <h4>Database Terlindungi RLS</h4>
                <p>
                  Row Level Security di setiap tabel — pengguna hanya bisa akses
                  data miliknya
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">🎫</div>
              <div>
                <h4>Pemesanan Anti-Race Condition</h4>
                <p>
                  RPC atomik dengan row-lock mencegah double-booking dan kursi
                  negatif
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon">📱</div>
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
              <div className="review-stars">★★★★★</div>
              <p className="review-text">
                "Aplikasinya sangat membantu untuk perjalanan rutin
                Singaraja–Denpasar. Jadwal rutin mingguan bikin saya hemat
                bensin setiap bulan."
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#4338ca20" }}
                >
                  🧑
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
              <div className="review-stars">★★★★★</div>
              <p className="review-text">
                "Sebagai penumpang, saya merasa aman karena setiap driver sudah
                terverifikasi KTP. Fitur chat langsung di app juga sangat
                nyaman!"
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#16a34a20" }}
                >
                  👩
                </div>
                <div>
                  <div className="review-author-name">Ni Luh Ayu Pratiwi</div>
                  <div className="review-author-role">Penumpang, Buleleng</div>
                </div>
              </div>
            </div>
            <div className="review fade-up">
              <div className="review-stars">★★★★☆</div>
              <p className="review-text">
                "Sistem pemesanan kursinya jauh lebih rapi dari grup WhatsApp
                dulu. Penumpang pesan, saya konfirmasi — beres. Kami semua
                hemat."
              </p>
              <div className="review-author">
                <div
                  className="review-avatar"
                  style={{ background: "#f59e0b20" }}
                >
                  🧔
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
                <th>🚗 Mai-Milu</th>
                <th>💬 Grup WA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Verifikasi identitas pengemudi</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Pemesanan kursi terstruktur</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Chat langsung driver–penumpang</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Jadwal rutin (Sen–Jum)</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Kalkulator harga otomatis</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Rating & ulasan driver</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Profil driver publik</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
              </tr>
              <tr>
                <td>Bisa diinstall di HP (PWA)</td>
                <td className="yes">✅</td>
                <td className="no">❌</td>
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
              🎫 Daftar Gratis
            </a>
            <a
              href="https://github.com/gdsuta/mai-milu"
              className="btn-outline-white"
            >
              ⭐ GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">🚗 Mai-Milu</div>
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
                <a href="https://mai-milu.vercel.app/terms">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="https://mai-milu.vercel.app/privacy">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="https://github.com/gdsuta/mai-milu">GitHub</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Pengembang</h5>
            <ul>
              <li>
                <a href="https://github.com/gdsuta">Gede Suta Pinatih</a>
              </li>
              <li>
                <a href="https://github.com/gdsuta/mai-milu">Source Code</a>
              </li>
              <li>
                <a href="https://mai-milu.vercel.app">Live App</a>
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
            <a href="https://github.com/gdsuta/mai-milu">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
