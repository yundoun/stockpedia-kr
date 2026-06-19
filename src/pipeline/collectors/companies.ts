/**
 * 기업 마스터 수집기
 * DART corpCode + company + KRX 종목기본정보 → companies 테이블
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCorpCodes, fetchCompany } from "../clients/dart.js";
import { fetchKospiStocks, fetchKosdaqStocks } from "../clients/krx.js";
import { parseDartDate } from "../parsers/dart-parser.js";
import { parseKrxNumber, parseKrxDate } from "../parsers/krx-parser.js";

export async function collectCompanies(supabase: SupabaseClient) {
  console.log("[companies] Step 1: DART 기업코드 다운로드...");
  const allCorps = await fetchCorpCodes();
  const listed = allCorps.filter((c) => c.stock_code.trim() !== "");
  console.log(`[companies] 전체 ${allCorps.length}개 중 상장사 ${listed.length}개`);

  // Step 2: KRX 종목기본정보 (KOSPI + KOSDAQ 일괄)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  console.log("[companies] Step 2: KRX 종목기본정보 조회...");
  const [kospiStocks, kosdaqStocks] = await Promise.all([
    fetchKospiStocks(today),
    fetchKosdaqStocks(today),
  ]);
  console.log(`[companies] KRX: KOSPI ${kospiStocks.length}개, KOSDAQ ${kosdaqStocks.length}개`);

  // KRX 데이터를 종목코드로 인덱싱
  const krxMap = new Map<string, (typeof kospiStocks)[0]>();
  for (const s of [...kospiStocks, ...kosdaqStocks]) {
    krxMap.set(s.ISU_SRT_CD, s);
  }

  // Step 3: 기본 데이터 적재 (DART + KRX 병합)
  console.log("[companies] Step 3: DB 적재...");
  const rows = listed.map((corp) => {
    const krx = krxMap.get(corp.stock_code);
    const market = krx?.MKT_TP_NM ?? "UNKNOWN";

    return {
      corp_code: corp.corp_code,
      stock_code: corp.stock_code,
      name_ko: corp.corp_name,
      name_en: krx?.ISU_ENG_NM ?? null,
      stock_name: krx?.ISU_ABBRV ?? corp.corp_name,
      market,
      stock_type: krx?.KIND_STKCERT_TP_NM ?? "보통주",
      listed_at: krx?.LIST_DD ? parseKrxDate(krx.LIST_DD) : null,
      par_value: krx ? parseKrxNumber(krx.PARVAL) : null,
      listed_shares: krx ? parseKrxNumber(krx.LIST_SHRS) : null,
    };
  });

  // 500건씩 배치 UPSERT
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("companies")
      .upsert(batch, { onConflict: "corp_code" });
    if (error) {
      console.error(`[companies] Batch ${i} error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`[companies] ${inserted}/${rows.length}개 적재 완료`);

  // Step 4: DART company.json으로 업종/CEO 보강 (시간이 오래 걸림)
  console.log("[companies] Step 4: DART 기업 상세정보 보강 (시간 소요)...");
  let enriched = 0;
  let errors = 0;
  for (const corp of listed) {
    try {
      const detail = await fetchCompany(corp.corp_code);
      if (detail.status !== "000") continue;

      const corpCls = detail.corp_cls === "Y" ? "KOSPI" : detail.corp_cls === "K" ? "KOSDAQ" : null;

      await supabase
        .from("companies")
        .update({
          ceo: detail.ceo_nm || null,
          industry_code: detail.induty_code || null,
          established_at: parseDartDate(detail.est_dt),
          fiscal_month: detail.acc_mt ? Number(detail.acc_mt) : 12,
          market: corpCls ?? undefined,
          name_en: detail.corp_name_eng || undefined,
        })
        .eq("corp_code", corp.corp_code);

      enriched++;
      if (enriched % 100 === 0) {
        console.log(`[companies] 상세정보 ${enriched}/${listed.length} 처리...`);
      }

      // Rate limit: 분당 1,000건 → 60ms 간격
      await sleep(60);
    } catch (e) {
      errors++;
      if (errors <= 5) console.error(`[companies] ${corp.corp_code} error:`, (e as Error).message);
    }
  }
  console.log(`[companies] 상세정보 보강 완료: ${enriched} 성공, ${errors} 실패`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
