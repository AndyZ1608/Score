export const AVATAR_COUNT = 20;
const FALLBACK_AVATAR_ID = 1;

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function isValidAvatarId(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= AVATAR_COUNT;
}

export function getAvatarPathById(avatarId: number): string {
  return `/assets/avatar/ramdom${avatarId}.jpg`;
}

export function getFallbackAvatarId(seed: string | number | null | undefined): number {
  const normalizedSeed = String(seed ?? "").trim();
  if (!normalizedSeed) return FALLBACK_AVATAR_ID;
  return (hashSeed(normalizedSeed) % AVATAR_COUNT) + 1;
}

export function getUserAvatarPath(user: {
  id?: string | number | null;
  username?: string | null;
  avatarId?: number | null;
}): string {
  if (isValidAvatarId(user.avatarId)) return getAvatarPathById(user.avatarId);
  return getAvatarPathById(getFallbackAvatarId(user.id ?? user.username));
}

export function getUserAvatar(seed: string | number | null | undefined): string {
  return getAvatarPathById(getFallbackAvatarId(seed));
}
