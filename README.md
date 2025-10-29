# EmailApp

A full-stack foundation for a secure email orchestration platform. The Node.js API exposes JWT-authenticated endpoints for managing users, email accounts, cached messages, and webhook notifications while handling encrypted credentials, rate limiting, and polling workers for IMAP/POP3 mailboxes. A lightweight EJS-powered admin dashboard scaffold is bundled for future monitoring enhancements.

## Features

- **Express + Sequelize + Supabase Postgres** data layer with migrations for users, email accounts, cached emails, and webhooks.
- **JWT authentication** (`/auth/register`, `/auth/login`, `/auth/logout`) with bcrypt password hashing and role-aware authorization for administrative routes.
- **Encrypted email credentials** using AES-256-GCM and environment-controlled secrets.
- **Email account CRUD** endpoints supporting OAuth token persistence, SMTP sending via Nodemailer, and placeholders for IMAP/POP3 polling (Node IMAP + POP3) that cache inbound messages.
- **Webhook management** with signed payload delivery, retry logic, and structured logging.
- **Security middleware** including Celebrate/Joi validation, global rate limiting, and guidance for HTTPS/TLS termination.
- **Docker + docker-compose** workflow alongside a `.env.example` to accelerate local or cloud deployment (e.g., DigitalOcean App Platform or Droplets).
- **Admin dashboard scaffold** served under `/api/admin` for extending user/log oversight views.

## Project Structure

```
EmailApp/
├── docker-compose.yml
├── README.md
└── server/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── .sequelizerc
    ├── .env.example
    ├── migrations/
    ├── seeders/
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        ├── utils/
        └── views/
```

## Prerequisites

- Node.js 18+ and npm (Node 20 LTS recommended)
- A Supabase project with database credentials (connection string or discrete host/user/password)
- OpenSSL-compatible environment for TLS (production)
- Docker Desktop (optional but recommended for parity with deployment)

## Configuration

1. Copy the example environment file and adjust secrets:

 ```bash
  cp server/.env.example server/.env
  ```

2. Update `server/.env` with production-ready values:
   - `JWT_SECRET`, `WEBHOOK_SIGNATURE_SECRET`, and `ENCRYPTION_KEY` should be high-entropy strings.
   - Provide either `SUPABASE_DB_URL` (preferred) or the discrete `SUPABASE_DB_HOST`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_NAME`, and `SUPABASE_DB_PORT` values from the Supabase dashboard.
   - Keep `SUPABASE_DB_SSL=true` unless you are tunnelling traffic through an internal network that does not require TLS.

3. (Optional) configure OAuth client secrets for providers you intend to support. These values are persisted in the `email_accounts` table.

## Local Development

```bash
cd server
npm install
npm run supabase:setup   # optional once-off to create tables immediately
npm run dev
```

The API listens on `http://localhost:4000/api`. Helpful routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/email-accounts`
- `POST /api/email-accounts/:id/send`
- `GET /api/webhooks`
- `GET /api/admin` (requires an authenticated admin JWT)

Use the `/api/health` endpoint for liveness checks.

### Database Migrations

- The application automatically synchronizes Sequelize models with Supabase on start-up.
- Run migrations manually (optional) with `npm run db:migrate` if you prefer using the migration files over `sequelize.sync()`.
- Roll back the latest migration: `npm run db:migrate:undo`
- (Optional) add future seed scripts under `server/seeders/` and execute with `npm run db:seed`.

### Testing Webhooks Locally

For local webhook receivers, tools like [smee.io](https://smee.io/) or [ngrok](https://ngrok.com/) can tunnel public URLs. Register the URL via `/api/webhooks` and monitor delivery logs in the database or server logs (`winston`).

## Docker Workflow

```bash
docker compose up --build
```

- `api`: builds from `server/Dockerfile`, applies environment variables from `server/.env`, and exposes port 4000.

Ensure tables exist inside the container (if you did not run the setup script locally):

```bash
docker compose exec api npm run supabase:setup
```

## HTTPS & Security Guidance

- Terminate TLS using a reverse proxy (e.g., Nginx, Traefik, or a managed load balancer). Point it at the Express service on port 4000.
- Enforce HTTPS-only cookies and secure headers using proxies (Helmet can be added if you require stricter CSP/HSTS rules).
- Rotate JWT and encryption keys periodically. Consider using a secrets manager (DigitalOcean Secrets, AWS Secrets Manager, Vault, etc.).
- In production, externalize the token blacklist into a durable cache (Redis) to coordinate logout across replicas.

## Deployment on DigitalOcean

1. **Droplet + Docker Compose**
   - Provision a Droplet (Ubuntu 22.04 LTS) with Docker preinstalled.
   - Clone this repository and copy `.env` files (avoid committing secrets).
   - Run `docker compose up -d --build`.
   - Configure a firewall to allow ports 80/443. Database traffic stays within Supabase, so you do not need to expose Postgres locally.
   - Populate the Supabase environment variables in `server/.env` using the credentials from your Supabase project.

2. **App Platform**
   - Create a new App Platform service pointing to this repo.
   - Set the build path to `server/` with the default Node.js builder.
   - Configure environment variables via the App Platform dashboard (use the Supabase keys from `.env.example`).
   - Supply Supabase as the backing database by setting `SUPABASE_DB_URL` (or the discrete host/user/password variables).
   - Enable automatic HTTPS and scale worker counts as needed.

Each deployment automatically synchronizes Supabase tables on boot; optionally run `npm run supabase:setup` during release workflows for immediate schema creation.

## Extending the Admin Dashboard

The EJS view at `src/views/admin.ejs` acts as a stub. Suggested enhancements:

- Fetch webhook delivery metrics via new controller methods.
- Embed charts using Chart.js, React, or Vue; mount a SPA under `/admin` if you prefer a richer UI.
- Introduce server-sent events or WebSocket feeds for real-time monitoring of polling/SMTP activity.

## Logging & Monitoring

- Winston logs to STDOUT by default. Route container logs to your log aggregation platform (e.g., DigitalOcean Logging, Datadog, or ELK).
- Expand `logger` transports for file output if required.
- Instrument webhook retries and polling statistics by adding metrics exporters (Prometheus, StatsD).

## Next Steps

- Replace the in-memory JWT blacklist with Redis or another shared cache.
- Implement full IMAP message fetching inside `pollingService.processImapMessage`.
- Add integration/unit tests (Jest, Supertest) for critical flows.
- Harden OAuth flows with provider-specific implementations and refresh scheduling.
- Automate schema migrations using CI/CD pipelines.

Happy emailing!
