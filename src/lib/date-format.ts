const MATCH_TIME_ZONE = "Asia/Bangkok";
const MATCH_LOCALE = "vi-VN";

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatMatchDate(date: Date | string): string {
  return new Intl.DateTimeFormat(MATCH_LOCALE, {
    timeZone: MATCH_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(date));
}

export function formatMatchTime(date: Date | string): string {
  return new Intl.DateTimeFormat(MATCH_LOCALE, {
    timeZone: MATCH_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(toDate(date));
}

export function formatMatchDateTime(date: Date | string): string {
  return `${formatMatchTime(date)}, ${formatMatchDate(date)} (GMT+7)`;
}
