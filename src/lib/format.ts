/**
 * 숫자/날짜 포맷 유틸리티
 * "40대 부모님이 읽기 쉬운" 한국식 숫자 표기
 */

/** 원 단위 가격: 349500 → "349,500" */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "-";
  return value.toLocaleString("ko-KR");
}

/** 시가총액 등 큰 금액: 2087500000000 → "2,087.5조" */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value == null) return "-";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_0000_0000_0000) {
    // 조 단위
    const v = abs / 1_0000_0000_0000;
    return `${sign}${v >= 10 ? v.toFixed(0) : v.toFixed(1)}조`;
  }
  if (abs >= 1_0000_0000) {
    // 억 단위
    const v = abs / 1_0000_0000;
    return `${sign}${v >= 10 ? v.toFixed(0) : v.toFixed(1)}억`;
  }
  if (abs >= 1_0000) {
    // 만 단위
    const v = abs / 1_0000;
    return `${sign}${v.toFixed(0)}만`;
  }
  return `${sign}${abs.toLocaleString("ko-KR")}`;
}

/** 등락률: 4.61 → "+4.61%", -0.92 → "-0.92%" */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** 등락액: 15500 → "+15,500", -3200 → "-3,200" */
export function formatChange(value: number | null | undefined): string {
  if (value == null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ko-KR")}`;
}

/** 배수: 12.5 → "12.5배" */
export function formatMultiple(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value.toFixed(1)}배`;
}

/** 날짜: "2024-12-31" → "2024.12.31" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return value.replace(/-/g, ".");
}
