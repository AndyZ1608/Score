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

## Daily Score Sync

The production VM should run the full provider sync and scoring flow once per day at 14:00 Vietnam time. The script calls `sync-matches` first and only calls `calculate-scores` if the sync request succeeds.

Prepare the script on the VM:

```sh
cd /root/Score
chmod +x scripts/run-daily-score-sync.sh
```

Test it manually:

```sh
APP_DIR=/root/Score SCORE_BASE_URL=http://127.0.0.1:8080 /root/Score/scripts/run-daily-score-sync.sh
```

Install the crontab:

```sh
crontab -e
```

Add:

```cron
CRON_TZ=Asia/Ho_Chi_Minh
0 14 * * * APP_DIR=/root/Score SCORE_BASE_URL=http://127.0.0.1:8080 /root/Score/scripts/run-daily-score-sync.sh >> /var/log/score-daily-sync.log 2>&1
```

Check the crontab and logs:

```sh
crontab -l
tail -n 100 /var/log/score-daily-sync.log
```

Production deploy checklist:

```sh
npm run build
cd /root/Score
git pull origin main
docker compose up -d --build --force-recreate
curl -I http://127.0.0.1:8080
```

Manual endpoint verification:

```sh
CRON_SECRET=$(grep '^CRON_SECRET=' .env | cut -d= -f2- | tr -d '"')

curl -s -X POST http://127.0.0.1:8080/api/cron/sync-matches \
  -H "Authorization: Bearer $CRON_SECRET" | jq

curl -s -X POST http://127.0.0.1:8080/api/cron/calculate-scores \
  -H "Authorization: Bearer $CRON_SECRET" | jq
```

## Production Update: TheSportsDB

### Step 1: Edit `.env`

```sh
nano .env
```

Set:

```env
FOOTBALL_API_PROVIDER="thesportsdb"
THESPORTSDB_API_KEY="123"
THESPORTSDB_LEAGUE_ID="4429"
THESPORTSDB_SEASON="2026"
THESPORTSDB_BASE_URL="https://www.thesportsdb.com/api/v1/json"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="CHANGE_ME_STRONG_PASSWORD"
ADMIN_DISPLAY_NAME="System Admin"

TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
TELEGRAM_NOTIFY_REGISTRATION="true"
```

### Step 2: Recreate containers

```sh
docker compose up -d --build --force-recreate
```

### Step 3: Verify env inside container

```sh
docker compose exec app printenv | grep -E "ADMIN|FOOTBALL|THESPORTSDB"
```

Expected:

```text
FOOTBALL_API_PROVIDER=thesportsdb
THESPORTSDB_API_KEY=123
THESPORTSDB_LEAGUE_ID=4429
THESPORTSDB_SEASON=2026
```

### Step 4: Run migration

```sh
docker compose exec app npx prisma migrate deploy
```

### Step 5: Create admin

```sh
docker compose exec app npm run db:create-admin
docker compose exec app npm run db:verify-admin
```

Optional Telegram registration notification test:

```sh
docker compose exec app npm run test:telegram
```

### Step 6: Cleanup mock matches

```sh
docker compose exec app sh -lc 'CONFIRM_CLEANUP_MOCK_MATCHES=true npm run db:cleanup-mock-matches'
```

### Step 7: Sync TheSportsDB

```sh
curl -s -X POST http://localhost/api/cron/sync-matches \
  -H "Authorization: Bearer YOUR_CRON_SECRET" | jq
```

Expected: `provider=thesportsdb` and `fetched=15`.

### Step 8: Verify DB matches

```sh
docker compose exec app npm run db:verify-matches
```

Expected: `source thesportsdb visible = 15`, `source mock visible = 0`, and archived mock count if any.

## Dev mode

```sh
npm install
docker compose up -d postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Set `DATABASE_URL` for a localhost PostgreSQL connection and provide `SESSION_SECRET` before starting development.
