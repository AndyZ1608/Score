import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export type TeamFlagInfo = {
  code: string;
  name: string;
  flagUrl: string;
};

const TEAM_NAME_TO_COUNTRY_CODE: Record<string, string> = {
  usa: "us",
  "united states": "us",
  "united states of america": "us",

  "south korea": "kr",
  "korea republic": "kr",
  "republic of korea": "kr",

  "north korea": "kp",
  "korea dpr": "kp",

  "czech republic": "cz",
  czechia: "cz",

  "ivory coast": "ci",
  "cote d'ivoire": "ci",

  iran: "ir",
  "ir iran": "ir",

  russia: "ru",
  "russian federation": "ru",

  england: "gb-eng",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",

  "china pr": "cn",
  china: "cn",

  "dr congo": "cd",
  "congo dr": "cd",
  "democratic republic of the congo": "cd",

  congo: "cg",
  "republic of the congo": "cg",

  "cape verde": "cv",
  "cabo verde": "cv",

  curacao: "cw",

  bolivia: "bo",
  "bolivia plurinational state of": "bo",

  venezuela: "ve",
  "venezuela bolivarian republic of": "ve",

  tanzania: "tz",
  "united republic of tanzania": "tz",

  syria: "sy",
  "syrian arab republic": "sy",

  moldova: "md",
  "moldova republic of": "md",

  vietnam: "vn",
  "viet nam": "vn",

  laos: "la",
  "lao pdr": "la",

  palestine: "ps",
  "palestinian territory": "ps",

  "hong kong": "hk",
  macau: "mo",

  taiwan: "tw",
  "chinese taipei": "tw",

  kosovo: "xk",
};

export function normalizeTeamName(teamName: string): string {
  return teamName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019`]/g, "'")
    .replace(/\s+/g, " ");
}

function flagCdnUrl(code: string): string {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function getTeamFlagInfo(teamName: string): TeamFlagInfo | null {
  const normalized = normalizeTeamName(teamName);
  if (!normalized) return null;

  const aliasCode = TEAM_NAME_TO_COUNTRY_CODE[normalized];
  if (aliasCode) {
    return {
      code: aliasCode,
      name: teamName,
      flagUrl: flagCdnUrl(aliasCode),
    };
  }

  const alpha2 = countries.getAlpha2Code(teamName, "en");
  if (!alpha2) return null;

  const code = alpha2.toLowerCase();
  return {
    code,
    name: countries.getName(alpha2, "en") ?? teamName,
    flagUrl: flagCdnUrl(code),
  };
}

export function getTeamFlag(teamName: string): string | null {
  return getTeamFlagInfo(teamName)?.flagUrl ?? null;
}
