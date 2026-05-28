# Score

World Cup 2026 score prediction app built with Next.js, PostgreSQL, Prisma, encrypted cookie sessions, and Docker Compose.

## Production local/VM

1. Install Docker and Docker Compose.
2. Run `cp .env.example .env`.
3. Edit `SESSION_SECRET` to a random value of at least 32 characters, change `CRON_SECRET`, and set `ADMIN_PASSWORD`.
4. Run `docker compose up -d --build`.
5. Open [http://localhost](http://localhost) or `http://SERVER_IP`.

The initial seed is idempotent and syncs fixtures from the configured provider; it does not create demo users.
When serving through HTTPS, set `SESSION_COOKIE_SECURE="true"` in `.env`.
Production should use `FOOTBALL_API_PROVIDER="thesportsdb"` with `THESPORTSDB_API_KEY`, `THESPORTSDB_LEAGUE_ID`, and `THESPORTSDB_SEASON` configured.
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to create or update the hidden admin account during seed.
You can also create/update it manually after deploy:

```sh
docker compose exec app sh -lc 'npm run db:create-admin'
```

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

`FOOTBALL_API_PROVIDER=thesportsdb` calls `eventsseason.php` and trusts the returned season events as the match list. `FOOTBALL_API_PROVIDER=mock` is only intended for local development/tests.
Run the sync endpoint manually or from a weekly VM cron; it will not delete missing matches or overwrite admin result overrides.
Admin users can open `/admin` to override final scores; saving an override recalculates predictions for that match immediately.

## Dev mode

```sh
npm install
docker compose up -d postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Set `DATABASE_URL` for a localhost PostgreSQL connection and provide `SESSION_SECRET` before starting development.
