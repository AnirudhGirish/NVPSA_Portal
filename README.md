<div align="center">

# NVPSA Portal

**Nutan Vidyalaya Past Students Association — Alumni Management Platform**

A production-grade platform for collecting, managing, and exporting life-member data for the NV Society alumni network.

*Next.js 15 · React 19 · TypeScript · MongoDB · Mongoose · Tailwind CSS · shadcn/ui · TanStack Table*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Admin Dashboard](#admin-dashboard)
- [Data Export](#data-export)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Migration Guide](#migration-guide)
- [License](#license)

---

## Overview

The NVPSA Portal is the official data-management system for the **Nutan Vidyalaya Past Students Association**. It provides:

1. A **public registration form** through which life members update their personal, academic, and contact information.
2. A **secure admin dashboard** for association officials to search, filter, inspect, edit, and delete records.
3. A **robust export pipeline** producing sanitized CSV and professionally formatted Excel workbooks.

The system is engineered for production reliability: strict TypeScript, server-side validation on every write path, JWT-authenticated APIs, atomic database counters, and URL-synchronized UI state so every filtered view is shareable and bookmarkable.

---

## Features

### Public Experience

- **Sectioned registration form** — Personal Information, Academic Background, and Contact Details with staggered entrance animations.
- **Real-time validation** — Zod + React Hook Form with inline error messaging and valid-state indicators on every field.
- **Live duplicate detection** — phone numbers are checked against the database on blur, with clear guidance when a number is already registered.
- **Animated confirmation page** — celebratory checkmark, submitted-details summary card, copyable reference ID, and one-click return home.

### Admin Dashboard

- **URL-synchronized data grid** — `search`, `page`, `pageSize`, `sortBy`, `sortOrder`, and faceted filters (`pass`, `year`) all live in the query string. Every view is refresh-safe, shareable, and bookmarkable.
- **Global search** — debounced (300 ms) multi-field search with a `⌘K` / `Ctrl+K` keyboard shortcut, loading indicator, and serial-number lookup (`#42` finds member 42 instantly).
- **Faceted filters** — popover menus for graduation year (1940–2025) and pass/branch type, with removable filter badges and a one-click reset.
- **Column management** — toggle visibility per column; sensitive columns (Aadhar, address) are hidden by default for compact viewing.
- **Bulk operations** — row selection, select-all-on-page, and *select-all-matching-results* (across pages) with a floating action bar for bulk export and bulk delete.
- **KPI cards** — total registered alumni, unique batches represented, signups in the last 7 days, and branch breakdown.
- **Member detail sheet** — click any row to open a slide-over with full profile, registration timestamps, and edit/delete actions.
- **Inline editing** — fully validated edit dialog with optimistic table updates.
- **Two-step deletion** — explicit confirmation required for single and bulk deletion; nothing is ever deleted accidentally.

### Exports

- **Three export scopes** — all records, the current filtered view, or hand-picked selections.
- **CSV formula-injection protection** — every cell beginning with `=`, `+`, `-`, `@`, tab, or CR is prefixed with an apostrophe.
- **Styled Excel workbooks** — frozen bold header row, auto-filter, zebra striping, fixed-width 10-digit phone formatting, and Member ID as the first column.

### Resilience

- Animated skeleton loaders with zero layout shift during query transitions.
- Custom `error.tsx` and `not-found.tsx` boundaries with retry and recovery paths.
- Offline detection with toast notifications and graceful degradation.
- Per-IP rate limiting with `Retry-After` headers and human-readable feedback.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Base UI primitives) |
| Data grid | TanStack Table v8 |
| Forms & validation | React Hook Form 7 + Zod 3 |
| Animation | framer-motion |
| Notifications | sonner |
| Database | MongoDB Atlas (Mongoose 8 ODM) |
| Authentication | JWT (httpOnly cookies) + bcryptjs |
| Exports | ExcelJS (CSV + XLSX) |
| Icons | lucide-react |
| Tooling | ESLint 9 (next/core-web-vitals + next/typescript) |

---

## Architecture

### Data Flow

```
┌──────────────┐   POST /api/form    ┌──────────────────┐
│ Public Form  │ ──────────────────▶ │  Route Handler    │
│  (client)    │                     │  Zod → Counter →  │
└──────────────┘                     │  Mongoose save    │
                                     └────────┬─────────┘
                                              │
                                     ┌────────▼─────────┐
                                     │  MongoDB (nvpsa) │
                                     │  forms · admins  │
                                     │  counters        │
                                     └────────┬─────────┘
                                              │
┌──────────────┐   GET /api/fetch    ┌────────▼─────────┐
│    Admin     │ ◀────────────────── │  Auth (JWT) →    │
│  Dashboard   │   GET /api/export   │  filter → sort → │
│  (client)    │                     │  paginate        │
└──────────────┘                     └──────────────────┘
```

- **Server components** render pages; **client components** handle interactivity. The dashboard auth gate runs server-side (`cookies()` + JWT verification) before any UI ships to the browser.
- **Every API route** re-verifies the JWT independently — client-side checks are UX only, never the security boundary.
- **Serial numbers** come from a dedicated `counters` collection using atomic `findOneAndUpdate` with `$inc` + upsert, making concurrent registrations collision-proof.

### Key Design Decisions

- **Connection-cached Mongoose** — a `globalThis`-scoped connection promise shared across serverless invocations prevents connection exhaustion.
- **Server-side Zod on every write** — client validation improves UX; server validation is the only trusted layer.
- **URL as state** — the grid's entire state is derivable from the URL, making views shareable and the back button work naturally.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + metadata + toaster
│   ├── page.tsx                  # Public landing page
│   ├── form/page.tsx             # Member registration form
│   ├── success/page.tsx          # Animated confirmation page
│   ├── signin/page.tsx           # Admin sign-in
│   ├── signup/page.tsx           # Admin sign-up (gated)
│   ├── dashboard/
│   │   ├── page.tsx              # Server-side auth gate
│   │   └── admin-dashboard.tsx   # Data grid + management UI
│   ├── error.tsx                 # Route error boundary (retry)
│   ├── not-found.tsx             # 404 boundary
│   └── api/                      # Route handlers (see API Reference)
│       ├── export/route.ts
│       ├── fetch/route.ts
│       ├── fetch/ids/route.ts
│       ├── form/route.ts
│       ├── form/check/route.ts
│       ├── members/[id]/route.ts
│       ├── members/bulk-delete/route.ts
│       ├── sign-in/route.ts
│       ├── sign-out/route.ts
│       ├── sign-up/route.ts
│       └── stats/route.ts
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── dashboard/                # Grid-specific components
│   │   ├── stat-cards.tsx        # KPI metric cards
│   │   └── member-actions.tsx    # Detail sheet, edit & delete dialogs
│   ├── link-form.tsx             # Copyable form link widget
│   ├── page-transition.tsx       # Route transition wrapper
│   └── ui/toaster.tsx            # sonner integration
├── hooks/
│   ├── use-grid-url-state.ts     # URL ⇄ state synchronization
│   └── use-online.ts             # Network status detection
├── lib/
│   ├── fetch.ts                  # Typed API client
│   ├── http.ts                   # Shared HTTP helpers (Retry-After)
│   └── query.ts                  # Filter builder, regex escaping,
│                                 # CSV injection sanitization
├── models/
│   ├── admin.model.ts            # Admin user schema
│   ├── counter.model.ts          # Atomic sequence counters
│   └── form.model.ts             # Member schema (serialNumber, unique indexes)
├── schemas/
│   ├── admin.schema.ts           # Sign-up validation schema
│   ├── adminSignIn.schema.ts     # Sign-in validation schema
│   └── form.schema.ts            # Member form validation schema
├── types/
│   └── index.ts                  # Shared domain types
└── utils/
    ├── auth.ts                   # JWT sign/verify, cookie helpers
    ├── counter.ts                # Atomic serial-number generator
    ├── dbconnect.ts              # Connection-cached Mongo client
    └── rateLimit.ts              # In-memory per-IP rate limiter

scripts/
└── migrate.mjs                   # Idempotent DB migration script
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** (v22+ recommended)
- **npm 10+**
- A **MongoDB Atlas** cluster (free tier is sufficient)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd NVPSA_Portal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# edit .env.local with your MongoDB URI and a strong JWT secret

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** If your shell environment sets `NODE_ENV=production` globally, run `NODE_ENV=development npm run dev` for local development, as the environment variable changes Next.js behavior.

### Creating Your First Admin

1. In `.env.local`, temporarily set `ALLOW_SIGNUP=true`.
2. Visit `/signup` and create your administrator account.
3. **Immediately set `ALLOW_SIGNUP=false`** (or remove the variable) and restart the server.

Public sign-up is disabled by default for security; this flow exists only for bootstrapping.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string pointing at the `nvpsa` database. Example: `mongodb+srv://user:pass@cluster.mongodb.net/nvpsa` |
| `TOKEN_SECRET` | ✅ | Secret used to sign JWTs. Use a long random string (`openssl rand -hex 32`). Never commit. |
| `ALLOW_SIGNUP` | ❌ | Set to `true` only during admin bootstrapping. Any other value (or absence) disables public admin registration. |

All variables are read server-side only. No secrets are exposed to the client.

---

## API Reference

All endpoints return JSON unless noted. Admin endpoints require a valid JWT in an `httpOnly` cookie named `token` (set by `POST /api/sign-in`).

### Public

#### `POST /api/form`
Submits a new member registration.

**Body** (validated with Zod):

```json
{
  "name": "Ramesh Kulkarni",
  "number": 9845123456,
  "email": "ramesh@example.com",
  "address": "123 College Road, Kalaburgi",
  "aadhar": "123456789012",
  "pass": "Degree",
  "year": "2004"
}
```

| Field | Type | Constraints |
|---|---|---|
| `name` | string | Required; letters and spaces only |
| `number` | number | Required; exactly 10 digits; unique |
| `email` | string | Optional; valid email |
| `address` | string | Required |
| `aadhar` | string | Optional; exactly 12 digits |
| `pass` | string | Optional; one of `SSLC`, `PUC`, `Degree`, `Others` |
| `year` | string | Optional; 1940–2025 |

**Responses:**

- `200` — success, includes the created member with `serialNumber`
- `400` — validation failure (field-level `errors` array) or duplicate phone number
- `429` — rate limited (10/min/IP) with `Retry-After` header
- `500` — internal error

#### `GET /api/form/check?number=`
Pre-flight duplicate phone check for the public form.

- `200` — `{ "success": true, "exists": false }`
- `400` — malformed phone number

### Authentication

#### `POST /api/sign-up`
Registers an admin. **Disabled unless `ALLOW_SIGNUP=true`.**

- `403` — registration disabled
- `409` — username or email already exists
- `429` — rate limited (5/min/IP)

#### `POST /api/sign-in`
Authenticates an admin and sets the JWT cookie (`httpOnly`, `sameSite=lax`, `secure` in production, 1-day expiry).

#### `POST /api/sign-out`
Clears the authentication cookie.

### Authenticated (JWT required)

All return `401` when unauthenticated or the token is invalid/expired.

#### `GET /api/fetch`
Paginated member listing.

| Query param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `pageSize` | int | 50 | One of `10`, `25`, `50`, `100` |
| `search` | string | — | Case-insensitive multi-field search; pure integers also match `serialNumber` exactly |
| `sortBy` | string | `createdAt` | One of `serialNumber`, `name`, `number`, `email`, `address`, `pass`, `year`, `createdAt` |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `pass` | string[] | — | Repeatable; filter by branch (`SSLC`, `PUC`, …) |
| `year` | string[] | — | Repeatable; filter by graduation year |
| `yearRange` | string | — | Inclusive range, e.g. `1990-2000` |

**Response:**

```json
{
  "success": true,
  "responses": [ { "...": "member documents" } ],
  "pagination": { "page": 1, "pageSize": 50, "total": 562, "totalPages": 12 }
}
```

#### `GET /api/fetch/ids`
Returns all document IDs matching the current filter (`search`, `pass`, `year`, `yearRange`), capped at 5,000. Powers "select all matching results."

#### `GET /api/stats`
Dashboard KPIs: total alumni, unique batches, 7-day signups, branch breakdown.

#### `GET /api/export`
Streams an export file. See [Data Export](#data-export).

| Query param | Values | Description |
|---|---|---|
| `format` | `csv`, `xlsx` | Output format |
| `scope` | `all`, `filtered`, `selected` | What to export |
| `id` | repeatable ObjectId | Required for `scope=selected` |
| `search`, `pass`, `year`, `yearRange` | as `/api/fetch` | Reused when `scope=filtered` |

#### `GET /api/members/[id]`
Fetches a single member document.

#### `PATCH /api/members/[id]`
Updates a member. Same Zod-validated body as `POST /api/form`.

- `409` — another member already has the new phone number

#### `DELETE /api/members/[id]`
Permanently deletes a member.

#### `POST /api/members/bulk-delete`
Bulk deletion.

```json
{ "ids": ["507f1f77bcf86cd799439011", "..."] }
```

- Maximum 500 IDs per request (the dashboard chunks larger selections)
- Returns `{ "deletedCount": N }`

---

## Database Schema

### `forms` (member registrations)

| Field | Type | Constraints |
|---|---|---|
| `serialNumber` | Number | Required, **unique** — permanent sequential member ID (`#1`, `#2`, …) |
| `name` | String | Required, trimmed |
| `number` | Number | Required, **unique** — 10-digit phone number |
| `email` | String | Optional |
| `address` | String | Required |
| `aadhar` | String | Optional — 12-digit Aadhar number |
| `pass` | String | Optional — enum: `SSLC`, `PUC`, `Degree`, `Others` |
| `year` | String | Optional — graduation year (1940–2025) |
| `createdAt` / `updatedAt` | Date | Automatic (Mongoose timestamps) |

**Indexes:**

| Keys | Type |
|---|---|
| `{ serialNumber: 1 }` | unique |
| `{ number: 1 }` | unique |
| `{ name: "text", email: "text", pass: "text", year: "text" }` | text |
| `{ createdAt: -1 }` | regular |

### `admins` (administrator accounts)

| Field | Type | Constraints |
|---|---|---|
| `username` | String | Required, **unique**, trimmed |
| `email` | String | Required, **unique** |
| `password` | String | Required — bcrypt hash (never plaintext) |
| `createdAt` / `updatedAt` | Date | Automatic |

### `counters` (atomic sequences)

| Field | Type | Description |
|---|---|---|
| `_id` | String | Counter name — `"alumni_serial_number"` |
| `seq` | Number | Current sequence value |

Serial numbers are issued via atomic `findOneAndUpdate` with `$inc` + upsert — concurrent registrations can never produce duplicate IDs.

---

## Authentication & Security

### Session Model

- On sign-in, the server signs a JWT (`expiresIn: 1d`) containing the admin's ID, username, and email, and stores it in an `httpOnly`, `sameSite=lax` cookie (with `secure` enabled in production).
- Because the cookie is `httpOnly`, JavaScript cannot read it, mitigating XSS-based token theft.
- **Every** admin endpoint re-verifies the token *and* confirms the referenced admin still exists in the database — deleted accounts lose access immediately.
- The dashboard's server component performs a cookie check before rendering; client-side redirects are purely supplementary.

### Validation & Injection Defense

- **Server-side Zod validation** on every write endpoint — raw request bodies are never trusted.
- **NoSQL/ReDoS protection** — all user search input is regex-escaped before constructing `$regex` queries.
- **CSV formula-injection sanitization** — export cells beginning with `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`.
- **Rate limiting** — per-IP fixed windows on form submission (10/min), sign-in (10/min), and sign-up (5/min), with `Retry-After` headers.
- **Sign-up gating** — public admin registration is disabled by default via `ALLOW_SIGNUP`.

### Security Recommendations for Operators

- Rotate the database password exposed in the repository history (see [Migration Guide](#migration-guide)).
- Use a unique, high-entropy `TOKEN_SECRET` per environment.
- Restrict the MongoDB user to the `nvpsa` database with least-privilege roles.
- Enable IP allow-listing on your Atlas cluster.

---

## Admin Dashboard

The dashboard is a state-of-the-art data grid built on TanStack Table v8:

- **Sortable columns** — click any header to sort; direction indicators included.
- **Serial Member IDs** — the first column shows permanent `#N` identifiers, stable across pagination and sorting.
- **Faceted filtering** — combine graduation-year and branch filters with full-text search.
- **Column visibility** — sensitive columns (Aadhar, address) hidden by default.
- **Bulk workflows** — select rows, expand to *all matching results*, then bulk-export or bulk-delete with confirmation.
- **URL-synced state** — every interaction updates the query string through React 19's `useTransition`, so views can be copied and shared between admins.
- **Optimistic updates** — edits and deletions reflect in the table immediately, with server round-trips confirmed by toasts.

---

## Data Export

The export engine (ExcelJS) produces two formats from three scopes:

- **CSV** — formula-injection-safe, UTF-8 encoded, with a 10-digit phone format.
- **XLSX** — professionally styled: frozen bold header row, auto-filter enabled, zebra-striped rows, sized columns, and Member ID as the leading column.

Export scopes:

| Scope | Description |
|---|---|
| `all` | Every record, newest first |
| `filtered` | Respects the current search, branch, and year filters |
| `selected` | Only the rows selected in the dashboard |

---

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub.
2. Import the project in Vercel — the framework is auto-detected.
3. Add environment variables in **Settings → Environment Variables**:
   - `MONGODB_URI` — pointing at `/nvpsa`
   - `TOKEN_SECRET` — strong random string
4. Deploy. Vercel automatically runs `next build`, which includes typechecking and linting.

### Other Node.js Hosts

```bash
npm run build
npm run start
```

> The MongoDB connection is cached on `globalThis`, making the app safe under serverless concurrency. No additional connection-pool configuration is required.

---

## Development Workflow

```bash
npm run dev        # Start dev server
npm run build      # Production build (includes type + lint validation)
npm run start      # Serve production build
npm run lint       # ESLint (next/core-web-vitals + next/typescript)
npm run typecheck  # TypeScript strict mode check
```

Code quality standards enforced in CI-ready form:

- TypeScript `strict` mode across the entire codebase
- ESLint with Next.js core-web-vitals and TypeScript rules
- All writes validated server-side with Zod schemas shared by client and server

---

## Migration Guide

The repository includes `scripts/migrate.mjs`, an **idempotent** migration that:

1. Copies all documents from a legacy `test` database to `nvpsa`.
2. Assigns permanent sequential `serialNumber` values in chronological order.
3. Migrates admin accounts and initializes the `alumni_serial_number` counter.
4. Creates all unique and text indexes.
5. Verifies exact counts before optionally dropping the legacy database.

```bash
MIGRATION_URI="mongodb+srv://user:pass@cluster.mongodb.net/test" node scripts/migrate.mjs
```

> **Historical note:** an earlier commit inadvertently exposed the MongoDB connection string in a `.mcp.json` file. The file has been removed from the repository and ignored, but **the credentials live in git history** — rotate the database password in Atlas before treating this repository as fully private, or rewrite history with `git filter-repo` if the repository has not been shared.

---

## License

Proprietary — © Anirudh Girish. All rights reserved. This software is built for the Nutan Vidyalaya Past Students Association.

For support or questions: **anirudhgirish08@gmail.com**
