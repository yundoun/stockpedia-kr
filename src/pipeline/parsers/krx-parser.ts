/**
 * KRX 응답 파싱 유틸리티
 */

/** KRX 숫자 문자열 → number | null */
export function parseKrxNumber(value: string | undefined | null): number | null {
  if (!value || value === "" || value === "-") return null;
  return Number(value);
}

/** KRX 날짜 (YYYYMMDD) → ISO date string */
export function parseKrxDate(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
