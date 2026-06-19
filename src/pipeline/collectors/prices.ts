/**
 * 시세 수집기
 * KRX 일별매매정보 → daily_prices + index_prices 테이블
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchKospiDaily,
  fetchKosdaqDaily,
  fetchKospiIndex,
  fetchKosdaqIndex,
  fetchKrxIndex,
} from "../clients/krx.js";
import { parseKrxNumber, parseKrxDate } from "../parsers/krx-parser.js";

/** 특정 날짜의 전종목 시세 수집 */
export async function collectDailyPrices(supabase: SupabaseClient, date: string) {
  console.log(`[prices] ${date} 시세 수집...`);

  const [kospi, kosdaq] = await Promise.all([
    fetchKospiDaily(date),
    fetchKosdaqDaily(date),
  ]);
  console.log(`[prices] KOSPI ${kospi.length}종목, KOSDAQ ${kosdaq.length}종목`);

  const rows = [...kospi, ...kosdaq].map((item) => ({
    stock_code: item.ISU_CD,
    date: parseKrxDate(item.BAS_DD),
    open: parseKrxNumber(item.TDD_OPNPRC),
    high: parseKrxNumber(item.TDD_HGPRC),
    low: parseKrxNumber(item.TDD_LWPRC),
    close: parseKrxNumber(item.TDD_CLSPRC) ?? 0,
    change: parseKrxNumber(item.CMPPREVDD_PRC),
    change_pct: parseKrxNumber(item.FLUC_RT),
    volume: parseKrxNumber(item.ACC_TRDVOL),
    trade_value: parseKrxNumber(item.ACC_TRDVAL),
    market_cap: parseKrxNumber(item.MKTCAP),
  }));

  // 500건씩 UPSERT
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("daily_prices")
      .upsert(batch, { onConflict: "stock_code,date" });
    if (error) {
      console.error(`[prices] Batch ${i} error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`[prices] ${date}: ${inserted}건 적재`);
}

/** 특정 날짜의 지수 시세 수집 */
export async function collectIndexPrices(supabase: SupabaseClient, date: string) {
  console.log(`[index] ${date} 지수 수집...`);

  const [kospi, kosdaq, krx] = await Promise.all([
    fetchKospiIndex(date),
    fetchKosdaqIndex(date),
    fetchKrxIndex(date),
  ]);

  const allIndices = [...kospi, ...kosdaq, ...krx];

  const rows = allIndices
    .filter((item) => item.CLSPRC_IDX && item.CLSPRC_IDX !== "")
    .map((item) => ({
      index_name: item.IDX_NM,
      date: parseKrxDate(item.BAS_DD),
      open: parseKrxNumber(item.OPNPRC_IDX),
      high: parseKrxNumber(item.HGPRC_IDX),
      low: parseKrxNumber(item.LWPRC_IDX),
      close: parseKrxNumber(item.CLSPRC_IDX) ?? 0,
      change: parseKrxNumber(item.CMPPREVDD_IDX),
      change_pct: parseKrxNumber(item.FLUC_RT),
      volume: parseKrxNumber(item.ACC_TRDVOL),
      trade_value: parseKrxNumber(item.ACC_TRDVAL),
      market_cap: parseKrxNumber(item.MKTCAP),
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("index_prices")
      .upsert(rows, { onConflict: "index_name,date" });
    if (error) {
      console.error("[index] error:", error.message);
    }
  }
  console.log(`[index] ${date}: ${rows.length}건 적재`);
}

/** 날짜 범위의 일봉 수집 (과거 데이터 백필) */
export async function backfillPrices(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
) {
  const dates = getTradingDates(startDate, endDate);
  console.log(`[backfill] ${startDate} ~ ${endDate}: ${dates.length}일 수집 예정`);

  for (const date of dates) {
    try {
      await collectDailyPrices(supabase, date);
      await collectIndexPrices(supabase, date);
      // KRX rate limit 여유
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.error(`[backfill] ${date} 실패:`, (e as Error).message);
    }
  }
}

/** 날짜 범위에서 평일만 반환 (YYYYMMDD) */
function getTradingDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(`${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`);
  const endD = new Date(`${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}`);

  while (d <= endD) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      // 평일만
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${y}${m}${dd}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
