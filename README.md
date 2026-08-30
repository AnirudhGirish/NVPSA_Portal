# NVPSA Portal

NVPSA Portal is a robust and secure alumni management platform for the Nutan Vidyalaya Past Students Association. It enables users to submit their details via a dynamic, validated form, while providing administrators with a responsive dashboard to view, manage, and export collected data.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Base UI), TanStack Table v8, React Hook Form, Zod, framer-motion, sonner
- **Backend:** Next.js Route Handlers, MongoDB, Mongoose 8 (global connection cache)
- **Authentication:** JWT in httpOnly cookies, bcryptjs password hashing
- **Exports:** ExcelJS (CSV + styled XLSX, formula-injection sanitization)

---

## Installation

1. **Clone and install**
   ```bash
   npm install
   ```
2. **Environment variables** — copy `.env.example` to `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   TOKEN_SECRET=your_jwt_secret_key
   ALLOW_SIGNUP=false
   ```
   Set `ALLOW_SIGNUP=true` only when creating your first admin account, then disable it.

3. **Run**
   ```bash
   npm run dev
   ```

> Note: if your shell sets `NODE_ENV=production` globally, run `NODE_ENV=development npm run dev` for local development.

---

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (includes typecheck + lint)
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript strict check

---

## API Endpoints

### Public

| Endpoint | Method | Description |
|---|---|---|
| `/api/form` | POST | Submit member data (Zod validated, rate limited 10/min/IP) |
| `/api/form/check?number=` | GET | Live duplicate phone check (returns `{ exists }`) |

### Authenticated (JWT httpOnly cookie)

| Endpoint | Method | Description |
|---|---|---|
| `/api/fetch` | GET | Paginated + filtered member list. Params: `page`, `pageSize` (10/25/50/100), `search`, `sortBy`, `sortOrder`, `pass` (repeatable), `year` (repeatable), `yearRange` |
| `/api/fetch/ids` | GET | All matching ids for current filter (bulk operations, capped at 5000) |
| `/api/stats` | GET | Dashboard KPIs (total, batches, recent signups, branch breakdown) |
| `/api/export` | GET | Export with `format=csv\|xlsx` and `scope=all\|filtered\|selected` |
| `/api/members/[id]` | GET/PATCH/DELETE | Member detail, update (Zod validated), delete |
| `/api/members/bulk-delete` | POST | Bulk delete with `{ ids: string[] }` (500 max per call) |
| `/api/sign-up` | POST | Register admin (gated by `ALLOW_SIGNUP`) |
| `/api/sign-in` | POST | Authenticate; sets httpOnly JWT cookie |
| `/api/sign-out` | POST | Clears auth cookie |

---

## Admin Dashboard Features

- URL-synchronized state (shareable/bookmarkable filtered views): `search`, `page`, `pageSize`, `sortBy`, `sortOrder`, `pass`, `year`
- Debounced global search with ⌘K/Ctrl+K shortcut
- Faceted filters (graduation year, pass/branch) with active badges + reset
- Column visibility toggle, sortable columns, serial numbering
- Row selection with "Select all matching results" + floating bulk bar (bulk export/delete)
- KPI stat cards, member detail slide-over, inline edit dialog, two-step deletion
- Animated skeletons, empty states, offline detection, rate-limit feedback

---

## Security

- All admin endpoints require a valid JWT in an httpOnly, sameSite=lax cookie (secure in production)
- Server-side Zod validation on every write path
- Regex-escaped search (NoSQL/ReDoS safe), CSV formula-injection sanitization
- Per-IP rate limiting with `Retry-After` headers
- `ALLOW_SIGNUP` gate prevents public admin registration
