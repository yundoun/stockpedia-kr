/**
 * 초기 데이터 수집 (1회성)
 *
 * 실행: npx tsx src/pipeline/jobs/seed.ts [step] [date]
 *   step 생략 → 전체 실행
 *   step=companies → 기업 마스터만
 *   step=prices → 시세 (date 지정 가능, 기본 어제)
 *   step=financials → 재무제표 (5년)
 */

import "dotenv/config";
import { createServiceClient } from "../../lib/supabase/server.js";
import { collectCompanies } from "../collectors/companies.js";
import { collectDailyPrices, collectIndexPrices } from "../collectors/prices.js";
import { collectFinancials } from "../collectors/financials.js";

async function main() {
  const step = process.argv[2]; // companies | prices | financials | (없으면 전체)
  const dateArg = process.argv[3]; // YYYYMMDD (optional)
  const supabase = createServiceClient();

  console.log("=== Stockpedia KR — 초기 데이터 수집 ===\n");

  // Step 1: 기업 마스터
  if (!step || step === "companies") {
    const start = Date.now();
    await collectCompanies(supabase);
    console.log(`\n기업 마스터 완료 (${((Date.now() - start) / 1000).toFixed(0)}초)\n`);
  }

  // Step 2: 시세 (기본 = 가장 최근 거래일)
  if (!step || step === "prices") {
    // 기본값: 어제 (주말이면 금요일)
    const date = dateArg ?? getLastTradingDate();
    const start = Date.now();
    await collectDailyPrices(supabase, date);
    await collectIndexPrices(supabase, date);
    console.log(`\n시세 수집 완료 (${((Date.now() - start) / 1000).toFixed(0)}초)\n`);
  }

  // Step 3: 재무제표 (최근 5년)
  if (!step || step === "financials") {
    // DB에서 상장사 목록 조회 (Supabase 기본 limit=1000이므로 전체 가져오기)
    let allCompanies: { corp_code: string }[] = [];
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const { data } = await supabase
        .from("companies")
        .select("corp_code")
        .order("corp_code")
        .range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      allCompanies = allCompanies.concat(data);
      if (data.length < PAGE) break;
      from += PAGE;
    }
    const companies = allCompanies;

    if (!companies || companies.length === 0) {
      console.error("기업 마스터가 비어있습니다. companies 먼저 실행하세요.");
      process.exit(1);
    }

    const corpCodes = companies.map((c) => c.corp_code);
    const currentYear = new Date().getFullYear();

    // dateArg가 있으면 특정 연도만, 없으면 5년치
    const years = dateArg
      ? [Number(dateArg)]
      : [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    for (const year of years) {
      const start = Date.now();
      await collectFinancials(supabase, corpCodes, year);
      console.log(`${year}년 완료 (${((Date.now() - start) / 1000).toFixed(0)}초)\n`);
    }
  }

  console.log("=== 수집 완료 ===");
}

/** 가장 최근 거래일 (YYYYMMDD) */
function getLastTradingDate(): string {
  const d = new Date();
  // 오늘이 장중이면 어제로
  d.setDate(d.getDate() - 1);
  // 주말 스킵
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
