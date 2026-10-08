export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production') return;
  const { MISSING_REDIS_WARNING, redisCredentials } = await import(
    '@/lib/server/career-mp/store'
  );
  if (!redisCredentials()) console.warn(MISSING_REDIS_WARNING);
}
