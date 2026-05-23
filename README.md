# DriveGuard — Telematics Insurance Platform

A monorepo containing three packages that run concurrently:

| Package       | Tech                     | Port  |
|---------------|--------------------------|-------|
| `api/`        | Express + Supabase       | 4000  |
| `dashboard/`  | React + Vite + Tailwind  | 5173  |
| `mobile/`     | React Native + Expo      | 8081  |

---

## Prerequisites

- **Node.js 20+**
- **npm 10+**
- **Expo CLI**: `npm install -g expo-cli`
- **Supabase account**: [supabase.com](https://supabase.com)

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd driveguard
npm run install:all
```

### 2. Configure environment

Copy `.env.example` to `.env` in each package and fill in your values:

```bash
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env
cp mobile/.env.example mobile/.env
```

Required values:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (api only, never expose to clients)
- `VITE_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)

### 3. Run the Supabase SQL schema

Open your Supabase project → **SQL Editor** → paste and run the contents of `supabase/schema.sql`.

### 4. Start everything

```bash
npm run dev
```

This runs `api`, `dashboard`, and `mobile` concurrently.

---

## Package Overview

### `api/` — Express REST API

- Auth via Supabase Auth + JWT
- All DB operations via service-role Supabase client
- Routes: `/auth`, `/drivers`, `/sessions`, `/claims`, `/alerts`, `/analytics`
- Score computation via `POST /scores/compute/:driverId`

### `dashboard/` — Insurer Web Portal

- Login protected (insurer role only)
- Portfolio overview with fleet KPIs
- Driver detail with 5-tab panel
- Claims management with review modal
- Alerts feed with resolve action

### `mobile/` — Driver Mobile App

- Login for drivers only
- Home screen with score ring
- Live session recording with sensor fusion
- Post-trip summary with coaching tip
- History, Rewards, Profile tabs

---

## Architecture Notes

- **Roles**: JWT payload contains `{ role: 'insurer' | 'driver', sub: userId, driverId? }`
- **Score formula**: Phone (25%) + Braking (20%) + Speeding (20%) + Cornering (15%) + Night (10%) + Hours (10%)
- **Risk tiers**: score ≥ 80 → low / 50–79 → medium / < 50 → high
- **Discounts**: ≥80 → 15% / 70–79 → 8% / 50–69 → 3% / <50 → none
- **Design system**: AmenBox — primary `#2B3497`, secondary `#4BBFA0`, fonts Montserrat + DM Sans
