# Score

World Cup 2026 score prediction app built with Next.js, PostgreSQL, Prisma, encrypted cookie sessions, and Docker Compose.

## Production local/VM

1. Install Docker and Docker Compose.
2. Run `cp .env.example .env`.
3. Edit `SESSION_SECRET` to a random value of at least 32 characters and change `CRON_SECRET`.
4. Run `docker compose up -d --build`.
5. Open [http://localhost](http://localhost) or `http://SERVER_IP`.

The initial seed is idempotent. A demo account is available after first startup: `testuser` / `password123`.
When serving through HTTPS, set `SESSION_COOKIE_SECURE="true"` in `.env`.

## Cron manual

```sh
curl -X POST http://localhost/api/cron/sync-matches \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl -X POST http://localhost/api/cron/calculate-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

`FOOTBALL_API_PROVIDER=mock` supplies the bundled fixtures. To use the provider skeleton, set `FOOTBALL_API_PROVIDER=football-data-org` and provide `FOOTBALL_API_KEY`.

## Dev mode

```sh
npm install
docker compose up -d postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Set `DATABASE_URL` for a localhost PostgreSQL connection and provide `SESSION_SECRET` before starting development.
