export function isAuthorizedCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && secret.length >= 8 && request.headers.get("authorization") === `Bearer ${secret}`);
}
