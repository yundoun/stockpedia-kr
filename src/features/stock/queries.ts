import { createPublicClient } from "@/lib/supabase/client";
import type { Company, Financial, DailyPrice } from "./types";

const supabase = createPublicClient();

/** 종목코드로 기업 조회 */
export async function getCompany(stockCode: string): Promise<Company | null> {
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("stock_code", stockCode)
    .single();
  return data;
}

/** 종목코드로 최신 시세 조회 */
export async function getLatestPrice(
  stockCode: string
): Promise<DailyPrice | null> {
  const { data } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("stock_code", stockCode)
    .order("date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

/** 종목코드로 재무제표 조회 (최근 5년, 연간) */
export async function getFinancials(corpCode: string): Promise<Financial[]> {
  const { data } = await supabase
    .from("financials")
    .select("*")
    .eq("corp_code", corpCode)
    .is("quarter", null) // 연간만
    .order("fiscal_year", { ascending: false })
    .limit(5);
  return data ?? [];
}

/** 종목코드로 일봉 조회 (최근 N일) */
export async function getPriceHistory(
  stockCode: string,
  days: number = 365
): Promise<DailyPrice[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("daily_prices")
    .select("*")
    .eq("stock_code", stockCode)
    .gte("date", sinceStr)
    .order("date", { ascending: true });
  return data ?? [];
}

/** 전종목 리스트 (시총 순) */
export async function getAllStocks(limit: number = 50) {
  const { data } = await supabase
    .from("daily_prices")
    .select(
      "stock_code, close, change, change_pct, volume, market_cap, date"
    )
    .order("date", { ascending: false })
    .limit(5000); // 최신 날짜 데이터

  if (!data || data.length === 0) return [];

  // 최신 날짜만 필터
  const latestDate = data[0].date;
  const latest = data.filter((d) => d.date === latestDate);

  // 시총 순 정렬
  latest.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));

  return latest.slice(0, limit);
}
