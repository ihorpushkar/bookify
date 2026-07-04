# Bookify

Service booking platform — a fullstack pet project for learning and portfolio.

Clients browse services, pick a time slot, and book appointments. Providers manage services, working hours, and incoming bookings.

## Tech stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, React Router, Zustand, Axios, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL |
| Auth | JWT access + refresh tokens, bcrypt, roles: `CLIENT` / `PROVIDER` / `ADMIN` |
| Extra | Nodemailer, date-fns, Vitest, Supertest |

## Project structure

```
book-site/
├── backend/          # Express API
├── frontend/         # React app
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate    # or: npm run db:push (dev only)
npm run db:seed
npm run dev
```

API runs at `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # optional
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32 characters |
| `JWT_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `7d`) |
| `CORS_ORIGIN` | Frontend URL (default `http://localhost:5173`) |
| `EMAIL_FROM` | Sender address for emails |
| `SMTP_*` | Optional SMTP settings (dev uses Ethereal if unset) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (optional — Vite proxy used in dev) |

## Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bookify.test | admin123 |
| Provider | barber@bookify.test | provider123 |
| Provider | tutor@bookify.test | provider123 |
| Client | client1@bookify.test | client123 |
| Client | client2@bookify.test | client123 |

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
npm run db:migrate
```

Production:

```bash
npx prisma migrate deploy
```

## Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm test` | Run Vitest tests |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |

## Architecture highlights

- **Service layer** — booking conflict detection and slot generation live in `backend/src/services/bookingService.ts`, separate from HTTP controllers
- **Multi-role auth** — clients book services; providers manage schedules and confirm bookings
- **Email notifications** — provider notified on new booking, client notified on confirmation (async, non-blocking)

## License

ISC
