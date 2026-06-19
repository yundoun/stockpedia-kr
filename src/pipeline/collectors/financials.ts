/**
 * 재무제표 + 배당 수집기
 * DART fnlttSinglAcnt + alotMatter → financials 테이블
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchFinancials, fetchDividend } from "../clients/dart.js";
import { parseDartAmount, parseDartPercent } from "../parsers/dart-parser.js";

interface FinancialRow {
  corp_code: string;
  fiscal_year: number;
  quarter: null;
  fs_div: string;
  revenue: number | null;
  operating_income: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_debt: number | null;
  total_equity: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  eps: number | null;
  bps: number | null;
  dividend_per_share: number | null;
  dividend_yield: number | null;
  payout_ratio: number | null;
  roe: number | null;
  roa: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  debt_ratio: number | null;
  revenue_growth: number | null;
}

/** 특정 연도 재무제표 수집 */
export async function collectFinancials(
  supabase: SupabaseClient,
  corpCodes: string[],
  year: number
) {
  console.log(`[financials] ${year}년 재무제표 수집 시작 (${corpCodes.length}종목)...`);

  let success = 0;
  let empty = 0;
  let errors = 0;

  for (let i = 0; i < corpCodes.length; i++) {
    const corpCode = corpCodes[i];

    try {
      // 재무제표
      const items = await fetchFinancials(corpCode, year);
      if (items.length === 0) {
        empty++;
        await sleep(60);
        continue;
      }

      // CFS(연결) 필터, 없으면 OFS(별도)
      const cfsItems = items.filter((it) => it.fs_div === "CFS");
      const ofsItems = items.filter((it) => it.fs_div === "OFS");
      const useItems = cfsItems.length > 0 ? cfsItems : ofsItems;
      const fsDivUsed = cfsItems.length > 0 ? "CFS" : "OFS";

      const row = buildFinancialRow(corpCode, year, fsDivUsed, useItems);

      // 배당 데이터 조회
      const dividends = await fetchDividend(corpCode, year);
      enrichWithDividend(row, dividends);

      // 계산 지표
      computeDerived(row);

      const { error } = await supabase
        .from("financials")
        .upsert(row, { onConflict: "corp_code,fiscal_year,quarter,fs_div" });

      if (error) {
        console.error(`[financials] ${corpCode} upsert error:`, error.message);
        errors++;
      } else {
        success++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[financials] ${year}: ${i + 1}/${corpCodes.length} 처리 (${success} 성공)`);
      }

      // Rate limit: 분당 1,000건 → 2 API 호출/종목 → 120ms 간격
      await sleep(120);
    } catch (e) {
      errors++;
      if (errors <= 10) {
        console.error(`[financials] ${corpCode} error:`, (e as Error).message);
      }
      await sleep(120);
    }
  }

  console.log(
    `[financials] ${year}년 완료: ${success} 성공, ${empty} 빈응답, ${errors} 에러`
  );
}

function buildFinancialRow(
  corpCode: string,
  year: number,
  fsDiv: string,
  items: { account_nm: string; thstrm_amount: string }[]
): FinancialRow {
  const get = (name: string) => {
    const item = items.find((it) => it.account_nm === name);
    return item ? parseDartAmount(item.thstrm_amount) : null;
  };

  return {
    corp_code: corpCode,
    fiscal_year: year,
    quarter: null, // 연간
    fs_div: fsDiv,
    revenue: get("매출액"),
    operating_income: get("영업이익"),
    net_income: get("당기순이익") ?? get("당기순이익(손실)"),
    total_assets: get("자산총계"),
    total_debt: get("부채총계"),
    total_equity: get("자본총계"),
    current_assets: get("유동자산"),
    current_liabilities: get("유동부채"),
    eps: null,
    bps: null,
    dividend_per_share: null,
    dividend_yield: null,
    payout_ratio: null,
    roe: null,
    roa: null,
    operating_margin: null,
    net_margin: null,
    debt_ratio: null,
    revenue_growth: null,
  };
}

function enrichWithDividend(
  row: FinancialRow,
  items: { se: string; stock_knd: string; thstrm: string }[]
) {
  for (const item of items) {
    const val = parseDartAmount(item.thstrm);
    if (item.se.includes("주당순이익") && item.se.includes("연결")) {
      row.eps = val ? Math.round(val) : null;
    }
    if (item.se.includes("주당 현금배당금") && (item.stock_knd === "보통주" || item.stock_knd === "-")) {
      row.dividend_per_share = val ? Math.round(val) : null;
    }
    if (item.se.includes("현금배당수익률") && (item.stock_knd === "보통주" || item.stock_knd === "-")) {
      row.dividend_yield = val ? Number(val.toFixed(2)) : null;
    }
    if (item.se.includes("현금배당성향")) {
      row.payout_ratio = val ? Number(val.toFixed(2)) : null;
    }
  }
}

function computeDerived(row: FinancialRow) {
  if (row.net_income && row.total_equity && row.total_equity !== 0) {
    row.roe = Number(((row.net_income / row.total_equity) * 100).toFixed(2));
  }
  if (row.net_income && row.total_assets && row.total_assets !== 0) {
    row.roa = Number(((row.net_income / row.total_assets) * 100).toFixed(2));
  }
  if (row.operating_income && row.revenue && row.revenue !== 0) {
    row.operating_margin = Number(((row.operating_income / row.revenue) * 100).toFixed(2));
  }
  if (row.net_income && row.revenue && row.revenue !== 0) {
    row.net_margin = Number(((row.net_income / row.revenue) * 100).toFixed(2));
  }
  if (row.total_debt && row.total_equity && row.total_equity !== 0) {
    row.debt_ratio = Number(((row.total_debt / row.total_equity) * 100).toFixed(2));
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
