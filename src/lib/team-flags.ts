const TEAM_FLAGS: Record<string, string> = {
  argentina: "🇦🇷",
  australia: "🇦🇺",
  belgium: "🇧🇪",
  brazil: "🇧🇷",
  canada: "🇨🇦",
  colombia: "🇨🇴",
  croatia: "🇭🇷",
  denmark: "🇩🇰",
  ecuador: "🇪🇨",
  england: "🏴",
  france: "🇫🇷",
  germany: "🇩🇪",
  ghana: "🇬🇭",
  italy: "🇮🇹",
  japan: "🇯🇵",
  korea: "🇰🇷",
  "korea republic": "🇰🇷",
  mexico: "🇲🇽",
  morocco: "🇲🇦",
  netherlands: "🇳🇱",
  portugal: "🇵🇹",
  senegal: "🇸🇳",
  serbia: "🇷🇸",
  "south africa": "🇿🇦",
  "south korea": "🇰🇷",
  spain: "🇪🇸",
  switzerland: "🇨🇭",
  uruguay: "🇺🇾",
  usa: "🇺🇸",
  "united states": "🇺🇸",
};

export function normalizeTeamName(teamName: string) {
  return teamName.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getTeamFlag(teamName: string): string | null {
  return TEAM_FLAGS[normalizeTeamName(teamName)] ?? null;
}
