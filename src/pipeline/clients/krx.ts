/**
 * KRX Open API 클라이언트
 * https://data-dbg.krx.co.kr
 */

const BASE_URL = "https://data-dbg.krx.co.kr/svc/apis";

function getApiKey(): string {
  const key = process.env.KRX_API_KEY;
  if (!key) throw new Error("Missing KRX_API_KEY");
  return key;
}

async function fetchKrx<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { AUTH_KEY: getApiKey() },
  });
  if (!res.ok) {
    throw new Error(`KRX API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { OutBlock_1?: T[]; respCode?: string; respMsg?: string };

  if (data.respCode === "401") {
    throw new Error(`KRX auth error: ${data.respMsg}`);
  }

  return data.OutBlock_1 ?? [];
}

// ── Types ──

export interface KrxDailyPrice {
  BAS_DD: string;     // 기준일 YYYYMMDD
  ISU_CD: string;     // 종목코드 (6자리)
  ISU_NM: string;     // 종목명
  MKT_NM: string;     // KOSPI / KOSDAQ
  SECT_TP_NM: string; // 소속부
  TDD_CLSPRC: string; // 종가
  CMPPREVDD_PRC: string; // 전일대비
  FLUC_RT: string;    // 등락률
  TDD_OPNPRC: string; // 시가
  TDD_HGPRC: string;  // 고가
  TDD_LWPRC: string;  // 저가
  ACC_TRDVOL: string; // 거래량
  ACC_TRDVAL: string; // 거래대금
  MKTCAP: string;     // 시가총액
  LIST_SHRS: string;  // 상장주식수
}

export interface KrxStockInfo {
  ISU_CD: string;           // ISIN (KR7005930003)
  ISU_SRT_CD: string;       // 종목코드 (005930)
  ISU_NM: string;           // 종목명 (정식)
  ISU_ABBRV: string;        // 종목 약칭
  ISU_ENG_NM: string;       // 영문명
  LIST_DD: string;          // 상장일
  MKT_TP_NM: string;        // KOSPI / KOSDAQ
  SECUGRP_NM: string;       // 주권
  SECT_TP_NM: string;       // 소속부
  KIND_STKCERT_TP_NM: string; // 보통주/우선주
  PARVAL: string;           // 액면가
  LIST_SHRS: string;        // 상장주식수
}

export interface KrxIndexPrice {
  BAS_DD: string;
  IDX_CLSS: string;       // KOSPI, KOSDAQ 등
  IDX_NM: string;         // 지수명
  CLSPRC_IDX: string;     // 종가
  CMPPREVDD_IDX: string;  // 전일대비
  FLUC_RT: string;        // 등락률
  OPNPRC_IDX: string;     // 시가
  HGPRC_IDX: string;      // 고가
  LWPRC_IDX: string;      // 저가
  ACC_TRDVOL: string;     // 거래량
  ACC_TRDVAL: string;     // 거래대금
  MKTCAP: string;         // 시가총액
}

// ── API 호출 ──

/** KOSPI 전종목 일별 시세 */
export function fetchKospiDaily(date: string): Promise<KrxDailyPrice[]> {
  return fetchKrx("sto/stk_bydd_trd", { basDd: date });
}

/** KOSDAQ 전종목 일별 시세 */
export function fetchKosdaqDaily(date: string): Promise<KrxDailyPrice[]> {
  return fetchKrx("sto/ksq_bydd_trd", { basDd: date });
}

/** KOSPI 종목기본정보 */
export function fetchKospiStocks(date: string): Promise<KrxStockInfo[]> {
  return fetchKrx("sto/stk_isu_base_info", { basDd: date });
}

/** KOSDAQ 종목기본정보 */
export function fetchKosdaqStocks(date: string): Promise<KrxStockInfo[]> {
  return fetchKrx("sto/ksq_isu_base_info", { basDd: date });
}

/** KOSPI 지수 시세 */
export function fetchKospiIndex(date: string): Promise<KrxIndexPrice[]> {
  return fetchKrx("idx/kospi_dd_trd", { basDd: date });
}

/** KOSDAQ 지수 시세 */
export function fetchKosdaqIndex(date: string): Promise<KrxIndexPrice[]> {
  return fetchKrx("idx/kosdaq_dd_trd", { basDd: date });
}

/** KRX 지수 시세 */
export function fetchKrxIndex(date: string): Promise<KrxIndexPrice[]> {
  return fetchKrx("idx/krx_dd_trd", { basDd: date });
}
