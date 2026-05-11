# 🚗 Mai-Milu — Bali Carpool Community

<div align="center">

**Mai-Milu** *(Balinese: "Let's Join")* is a mobile-first carpooling web application that connects drivers and passengers on one-way routes across Bali, Indonesia.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mai--milu.vercel.app-indigo?style=for-the-badge&logo=vercel)](https://mai-milu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🌟 Overview

Mai-Milu digitises the informal ride-sharing culture of Bali into a structured, secure, and efficient ecosystem. It reduces daily commuting costs and traffic congestion by matching verified drivers who have empty seats with passengers heading in the same direction.

The app is built with a modern, serverless stack and is fully **Progressive Web App (PWA)** compliant — users can install it directly from their mobile browser with no app store required.

> **"Mai Milu"** literally means **"Let's Join Together"** in Balinese, reflecting the community spirit at the heart of the platform.

---

## ✨ Key Features

### 🔐 Security & Trust
- **KTP-based identity verification** — all users submit a national ID photo and selfie before being approved by an admin
- **Multi-layer role system** — `admin`, `verified user`, and `pending user` roles with enforced Row Level Security (RLS) at the database level
- **Atomic booking transactions** — PostgreSQL RPCs with row-locking prevent race conditions and double-booking
- **Secure password recovery** — `check_email_registered()` RPC prevents email enumeration attacks on the forgot-password flow

### 🚗 Ride Management
- **Post single rides** or **recurring weekly schedules** (Mon–Fri, up to 8 weeks ahead) with a live ride-count preview
- **OpenRouteService + Nominatim integration** — calculates driving distance and auto-suggests a fuel cost price
- **Automatic ride expiry** — past rides are hidden from the listing via a server-side time filter and a scheduled `expire_past_rides()` database function
- **Driver dashboard** — manage all rides across four status tabs: Active, Completed, Cancelled, Expired

### 🎫 Booking System
- Passengers can **reserve a seat** directly in the app (not just via WhatsApp)
- Booking status flow: `pending` → `accepted` / `rejected`, with seat count updating atomically
- Drivers see **pending booking notifications** on their ride cards and can approve or reject with one tap
- Passengers can cancel pending bookings; seats are restored automatically

### 🔍 Smart Ride Discovery
- **Search & filter** — live text search by origin/destination with yellow highlight, sort by departure time or price, free-rides-only toggle
- **Ride matching algorithm** — scores each ride 0–100 against the user's home address (token overlap), departure urgency, price, and recurring status; top 3 matches appear above the full listing

### ⭐ Community & Ratings
- Passengers can leave **1–5 star ratings** with optional comments after a ride
- Ratings aggregate into a `driver_ratings` view for efficient display on ride cards
- Public **driver profile pages** at `/driver/[id]` — stats (completion rate, avg rating), rating distribution bars, review list, upcoming rides, and ride history

### 📱 Mobile-First PWA
- Installable on Android and iOS via the browser ("Add to Home Screen")
- Standalone display mode — no browser chrome, feels native
- 8 icon sizes + Apple touch icon + wide/narrow screenshots
- Client-side **image compression** (Canvas API, zero dependencies) before upload: selfies at 800 px/0.82 JPEG quality, KTP photos at 1400 px/0.88 quality
- **Explicit camera buttons** per upload field: front camera (`capture="user"`) for selfie, rear camera (`capture="environment"`) for KTP

### 💬 Zero-Friction Communication
- All ride contact flows through **WhatsApp deep links** with pre-filled messages — no internal messaging system to maintain
- WhatsApp links are automatically formatted from the driver's registered phone number

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) | SSR, routing, server actions |
| **Language** | TypeScript (strict mode) | Type safety throughout |
| **UI** | React 19 + Tailwind CSS v4 | Components and styling |
| **Icons** | Phosphor Icons | Consistent icon system |
| **Forms** | React Hook Form + Zod | Validation and form state |
| **Backend** | Supabase (PostgreSQL) | Database, Auth, Storage, RLS |
| **Auth helper** | @supabase/ssr | Cookie-based session management |
| **Maps** | OpenRouteService + Nominatim (OSM) | Route distance calculation |
| **Email** | Resend (custom SMTP) | Transactional password reset emails |
| **Deployment** | Vercel | CI/CD via GitHub |
| **Unit tests** | Jest + React Testing Library | Algorithm and component tests |
| **E2E tests** | Cypress | Full user flow tests |

---

## 🏗 Architecture

```
mai-milu/
├── app/                        # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/              # Email/password login with show/hide toggle
│   │   ├── register/           # KTP + selfie upload with compression
│   │   ├── forgot-password/    # Reset with email existence guard
│   │   ├── update-password/    # Post-reset password form
│   │   └── auth/callback/      # Supabase OAuth code exchange
│   ├── home/                   # Ride listing (server component)
│   ├── offer-ride/             # Post single or recurring rides
│   ├── my-rides/               # Driver's ride history + booking management
│   ├── my-bookings/            # Passenger's booking history
│   ├── driver/[id]/            # Public driver profile
│   ├── admin/                  # KTP verification + user management
│   ├── verification/           # Pending verification screen
│   ├── error.tsx               # Global error boundary (Bahasa Indonesia)
│   └── loading.tsx             # Global loading spinner
│
├── components/
│   ├── Navbar.tsx              # Sticky nav with active-link highlighting
│   ├── RideList.tsx            # Search, filter, matching algorithm, rating modal
│   ├── MyRidesList.tsx         # Tabbed ride manager with booking panel
│   ├── BookingButton.tsx       # Seat reservation CTA with confirmation modals
│   ├── DriverProfile.tsx       # Public profile with stats, ratings, ride history
│   ├── StarDisplay.tsx         # Inline star rating renderer
│   ├── StarRatingModal.tsx     # 1-5 star rating with comment submission
│   └── ZoomableImage.tsx       # Admin KTP photo viewer
│
├── lib/supabase/
│   ├── server.ts               # createServer() — typed server-side client
│   └── client.ts               # createClient() — typed browser-side client
│
├── types/
│   └── supabase.ts             # Auto-generated DB types via Supabase CLI
│
├── __tests__/                  # Jest unit tests
├── cypress/                    # E2E test suites
└── public/                     # PWA icons, manifest, screenshots
```

---

## 🗄 Database Schema

```sql
-- Core tables
profiles        -- extends auth.users with KTP, avatar, role, verification_status
rides           -- driver posts with origin, destination, time, seats, price, status
                -- is_recurring + recurring_days[] for repeating schedules
bookings        -- passenger reservations (pending → accepted/rejected/cancelled)
ratings         -- 1-5 star reviews with optional comment (one per passenger per ride)

-- View
driver_ratings  -- pre-aggregated avg_score + total_ratings per driver

-- Planned (schema exists, UI not yet built)
communities     -- location-based groups
trips           -- community-linked rides with price_per_km
```

### Supabase RPC Functions

| Function | Description |
|---|---|
| `book_ride(ride_id, passenger_id)` | Atomically inserts booking + decrements seats (row-locked) |
| `cancel_booking(booking_id, passenger_id)` | Cancels booking + restores seat atomically |
| `respond_to_booking(booking_id, driver_id, action)` | Driver approves or rejects; reject restores seat |
| `expire_past_rides()` | Marks stale rides as `kadaluarsa` (called by pg_cron hourly) |
| `check_email_registered(email)` | Guards password reset against non-existent emails (SECURITY DEFINER) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (or any Node.js hosting)
- An [OpenRouteService](https://openrouteservice.org) API key (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/gdsuta/mai-milu.git
cd mai-milu
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Then fill in the values — see the section below
```

### 4. Set up the Supabase database

Run the SQL migration files in your **Supabase SQL Editor** in this order:

```
sql/01_schema.sql           -- tables and enums
sql/02_rls_policies.sql     -- row-level security
sql/03_storage_policies.sql -- storage bucket policies
sql/04_rpc_functions.sql    -- book_ride, cancel_booking, respond_to_booking, etc.
```

Create two storage buckets in your Supabase dashboard:
- `avatars` — set to **Public**
- `identity_docs` — set to **Private**

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenRouteService (for route distance calculation)
NEXT_PUBLIC_ORS_API_KEY=your-ors-api-key
```

> **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

## 🧪 Running Tests

### Unit tests (Jest)

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

The unit test suite covers:
- **Ride matching algorithm** — `tokenize()`, `routeScore()`, `timeScore()`, `formatBytes()` (25 assertions)
- **StarDisplay component** — empty state, score display, count, size variants (7 assertions)

### End-to-end tests (Cypress)

```bash
# Start the dev server first
npm run dev

# Then in a separate terminal:
npm run cy:open    # interactive UI mode (recommended for development)
npm run cy:run     # headless mode (for CI)
```

Create a `cypress.env.json` file with your test account credentials (already gitignored):

```json
{
  "TEST_USER_EMAIL": "your-test-user@gmail.com",
  "TEST_USER_PASSWORD": "your-password",
  "TEST_ADMIN_EMAIL": "your-admin@gmail.com",
  "TEST_ADMIN_PASSWORD": "your-admin-password"
}
```

E2E suites cover: authentication flows, home page search/filter/matching, offer-ride form (single + recurring), and the Tumpangan Saya driver dashboard.

---

## 📁 Project Structure Highlights

### Ride Matching Algorithm (`components/RideList.tsx`)

Every ride is scored 0–100 against the current user before rendering:

```
Route score  (0–100)  — word overlap between user's home_address and ride origin/destination
Time score   (5–40)   — departing in ≤2h = 40pts, today = 30pts, this week = 10pts
Price bonus  (0–10)   — free rides +10pts, ≤Rp10.000 +5pts
Recurring    (+8)     — reliable repeating drivers get a trust boost
```

Top 3 rides scoring above 5 appear in the **"Cocok untuk Anda"** section above the main listing.

### Atomic Booking (`book_ride` RPC)

```sql
BEGIN
  SELECT * FROM rides WHERE id = p_ride_id FOR UPDATE; -- row lock
  -- validate: ride is active, passenger ≠ driver, no duplicate, seats > 0
  INSERT INTO bookings ...
  UPDATE rides SET available_seats = available_seats - 1 ...
COMMIT
```

This guarantees seat counts never go negative even under concurrent requests.

### Image Compression (`app/register/page.tsx`)

```typescript
// Uses browser Canvas API — zero npm dependencies
// Selfie: max 800px wide, JPEG 0.82 quality → ~150–250 KB
// KTP:    max 1400px wide, JPEG 0.88 quality → ~300–500 KB
//         (wider + higher quality so admin can read the ID text)
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Here are the best areas to contribute:

| Area | Description |
|---|---|
| **In-app chat** | Replace WhatsApp deep links with Supabase Realtime WebSocket chat |
| **Payment gateway** | Integrate Midtrans or Xendit for in-app transactions |
| **Push notifications** | Web Push API for new ride alerts |
| **Automated ride matching** | ML-based route similarity beyond keyword overlap |
| **E2E test coverage** | Expand Cypress suite to cover booking and rating flows |

### How to contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes and write tests where applicable
4. Commit using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add push notifications"`
5. Push and open a Pull Request

Please read through the existing issues before opening a new one.

---

## 👤 Author

**Gede Suta Pinatih**

Built as a real-world solution to the daily commuting challenges faced by people across Bali, combining modern web technology with local cultural context.

- GitHub: [@gdsuta](https://github.com/gdsuta)
- App: [mai-milu.vercel.app](https://mai-milu.vercel.app)

---

<div align="center">

Made with ❤️ in Bali, Indonesia

*Mai Milu — Bali Carpool Community*

</div>
