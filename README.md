# ProfitLens — Client Profitability Analytics Platform (MVP)

> **Know which clients make you money — and which quietly drain your profits.**

ProfitLens is a production-quality B2B SaaS web application designed for finance managers, controllers, and business leaders to solve a critical business problem: **"We have revenue data and cost data scattered across spreadsheets, but no unified, automatic view of gross profit per client."**

---

## 🌟 Key Highlights & Design Aesthetic

- **Linear / Ramp / Mercury Inspired UI**: Sleek obsidian/zinc dark theme, glassmorphic cards, crisp glowing borders, refined typography with tabular numerals, and semantic color-coding (Emerald = Profitable, Amber = Low-Margin, Rose = Loss-Making).
- **1-Click Live CFO Demo Account**: Instantly explore a live populated dashboard with 18 realistic B2B accounts across 12 months (no manual setup required).
- **Pure Calculation Engine**: Materializes monthly summaries per client (`totalRevenue`, `totalCost`, `grossProfit`, `marginPercent`, and dynamic `classification`). Idempotent and recalculates upon threshold updates or upload rollbacks.
- **Rule-Based Diagnostic Insights**: Automated alerts for loss-making client drains, profit concentration risks in the top 5 accounts, margin degradation alerts, and pricing renegotiation opportunities.
- **Universal CSV Ingestion**: Drag-and-drop file uploader with automatic header detection, interactive column mapping, row-by-row validation with error reporting, and rollback deletion.
- **Multi-Tenant Architecture**: Multi-tenant workspace isolation with role-based access control (Owner, Admin, Member).

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Installation
```bash
# Clone repository and enter directory
cd Client360

# Install dependencies
npm install

# Push database schema and generate Prisma client
npx prisma db push

# Seed demo dataset (optional, can also be seeded via UI with 1-click)
npm run seed
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Click **"Launch Live CFO Demo (1-Click)"** on the landing page or login page to explore the platform immediately as CFO Alex Vance.
- Default demo credentials if logging in manually:
  - **Email**: `demo@profitlens.io`
  - **Password**: `password123`

---

## 🧪 Testing

The pure calculation engine and CSV parser logic are covered by automated unit tests:

```bash
# Run unit test suite
npm test

# Run live API smoke tests
npx tsx tests/verify-api.ts
```

---

## 📐 Product Architecture & Core Features

### 1. Executive Dashboard (`/dashboard`)
- **6 Top KPI Cards**:
  - Total Revenue (with period-over-period delta)
  - Total Costs (with period-over-period delta)
  - Gross Profit (net margin return)
  - Overall Margin % (color-coded against target thresholds)
  - Active Clients count
  - Loss-Making Clients count (highlighted in rose with total profit drain dollar amount)
- **Time Range Selector**:
  - Last 12 Months (default)
  - Last Quarter (90 Days)
  - Last 30 Days
  - This Year (YTD)
  - All Time
  - Custom Date Range Picker
- **Interactive Charts**:
  - Monthly Revenue vs. Cost vs. Gross Profit grouped bar chart
  - Client Profitability Mix donut chart with centered count
- **Top 5 & Bottom 5 Ranked Accounts**:
  - Top 5 profit generators with proportional visual bars
  - Bottom 5 least profitable / loss-making accounts highlighted in rose
- **Diagnostic Insights Engine**:
  - Rule-based alerts for accounts flipping to loss-making, high revenue accounts with thin margins, and top 5 concentration risk.
- **Recent Uploads Widget**:
  - Past 3 file uploads with status, processed row counts, and error links.

### 2. Clients Portfolio Table (`/clients`)
- Search by account or client name with real-time debouncing
- Status filter tabs: *All Accounts*, *Profitable (≥20%)*, *Low-Margin (5–20%)*, *Loss-Making (<5%)*
- Multi-column sortable table: Client Account, Revenue, Total Cost, Gross Profit, Margin %, Classification, 6-Month Sparkline trend, Last Activity Date
- Full pagination (25 clients per page)
- Click any client row to drill into their dedicated analytics page

### 3. Client Drill-Down Detail (`/clients/[id]`)
- Account header with classification badge and external reference ID
- 4 period metric cards (Total Revenue, Total Costs, Gross Profit, Margin %)
- Monthly Revenue vs. Cost historical bar chart
- Expense Category breakdown donut chart & percentage list
- Line Item Transaction ledger with search, category filtering, and source file tracking

### 4. Universal CSV Uploads Wizard (`/uploads`)
- Drag-and-drop file dropzone (up to 10MB)
- Supported formats:
  - Combined format (Revenue & Cost with 'Type' column)
  - Sales / Revenue only
  - Cost / Expense only
- Downloadable sample CSV templates directly from the UI
- Interactive Column Mapping UI with auto-detected headers
- Row-by-row validation with preview of first 5 rows and error tracking
- Upload history table with status, row stats, and one-click rollback deletion (deletes transactions and recalculates summaries)

### 5. Settings & Workspace Configuration (`/settings`)
- **Company Profile**: Update organization name and industry
- **Margin Thresholds**: Configure `ProfitableMarginThreshold` (default 20.0%) and `LowMarginThreshold` (default 5.0%) with real-time recalculation of all portfolio clients
- **Team Members**: Invite colleagues via email as Admin or Member with role badges
- **Demo Data Management**: 1-click reload of the 18-account sample dataset or reset/clear all data for fresh testing.

---

## 🗄️ Relational Data Model (Prisma / SQLite)

```prisma
Organization
  - id (UUID)
  - name
  - industry
  - profitableMarginThreshold (Float, default 20.0)
  - lowMarginThreshold (Float, default 5.0)

User
  - id (UUID)
  - email (Unique)
  - passwordHash
  - fullName

OrganizationMember
  - organizationId (FK)
  - userId (FK)
  - role ("owner" | "admin" | "member")
  - status ("active" | "invited")

Client
  - organizationId (FK)
  - name
  - externalReference
  - isActive (Boolean)

Upload
  - organizationId (FK)
  - uploadedByUserId (FK)
  - fileName
  - uploadType ("combined" | "sales" | "cost")
  - columnMapping (JSON)
  - status ("completed" | "processing" | "failed")
  - totalRows, validRows, failedRows, errorLog

Transaction
  - organizationId (FK)
  - clientId (FK)
  - uploadId (FK, nullable)
  - transactionDate (DateTime)
  - type ("revenue" | "cost")
  - category
  - amount (Float, positive)
  - description

ClientPeriodSummary
  - organizationId (FK)
  - clientId (FK)
  - periodType ("month")
  - periodStartDate (DateTime, 1st of month UTC)
  - totalRevenue, totalCost, grossProfit, marginPercent
  - classification ("profitable" | "low_margin" | "loss_making" | "no_revenue")
```

---

## 🛡️ Roles & Permissions (MVP)

- **Owner**: Full access, manage organization, update thresholds, invite team members, delete uploads, reset data.
- **Admin**: Can upload CSV files, adjust margin thresholds, invite members, view all analytics.
- **Member**: Read-only access to Dashboard, Clients portfolio, and Client drill-down views. Upload and settings modification actions are guarded in both UI and API.

---

## 📄 License
MIT © 2026 ProfitLens Technologies.
