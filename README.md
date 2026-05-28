# Score

World Cup 2026 score prediction app built with Next.js, PostgreSQL, Prisma, encrypted cookie sessions, and Docker Compose.

## Production local/VM

1. Install Docker and Docker Compose.
2. Run `cp .env.example .env`.
3. Edit `SESSION_SECRET` to a random value of at least 32 characters and change `CRON_SECRET`.
4. Run `docker compose up -d --build`.
5. Open [http://localhost](http://localhost) or `http://SERVER_IP`.

The initial seed is idempotent and only syncs mock fixtures; it does not create demo users.
When serving through HTTPS, set `SESSION_COOKIE_SECURE="true"` in `.env`.
Docker Compose includes a `scheduler` service that calls match sync and score calculation every 60 seconds.

To remove old demo/test users from an existing database:

```sh
CONFIRM_DELETE_TEST_USERS=true npm run db:delete-test-users
```

With Docker Compose production:

```sh
docker compose exec app sh -lc 'CONFIRM_DELETE_TEST_USERS=true npm run db:delete-test-users'
```

User avatars are assigned deterministically from `public/assets/avatar/ramdom1.jpg` through `ramdom10.jpg`, so they stay stable across refreshes without changing the database schema. The favicon is served from `/favicon.png`; after deploy, hard refresh with Ctrl+F5 or open an incognito window if the browser tab still shows a cached icon.

## Cron manual

```sh
curl -X POST http://localhost/api/cron/sync-matches \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

curl -X POST http://localhost/api/cron/calculate-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

`FOOTBALL_API_PROVIDER=mock` supplies the bundled fixtures. To use the provider skeleton, set `FOOTBALL_API_PROVIDER=football-data-org` and provide `FOOTBALL_API_KEY`.
Live scores are synced server-side by the scheduler; clients see updated scores after page reloads.

## Dev mode

```sh
npm install
docker compose up -d postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Set `DATABASE_URL` for a localhost PostgreSQL connection and provide `SESSION_SECRET` before starting development.
