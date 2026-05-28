const AVAILABLE_AVATAR_COUNT = 10;
const FALLBACK_AVATAR_INDEX = 1;

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getUserAvatar(seed: string | number | null | undefined): string {
  const normalizedSeed = String(seed ?? "").trim();
  if (!normalizedSeed) return `/assets/avatar/ramdom${FALLBACK_AVATAR_INDEX}.jpg`;

  const avatarIndex = (hashSeed(normalizedSeed) % AVAILABLE_AVATAR_COUNT) + 1;
  return `/assets/avatar/ramdom${avatarIndex}.jpg`;
}
