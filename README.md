# Client360 (ProfitLens) — B2B Client Profitability Analytics Platform

> **Know which clients make you money — and which quietly drain your profits.**

Client360 is a production-hardened B2B SaaS analytics web application designed for CFOs, finance directors, and controllers. It unifies revenue and cost datasets across spreadsheets into instant, per-client gross profit calculations, margin classifications, diagnostic insights, and portfolio health monitoring.

Live Deployment: **[https://client360-ten.vercel.app/](https://client360-ten.vercel.app/)**

---

## 🌟 Key Highlights

- **Hungry Tiger Poster Design Aesthetic**: Fire-roasted rust canvas (`#823513`), searing Tiger Gold accents (`#faae33`), Dark Spice card surfaces (`#402011`), and high-impact poster typography using Bebas Neue and Inter.
- **Serverless Cloud Database (Turso / libSQL)**: Sub-millisecond global queries powered by `@libsql/client` and `@prisma/adapter-libsql`, with automated DDL migration syncing.
- **1-Click Live CFO Demo Account**: Instantly explore a pre-populated workspace with 18 realistic B2B accounts across 12 months in a sandboxed, isolated session.
- **Pure Calculation Engine**: Centralized authoritative business logic handling zero-revenue, net refund negative cashflows, cost-only accounts, and boundary condition classifications.
- **Hardened CSV Ingestion**: UTF-8 BOM stripping, formula injection sanitization (`=, +, -, @`), integer cents precision math, 50,000 row limits, and chunked batch persistence.
- **Enterprise Security**: Next.js Edge Middleware route guarding, Zod runtime schema validation, IP and user rate limiting, strict HTTP security headers (HSTS, CSP, X-Frame-Options DENY), and multi-tenant database isolation.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20.x` or higher
- npm or pnpm
- A Turso database token and URL (or local SQLite file fallback)

### 2. Environment Variables Setup
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
TURSO_AUTH_TOKEN="your-turso-jwt-token"
JWT_SECRET="your-secure-production-jwt-secret-at-least-16-chars"
PORT=3000
NODE_ENV="development"
```

### 3. Installation & Database Sync
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Sync schema migrations to Turso cloud database
npm run db:push

# Seed demo dataset (18 accounts across 12 months)
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Click **"Live CFO Demo"** on the landing page or login view to explore as CFO Alex Vance.
- Default demo credentials:
  - **Email**: `demo@profitlens.io`
  - **Password**: `password123`

---

## 🧪 Testing Suite

Automated test runner testing calculation boundary conditions, CSV ingestion, formula sanitization, and multi-tenant isolation:

```bash
# Run complete test suite
npm test
```

Test coverage includes:
- **Calculation Engine**: Exact 20.0% / 5.0% threshold boundaries, zero revenue, refunds, and cost-only accounts.
- **CSV Parser**: BOM removal, Excel formula injection neutralizing, date normalization, and integer cents precision.
- **Multi-Tenant Isolation**: Verified database queries preventing cross-organization record visibility or modification.

---

## 🏗️ Architecture & Core Subsystems

```
Client360 Architecture
├── app/
│   ├── api/               # Protected Next.js API Routes (Zod validated, Rate limited)
│   ├── dashboard/         # Executive Dashboard (KPIs, Trends, Top/Bottom accounts)
│   ├── clients/           # Client Portfolio Table & Single Client Drill-down
│   ├── uploads/           # 3-step CSV Upload Wizard & Ingestion History
│   ├── settings/          # Workspace Profile, Thresholds, & Member Management
│   ├── privacy/ & terms/  # Public Legal Compliance Pages
│   ├── error.tsx          # Production 500 Error Boundary
│   ├── not-found.tsx      # Production 404 Handler
│   └── sitemap.ts         # Dynamic SEO Sitemap Generator
├── components/            # Reusable UI, Chart & Dashboard Widgets
├── lib/
│   ├── calculations/      # Pure calculation engine & period rollups
│   ├── csv/               # PapaParse wrapper with sanitization & validation
│   ├── insights/          # Rule-based diagnostic alert engine
│   ├── auth.ts            # JWT signing, password hashing & cookie helpers
│   ├── rate-limit.ts      # In-memory sliding-window rate limiter
│   ├── env.ts             # Zod validated environment schema
│   ├── db.ts              # Prisma LibSQL Turso database adapter
│   └── logger.ts          # Structured JSON logger with automated credential redaction
└── middleware.ts          # Edge middleware enforcing server-side session guards
```

---

## 🛡️ Production Readiness Checklist

| Category | Item | Status |
| :--- | :--- | :---: |
| **Security** | Passwords hashed with bcrypt (10 rounds) | ✅ PASS |
| **Security** | Edge Middleware server-side route protection | ✅ PASS |
| **Security** | Multi-tenant isolation verified by automated test | ✅ PASS |
| **Security** | Rate limiting on login, signup, and upload routes | ✅ PASS |
| **Security** | HTTP Security Headers (HSTS, CSP, X-Frame-Options) | ✅ PASS |
| **Security** | Validated Zod schemas on environment and APIs | ✅ PASS |
| **Data Ingestion**| Formula / DDE injection sanitization (`=, +, -, @`) | ✅ PASS |
| **Data Ingestion**| UTF-8 BOM removal and greedy whitespace skipping | ✅ PASS |
| **Data Ingestion**| Chunked atomic batch inserts (200 rows/batch) | ✅ PASS |
| **Data Ingestion**| Transactional rollback on batch deletion | ✅ PASS |
| **Business Logic**| Authoritative calculation module (`calculateClientMetrics`) | ✅ PASS |
| **Business Logic**| Edge cases handled: zero revenue, refunds, cost-only | ✅ PASS |
| **Reliability** | Production 500 error boundary (`app/error.tsx`) | ✅ PASS |
| **Reliability** | Production 404 page (`app/not-found.tsx`) | ✅ PASS |
| **Reliability** | Automated health check endpoint (`/api/health`) | ✅ PASS |
| **SEO & Legal** | `robots.txt` blocking private application routes | ✅ PASS |
| **SEO & Legal** | Dynamic `sitemap.xml` with priority metadata | ✅ PASS |
| **SEO & Legal** | Privacy Policy & Terms of Service pages | ✅ PASS |
| **DevOps** | GitHub Actions CI workflow for test and build | ✅ PASS |

---

## 📄 License
MIT © 2026 ProfitLens Technologies.
