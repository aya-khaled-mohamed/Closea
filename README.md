# Closéa — Premium Peer-to-Peer Fashion Rental Marketplace & Independent Admin Portal

**Closéa** is an editorial, production-grade peer-to-peer fashion rental marketplace connecting women who own designer dresses with women seeking unforgettable looks for milestone occasions. All garments are maintained, fitted, and eco-cleaned in partnership with certified Qenaian tailoring ateliers.

The platform consists of two interconnected systems powered by a shared relational database and unified business logic:
1. **System A — Closéa Public Marketplace & User Dashboards** (`http://localhost:3000`)
   - Editorial homepage, dynamic discovery marketplace with real-time filters, dress detail pages with non-overlapping availability verification, customer dashboard, dress owner studio, and partner atelier operations portal.
2. **System B — Closéa Admin Portal** (`http://localhost:3000/admin`)
   - Private, independently accessible administration dashboard with server-side RBAC guards, KPI analytics, dress curation (approval/rejection with feedback), user governance, booking intervention, atelier task monitoring, configurable dynamic commission engine, and audit logs.

---

## 1. Official Brand Identity & Color System

- **Brand Name**: **Closéa** (strictly typography-based logo in editorial serif, with accentuated *é*).
- **Official HEX Palette**:
  - `Primary Nude Pink`: `#D9B8B4`
  - `Dusty Rose`: `#C99F9D` (Primary buttons & interactive CTAs)
  - `Soft Blush`: `#F2E4E1` (Secondary backgrounds & section dividers)
  - `Pure White`: `#FFFFFF` (Main background & cards)
  - `Soft Sage Green`: `#A8B5A0` (Availability & confirmed badges)
  - `Deep Olive`: `#66745D` (Atelier status & contrast accents)
  - `Dark Warm Grey`: `#514B49` (Headings & body typography)
- **Palette Rules**: Zero purple, lavender, violet, or barbie pink. 65% White/neutral, 25% Nude Pink/Dusty Rose, 10% Soft Sage accents.

---

## 2. Seeded Account Credentials

The platform is seeded with realistic accounts for every role:

| Role | Account Name | Email | Password | Access Area |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Platform Administrator** | Geneviève Moreau | `admin@closea.com` | `CloseaAdmin2026!` | `/admin` (Admin Portal) |
| **👗 Dress Owner & Curator** | Sophie Laurent | `sophie.laurent@closea.com` | `Closea2026!` | `/dashboard/owner` |
| **👗 Dress Owner** | Elena Vance | `elena.vance@closea.com` | `Closea2026!` | `/dashboard/owner` |
| **👜 Customer / Renter** | Camille Dupont | `camille.dupont@closea.com` | `Closea2026!` | `/dashboard/customer` |
| **👜 Customer / Renter** | Isabella Rossi | `isabella.rossi@closea.com` | `Closea2026!` | `/dashboard/customer` |
| **🪡 Partner Atelier** | Atelier Saint-Honoré | `contact@atelier-sainthonore.com` | `Closea2026!` | `/atelier` (Atelier Lounge) |
| **🪡 Partner Atelier** | Maison Retouche Marais | `contact@retouche-marais.com` | `Closea2026!` | `/atelier` (Atelier Lounge) |

---

## 3. Technology Stack & Architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom Closéa design tokens
- **Database**: SQLite via Prisma ORM (`prisma/schema.prisma` with 21 relational models)
- **Security & RBAC**:
  - HTTP-only JWT cookies (`closea_session` & `closea_admin_session`)
  - Server-side role validation (`CUSTOMER`, `OWNER`, `ATELIER`, `ADMIN`)
  - Bcrypt password hashing
  - Next.js middleware route protection on `/admin/*`
- **Business Logic Engines**:
  - Anti-Double-Booking non-overlapping date range validator
  - Dynamic commission engine (Configurable in Admin without code alterations: default 15% Platform, 10% Atelier, 75% Owner)
  - Partner atelier logistics pipeline (`AWAITING_DELIVERY` → `RECEIVED` → `CLEANING` → `ALTERATION` → `READY` → `COLLECTED` → `RETURNED`)
  - Privacy masking of customer financial records from Atelier accounts

---

## 4. Setup & Running Instructions

### 4.1 Prerequisites
- Node.js (v18+ or v20+)
- npm

### 4.2 Installation
```bash
# Clone or navigate to the repository
cd Closea

# Install all dependencies
npm install
```

### 4.3 Database Synchronization & Seeding
```bash
# Push schema to SQLite database (creates dev.db)
npm run db:push

# Seed with curated dresses, categories, ateliers, bookings, and users
npm run db:seed
```

### 4.4 Running in Development
```bash
npm run dev
# Public Marketplace: http://localhost:3000
# Admin Portal:      http://localhost:3000/admin
```

### 4.5 Production Build & Execution
```bash
# Compile and optimize all routes
npm run build

# Start production server
npm start
```

### 4.6 Automated Integration Test Suite
```bash
node scripts/test-e2e.mjs
```

---

## 5. System Directory Structure

```
Closea/
├── prisma/
│   ├── dev.db                      # Relational SQLite database
│   └── schema.prisma               # 21 relational data models
├── scripts/
│   ├── seed.mjs                    # High-fidelity database seed script
│   └── test-e2e.mjs                # 30-step end-to-end integration test runner
├── src/
│   ├── app/
│   │   ├── (public)/               # System A: Customer & Owner Applications
│   │   │   ├── layout.tsx          # Editorial layout (Marquee, Navbar, Footer)
│   │   │   ├── page.tsx            # Editorial Homepage
│   │   │   ├── marketplace/        # Search, multi-criteria filters & discovery
│   │   │   ├── dresses/[slug]/     # Dress details, gallery, booking calendar
│   │   │   ├── login/              # Customer & Owner sign-in
│   │   │   ├── register/           # Customer & Owner registration
│   │   │   ├── dashboard/
│   │   │   │   ├── customer/       # Active rentals, history, wishlist
│   │   │   │   └── owner/          # Studio, list dress modal, accept/reject requests, earnings
│   │   │   └── atelier/            # Partner Atelier garment care portal
│   │   ├── admin/                  # System B: Independent Admin Portal
│   │   │   ├── layout.tsx          # Dedicated admin layout
│   │   │   ├── page.tsx            # KPI telemetry overview dashboard
│   │   │   ├── login/              # Separate, secured admin login
│   │   │   ├── dresses/            # Curation, approve/reject with feedback, feature
│   │   │   ├── users/              # Directory, suspend/reactivate accounts
│   │   │   ├── bookings/           # Reservation escrow & status overrides
│   │   │   ├── ateliers/           # Add atelier, assign tasks
│   │   │   ├── finances/           # Dynamic commission policy editor & transactions
│   │   │   ├── content/            # Banner announcements & platform settings
│   │   │   └── logs/               # Audit ledger of all administrative events
│   │   ├── api/                    # Shared RESTful Backend Services
│   │   │   ├── auth/               # login, register, logout, me
│   │   │   ├── dresses/            # CRUD, search, filter
│   │   │   ├── bookings/           # Reservation engine, non-overlap validator
│   │   │   ├── wishlist/           # Toggle, list
│   │   │   ├── atelier/            # Garment assignment stage tracking
│   │   │   └── admin/              # stats, users, dresses, commission, settings, logs
│   │   ├── globals.css             # Closéa design system & typography
│   │   └── layout.tsx              # Root HTML shell
│   ├── components/
│   │   ├── brand/Logo.tsx          # Typography-based editorial logo "Closéa"
│   │   ├── layout/                 # Navbar, Footer, AdminSidebar, AdminHeader
│   │   ├── marketplace/            # DressCard, FilterSidebar
│   │   └── ui/                     # Button, Badge, Input, Modal
│   ├── lib/
│   │   ├── auth.ts                 # JWT signing, cookie verification, RBAC guard
│   │   ├── prisma.ts               # Global Prisma client singleton
│   │   └── utils.ts                # Financial calculation, dates, formatting
│   └── middleware.ts               # Server-side guard protecting /admin/*
├── tailwind.config.ts              # Closéa official HEX color system
├── tsconfig.json
└── package.json
```
