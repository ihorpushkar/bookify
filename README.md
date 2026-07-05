# Bookify

Service booking platform — a fullstack pet project for learning and portfolio.

Clients browse services, pick a time slot, and book appointments. Providers manage services, working hours, and incoming bookings.

## Features

- Public service catalog with provider profiles
- Slot-based booking with conflict detection and working-hours validation
- Multi-role access: `CLIENT`, `PROVIDER`, `ADMIN`
- JWT access + refresh tokens
- Provider dashboard — services, schedule, incoming bookings
- Client dashboard — my bookings, cancel / status updates
- Email notifications (Nodemailer; Ethereal in dev, SMTP in production)

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, React Router, Zustand, Axios, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL |
| Auth | JWT access + refresh tokens, bcrypt, Zod validation |
| Security | Helmet, rate limiting, CORS, env validation |
| Extra | Nodemailer, date-fns, Vitest, Supertest |

## Project structure

```
book-site/
├── backend/          # Express API, Prisma, tests
├── frontend/         # React SPA
└── README.md
```

## Prerequisites

- Node.js 20+
- Hosted PostgreSQL ([Neon](https://neon.tech) recommended, or [Railway](https://railway.com))

## Quick start

### 1. Database

1. Create a PostgreSQL database on Neon (use the **pooled** connection string)
2. Copy `DATABASE_URL` from the provider dashboard
3. Create `backend/.env` from the example (see below)

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Set in `backend/.env`:

- `DATABASE_URL` — from Neon / Railway
- `JWT_SECRET` — generate with `openssl rand -base64 48` (min 32 chars)

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API runs at `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (Vite proxies `/api` to the backend in dev).

> **Note:** Copy `frontend/.env.example` to `.env.local` only if you need a custom `VITE_API_URL` (e.g. production build pointing to a deployed API).

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string (`?sslmode=require` for Neon) |
| `JWT_SECRET` | Min 32 characters — `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `7d`) |
| `CORS_ORIGIN` | Frontend URL (default `http://localhost:5173`) |
| `EMAIL_FROM` | Sender address for emails |
| `SMTP_*` | Optional SMTP settings (dev uses Ethereal if unset) |

Never commit `backend/.env` — it is listed in `.gitignore`.

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (optional in dev — Vite proxy is used by default) |

## Seed accounts (dev only)

Run `npm run db:seed` in `backend/`. Do **not** use these credentials in production.

| Role | Email | Password |
|------|-------|--------|
| Admin | admin@bookify.test | admin123 |
| Provider | barber@bookify.test | provider123 |
| Provider | tutor@bookify.test | provider123 |
| Client | client1@bookify.test | client123 |
| Client | client2@bookify.test | client123 |

New registrations require a password of at least **8 characters**.

## API endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Register (client or provider) |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/auth/me` | JWT | Current user profile |
| GET | `/api/services` | — | Public service catalog |
| POST | `/api/services` | Provider | Create service |
| PATCH | `/api/services/:id` | Provider | Update own service |
| DELETE | `/api/services/:id` | Provider | Delete own service |
| GET | `/api/providers/:id` | — | Provider profile + services |
| GET | `/api/providers/:id/slots` | — | Available slots (`?date=&serviceId=`) |
| PATCH | `/api/providers/me` | Provider | Update bio / working hours |
| POST | `/api/bookings` | Client | Create booking |
| GET | `/api/bookings/me` | Client | My bookings |
| GET | `/api/bookings/incoming` | Provider | Incoming bookings |
| PATCH | `/api/bookings/:id/status` | Client/Provider | Confirm, cancel, complete |

## Tests

```bash
cd backend
npm test
```

Covers:

- Booking logic — working hours validation, conflict detection, slot generation
- Auth — validation, password hashing, JWT, health endpoint

## Database migrations

Development:

```bash
cd backend
npm run db:migrate
```

Production:

```bash
cd backend
npx prisma migrate deploy
```

## Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled app (`dist/server.js`) |
| `npm test` | Run Vitest tests |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

## Architecture highlights

- **Service layer** — booking conflict detection and slot generation in `backend/src/services/bookingService.ts`, separate from HTTP controllers
- **Multi-role auth** — clients book services; providers manage schedules and confirm bookings
- **Email notifications** — provider notified on new booking, client notified on confirmation (async, non-blocking)
- **Input validation** — Zod schemas on all API inputs
- **Security middleware** — Helmet headers, rate limits on auth and API routes

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Database operation failed` on login | Neon idle disconnect — restart backend (`npm run dev`) and retry |
| `JWT_SECRET` warning on startup | Replace placeholder in `.env` with `openssl rand -base64 48` |
| Services page empty | Check backend is running and `DATABASE_URL` is correct |

## License

ISC
