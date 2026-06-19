/**
 * DART 응답 파싱 유틸리티
 */

/** 콤마 포함 금액 문자열 → number | null */
export function parseDartAmount(value: string | undefined | null): number | null {
  if (!value || value === "-" || value.trim() === "") return null;
  return Number(value.replace(/,/g, ""));
}

/** DART 날짜 (YYYYMMDD) → Date | null */
export function parseDartDate(value: string | undefined | null): string | null {
  if (!value || value.length !== 8) return null;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

/** 퍼센트 문자열 → number | null */
export function parseDartPercent(value: string | undefined | null): number | null {
  if (!value || value === "-" || value.trim() === "") return null;
  return Number(value.replace(/,/g, ""));
}
