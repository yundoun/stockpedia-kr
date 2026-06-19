# Stockpedia KR — 데이터 파이프라인 설계

> 작성일: 2026-06-19
> 상태: API 탐색 완료, 설계 확정

---

## 1. 데이터 소스 확정

### 1.1 API 인증 방식

| 소스 | 인증 방식 | 제한 |
|------|----------|------|
| DART OpenAPI | 쿼리파라미터 `crtfc_key` | 10,000 req/일, 1,000 req/분 |
| KRX Open API | 헤더 `AUTH_KEY` | 10,000 req/일 |

### 1.2 엔드포인트 목록

**DART (https://opendart.fss.or.kr/api/)**

| 엔드포인트 | 용도 | 응답 형태 |
|-----------|------|----------|
| `corpCode.xml` | 전체 기업코드 목록 (ZIP) | XML (118,340개 중 상장 3,970개) |
| `company.json` | 기업 상세정보 | JSON (1건) |
| `fnlttSinglAcnt.json` | 주요 재무제표 (간략) | JSON (30항목, 연결+별도, 3년치) |
| `fnlttSinglAcntAll.json` | 전체 재무제표 (상세) | JSON (213항목) |
| `alotMatter.json` | 배당 관련 사항 | JSON (배당금, 배당률, EPS, 3년치) |

**KRX (https://data-dbg.krx.co.kr/svc/apis/)**

| 엔드포인트 | 용도 | 응답 형태 |
|-----------|------|----------|
| `sto/stk_bydd_trd` | KOSPI 일별 시세 | JSON (946종목) |
| `sto/ksq_bydd_trd` | KOSDAQ 일별 시세 | JSON |
| `sto/stk_isu_base_info` | KOSPI 종목기본정보 | JSON (946종목) |
| `sto/ksq_isu_base_info` | KOSDAQ 종목기본정보 | JSON |
| `idx/kospi_dd_trd` | KOSPI 지수 시세 | JSON (51개 지수) |
| `idx/kosdaq_dd_trd` | KOSDAQ 지수 시세 | JSON |
| `idx/krx_dd_trd` | KRX 지수 시세 | JSON |

---

## 2. API 응답 → DB 매핑

### 2.1 companies 테이블

```
소스 1: DART corpCode.xml (전종목 마스터)
─────────────────────────────────────────
XML 필드          → DB 컬럼           비고
corp_code         → corp_code         DART 고유코드 (8자리)
corp_name         → name_ko           한글 기업명
stock_code        → stock_code        종목코드 (6자리), 빈값이면 비상장
                  → is_listed         stock_code 유무로 판단

소스 2: DART company.json (기업 상세, 종목별 개별 호출)
─────────────────────────────────────────
JSON 필드         → DB 컬럼           비고
corp_name_eng     → name_en           영문명
stock_name        → stock_name        종목 약칭 (≠ 법인명)
corp_cls          → market            Y=유가증권, K=코스닥, N=코넥스, E=기타
ceo_nm            → ceo               대표이사
induty_code       → industry_code     업종코드
est_dt            → established_at    설립일 (YYYYMMDD)
acc_mt            → fiscal_month      결산월

소스 3: KRX stk_isu_base_info (종목기본정보, 일괄 조회)
─────────────────────────────────────────
JSON 필드         → DB 컬럼           비고
ISU_SRT_CD        → stock_code        종목코드 (매핑 키)
ISU_ABBRV         → stock_name        종목 약칭 (DART stock_name과 동일)
ISU_ENG_NM        → name_en           영문명 (DART 없으면 이걸로)
LIST_DD           → listed_at         상장일
PARVAL            → par_value         액면가
LIST_SHRS         → listed_shares     상장주식수
MKT_TP_NM         → market            KOSPI / KOSDAQ
KIND_STKCERT_TP_NM → stock_type       보통주 / 우선주
```

**수집 전략:**
1. DART `corpCode.xml` 다운로드 → 상장사 필터 → companies 테이블 초기 적재
2. KRX `stk_isu_base_info` + `ksq_isu_base_info` → 상장일, 액면가, 상장주식수 보강
3. DART `company.json` → 업종, 대표이사, 설립일 보강 (종목별 개별 호출, 3,970건)

### 2.2 financials 테이블

```
소스: DART fnlttSinglAcnt.json (주요 재무제표)
파라미터: corp_code, bsns_year, reprt_code, fs_div=CFS
─────────────────────────────────────────
account_nm (계정과목)    → DB 컬럼           sj_nm (재무제표 구분)
매출액                   → revenue           손익계산서
영업이익                 → operating_income   손익계산서
당기순이익(손실)          → net_income         손익계산서
자산총계                 → total_assets       재무상태표
부채총계                 → total_debt         재무상태표
자본총계                 → total_equity       재무상태표
유동자산                 → current_assets     재무상태표
유동부채                 → current_liabilities 재무상태표

응답 특징:
- thstrm_amount = 당기, frmtrm_amount = 전기, bfefrmtrm_amount = 전전기
- 금액 문자열에 콤마 포함 ("300,870,903,000,000") → 파싱 필요
- fs_div: CFS=연결, OFS=별도 → CFS 우선, 없으면 OFS
```

```
소스: DART alotMatter.json (배당)
─────────────────────────────────────────
se (항목명)              → DB 컬럼
주당 현금배당금(원)       → dividend_per_share   stock_knd=보통주 필터
현금배당수익률(%)         → dividend_yield       stock_knd=보통주 필터
(연결)현금배당성향(%)     → payout_ratio
(연결)주당순이익(원)      → eps
```

**직접 계산이 필요한 지표:**

```
PER = 현재 주가 / EPS
PBR = 현재 주가 / BPS
ROE = 당기순이익 / 자본총계 × 100
ROA = 당기순이익 / 자산총계 × 100
부채비율 = 부채총계 / 자본총계 × 100
영업이익률 = 영업이익 / 매출액 × 100
순이익률 = 당기순이익 / 매출액 × 100
BPS = 자본총계 / 상장주식수
EPS = 당기순이익 / 상장주식수 (DART에서 제공하므로 검증용)
매출 성장률 = (당기 매출 - 전기 매출) / 전기 매출 × 100
```

### 2.3 daily_prices 테이블

```
소스: KRX stk_bydd_trd (KOSPI) + ksq_bydd_trd (KOSDAQ)
파라미터: basDd (기준일자, YYYYMMDD)
─────────────────────────────────────────
JSON 필드         → DB 컬럼           비고
BAS_DD            → date              기준일 (YYYYMMDD)
ISU_CD            → stock_code        종목코드 (6자리)
ISU_NM            → (JOIN용)          종목명
TDD_CLSPRC        → close             종가
TDD_OPNPRC        → open              시가
TDD_HGPRC         → high              고가
TDD_LWPRC         → low               저가
CMPPREVDD_PRC     → change            전일대비 (부호 포함)
FLUC_RT           → change_pct        등락률 (%)
ACC_TRDVOL        → volume            거래량
ACC_TRDVAL        → trade_value       거래대금
MKTCAP            → market_cap        시가총액
LIST_SHRS         → (companies 참조)  상장주식수

응답 특징:
- 전종목 일괄 조회 (basDd 하나로 KOSPI 946종목)
- 숫자가 문자열 → 파싱 필요
- 주말/공휴일은 데이터 없음
```

### 2.4 index_prices 테이블 (신규)

```
소스: KRX kospi_dd_trd + kosdaq_dd_trd + krx_dd_trd
─────────────────────────────────────────
JSON 필드         → DB 컬럼
BAS_DD            → date
IDX_NM            → index_name        "코스피", "코스피 200" 등
CLSPRC_IDX        → close             종가 지수
CMPPREVDD_IDX     → change            전일대비
FLUC_RT           → change_pct        등락률
OPNPRC_IDX        → open
HGPRC_IDX         → high
LWPRC_IDX         → low
ACC_TRDVOL        → volume
ACC_TRDVAL        → trade_value
MKTCAP            → market_cap        시장 총 시가총액
```

---

## 3. DB 스키마 (확정)

```sql
-- 기업 마스터
CREATE TABLE companies (
  corp_code       VARCHAR(8) PRIMARY KEY,     -- DART 고유코드
  stock_code      VARCHAR(6) UNIQUE NOT NULL,  -- 종목코드
  name_ko         TEXT NOT NULL,               -- 한글 법인명
  name_en         TEXT,                        -- 영문명
  stock_name      TEXT,                        -- 종목 약칭
  market          VARCHAR(10) NOT NULL,        -- KOSPI / KOSDAQ
  stock_type      VARCHAR(10) DEFAULT '보통주', -- 보통주 / 우선주
  industry_code   VARCHAR(10),                 -- 업종코드
  industry_name   TEXT,                        -- 업종명
  ceo             TEXT,                        -- 대표이사
  established_at  DATE,                        -- 설립일
  listed_at       DATE,                        -- 상장일
  fiscal_month    SMALLINT DEFAULT 12,         -- 결산월
  par_value       INTEGER,                     -- 액면가
  listed_shares   BIGINT,                      -- 상장주식수
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 재무제표
CREATE TABLE financials (
  id              SERIAL PRIMARY KEY,
  corp_code       VARCHAR(8) REFERENCES companies(corp_code),
  fiscal_year     SMALLINT NOT NULL,           -- 2024, 2023 등
  quarter         SMALLINT,                    -- NULL=연간, 1~4=분기
  fs_div          VARCHAR(3) NOT NULL,         -- CFS=연결, OFS=별도
  -- 손익계산서
  revenue         BIGINT,                      -- 매출액
  operating_income BIGINT,                     -- 영업이익
  net_income      BIGINT,                      -- 당기순이익
  -- 재무상태표
  total_assets    BIGINT,                      -- 자산총계
  total_debt      BIGINT,                      -- 부채총계
  total_equity    BIGINT,                      -- 자본총계
  current_assets  BIGINT,                      -- 유동자산
  current_liabilities BIGINT,                  -- 유동부채
  -- 주당 지표
  eps             INTEGER,                     -- 주당순이익
  bps             INTEGER,                     -- 주당순자산 (계산)
  -- 배당
  dividend_per_share INTEGER,                  -- 주당배당금
  dividend_yield  NUMERIC(5,2),                -- 배당수익률 (%)
  payout_ratio    NUMERIC(5,2),                -- 배당성향 (%)
  -- 계산 지표 (daily_prices 조인 시점에 계산)
  roe             NUMERIC(7,2),                -- ROE (%)
  roa             NUMERIC(7,2),                -- ROA (%)
  operating_margin NUMERIC(7,2),               -- 영업이익률 (%)
  net_margin      NUMERIC(7,2),                -- 순이익률 (%)
  debt_ratio      NUMERIC(7,2),                -- 부채비율 (%)
  revenue_growth  NUMERIC(7,2),                -- 매출성장률 (%)
  --
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (corp_code, fiscal_year, quarter, fs_div)
);

-- 일별 시세
CREATE TABLE daily_prices (
  stock_code      VARCHAR(6) NOT NULL,
  date            DATE NOT NULL,
  open            INTEGER,
  high            INTEGER,
  low             INTEGER,
  close           INTEGER NOT NULL,
  change          INTEGER,                     -- 전일대비
  change_pct      NUMERIC(7,2),                -- 등락률 (%)
  volume          BIGINT,                      -- 거래량
  trade_value     BIGINT,                      -- 거래대금
  market_cap      BIGINT,                      -- 시가총액
  PRIMARY KEY (stock_code, date)
);

-- 지수 시세
CREATE TABLE index_prices (
  index_name      TEXT NOT NULL,
  date            DATE NOT NULL,
  open            NUMERIC(10,2),
  high            NUMERIC(10,2),
  low             NUMERIC(10,2),
  close           NUMERIC(10,2) NOT NULL,
  change          NUMERIC(10,2),
  change_pct      NUMERIC(7,2),
  volume          BIGINT,
  trade_value     BIGINT,
  market_cap      BIGINT,
  PRIMARY KEY (index_name, date)
);

-- 공시
CREATE TABLE disclosures (
  rcept_no        VARCHAR(20) PRIMARY KEY,     -- 접수번호
  corp_code       VARCHAR(8) REFERENCES companies(corp_code),
  title           TEXT NOT NULL,
  filed_at        DATE NOT NULL,
  report_url      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 사용자 데이터 (Supabase Auth 연동) ──

-- portfolios
CREATE TABLE portfolios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '내 포트폴리오',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 보유 종목
CREATE TABLE holdings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_code      VARCHAR(6) NOT NULL,
  quantity        INTEGER NOT NULL,
  avg_price       INTEGER NOT NULL,            -- 매입 평균가
  bought_at       DATE,
  memo            TEXT,
  UNIQUE (portfolio_id, stock_code)
);

-- 매매 이력
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_code      VARCHAR(6) NOT NULL,
  type            VARCHAR(4) NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity        INTEGER NOT NULL,
  price           INTEGER NOT NULL,
  fee             INTEGER DEFAULT 0,
  tax             INTEGER DEFAULT 0,
  transacted_at   DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolios"
  ON portfolios FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own holdings"
  ON holdings FOR ALL USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())
  );

-- 인덱스
CREATE INDEX idx_daily_prices_date ON daily_prices(date);
CREATE INDEX idx_daily_prices_stock ON daily_prices(stock_code);
CREATE INDEX idx_financials_corp ON financials(corp_code);
CREATE INDEX idx_financials_year ON financials(fiscal_year);
CREATE INDEX idx_disclosures_corp ON disclosures(corp_code);
CREATE INDEX idx_disclosures_date ON disclosures(filed_at);
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
```

---

## 4. 수집 파이프라인

### 4.1 초기 수집 (1회성)

```
Step 1: 기업 마스터 구축
────────────────────────────────────────────
  1-a. DART corpCode.xml 다운로드 → 상장사 3,970개 필터
  1-b. KRX stk_isu_base_info + ksq_isu_base_info → 상장일, 액면가 보강
  1-c. DART company.json × 3,970건 → 업종, CEO 등 보강
       (일 10,000건 제한 → 1일 내 완료 가능)

  예상 API 호출: ~4,000건 (DART company × 3,970 + KRX 2건)
  예상 소요: 4~5분 (분당 1,000건 제한 기준)

Step 2: 재무제표 수집 (5년치)
────────────────────────────────────────────
  2-a. DART fnlttSinglAcnt.json
       파라미터: bsns_year=2020~2024, reprt_code=11011(사업보고서)
       종목 3,970 × 5년 = 19,850건
       → 일 10,000건 제한 → 2일 소요

  2-b. DART alotMatter.json (배당)
       동일 파라미터
       19,850건 → 2일 소요

  총 예상: 4~5일 (DART 일일 한도 분산)

Step 3: 일봉 수집 (1년치)
────────────────────────────────────────────
  3-a. KRX stk_bydd_trd + ksq_bydd_trd
       1일 = 2건 (KOSPI + KOSDAQ 전종목 일괄)
       1년 (약 250 거래일) × 2 = 500건
       → 1일 내 완료

  총 예상: 1시간 이내
```

### 4.2 일일 배치 (매일 반복)

```
장마감 후 (18:00 KST) — GitHub Actions cron

Job 1: 일봉 갱신 (KRX)
  - stk_bydd_trd (KOSPI 전종목)     → daily_prices UPSERT
  - ksq_bydd_trd (KOSDAQ 전종목)    → daily_prices UPSERT
  - kospi_dd_trd (KOSPI 지수)       → index_prices UPSERT
  - kosdaq_dd_trd (KOSDAQ 지수)     → index_prices UPSERT
  - krx_dd_trd (KRX 지수)          → index_prices UPSERT
  API 호출: 5건
  예상 소요: 30초

Job 2: 시가총액 기반 지표 갱신
  - daily_prices.market_cap + financials → PER, PBR 계산
  예상 소요: DB 쿼리, 10초

총 일일 API 사용: ~5건 (일 10,000건 한도 대비 0.05%)
```

### 4.3 분기 배치 (분기별)

```
실적 발표 시즌 후 (3월, 5월, 8월, 11월)

Job: 재무제표 갱신 (DART)
  - fnlttSinglAcnt.json × 3,970종목  → financials UPSERT
  - alotMatter.json × 3,970종목      → financials 배당 UPSERT
  API 호출: ~8,000건 (1일 내 완료)
```

### 4.4 월간 배치

```
Job: 종목 마스터 갱신
  - DART corpCode.xml → 신규 상장/상장폐지 반영
  - KRX 종목기본정보 → 상장주식수 변경 반영
  API 호출: ~5건
```

---

## 5. 수집기 모듈 설계

### 5.1 디렉토리 구조

```
src/
├── pipeline/
│   ├── clients/
│   │   ├── dart-client.ts        ← DART API 클라이언트
│   │   └── krx-client.ts         ← KRX API 클라이언트
│   ├── collectors/
│   │   ├── company-collector.ts  ← 기업 마스터 수집
│   │   ├── financial-collector.ts ← 재무제표 수집
│   │   ├── price-collector.ts    ← 일봉/지수 수집
│   │   └── dividend-collector.ts ← 배당 수집
│   ├── parsers/
│   │   ├── dart-parser.ts        ← DART 응답 파싱 (콤마 제거, 타입 변환)
│   │   └── krx-parser.ts         ← KRX 응답 파싱
│   ├── jobs/
│   │   ├── initial-seed.ts       ← 초기 수집 (1회성)
│   │   ├── daily-update.ts       ← 일일 배치
│   │   └── quarterly-update.ts   ← 분기 배치
│   └── db.ts                     ← Supabase 클라이언트
```

### 5.2 DART 클라이언트

```typescript
// 핵심 인터페이스
interface DartClient {
  // 기업코드 목록 (ZIP → XML 파싱)
  fetchCorpCodes(): Promise<DartCorp[]>

  // 기업 상세
  fetchCompany(corpCode: string): Promise<DartCompany>

  // 주요 재무제표
  fetchFinancials(corpCode: string, year: number): Promise<DartFinancial[]>

  // 배당
  fetchDividend(corpCode: string, year: number): Promise<DartDividend>
}

// Rate limiting: 분당 1,000건, 일 10,000건
// 에러 시 재시도: 3회, 지수 백오프 (1s, 2s, 4s)
```

### 5.3 KRX 클라이언트

```typescript
interface KrxClient {
  // KOSPI 일별 시세 (전종목 일괄)
  fetchKospiDaily(date: string): Promise<KrxDailyPrice[]>

  // KOSDAQ 일별 시세
  fetchKosdaqDaily(date: string): Promise<KrxDailyPrice[]>

  // 종목기본정보
  fetchKospiStocks(date: string): Promise<KrxStockInfo[]>
  fetchKosdaqStocks(date: string): Promise<KrxStockInfo[]>

  // 지수 시세
  fetchKospiIndex(date: string): Promise<KrxIndexPrice[]>
  fetchKosdaqIndex(date: string): Promise<KrxIndexPrice[]>
}

// 인증: 헤더 AUTH_KEY
// Rate limiting: 일 10,000건
```

### 5.4 파싱 규칙

```typescript
// DART 금액 파싱
// "300,870,903,000,000" → 300870903000000
// "-7,797,243,000,000" → -7797243000000
// "" 또는 "-" → null
function parseDartAmount(value: string): number | null {
  if (!value || value === '-') return null;
  return Number(value.replace(/,/g, ''));
}

// KRX 숫자 파싱
// "4285" → 4285
// "-90" → -90
// "-2.06" → -2.06
function parseKrxNumber(value: string): number | null {
  if (!value || value === '' || value === '-') return null;
  return Number(value);
}

// DART reprt_code (보고서 유형)
// 11013 = 1분기, 11012 = 반기, 11014 = 3분기, 11011 = 사업보고서(연간)
```

---

## 6. 에러 처리 & 모니터링

### 6.1 에러 처리 전략

| 에러 유형 | 대응 |
|----------|------|
| Rate limit (429/분당 초과) | 60초 대기 후 재시도 |
| 일일 한도 초과 | 다음날 이어서 수집 (progress 기록) |
| 네트워크 에러 | 3회 재시도 (1s, 2s, 4s 백오프) |
| 빈 응답 (비상장, 데이터 없음) | 스킵, 로그 기록 |
| 파싱 에러 (예상 외 형식) | 스킵, 로그 기록, 수동 확인 |

### 6.2 진행률 추적

```typescript
// 초기 수집 시 중단/재개를 위한 진행률 기록
interface SeedProgress {
  step: 'companies' | 'financials' | 'dividends' | 'prices';
  total: number;
  completed: number;
  lastCorpCode: string;     // 마지막 처리된 기업코드
  lastYear: number;         // 마지막 처리된 연도
  updatedAt: string;
}
// data/seed-progress.json에 저장
```

### 6.3 일일 배치 로그

```
GitHub Actions 실행 시 콘솔 로그:
  [2026-06-19 18:05:00] Daily update started
  [2026-06-19 18:05:01] KOSPI prices: 946 stocks updated
  [2026-06-19 18:05:02] KOSDAQ prices: 1,724 stocks updated
  [2026-06-19 18:05:03] Index prices: 51 KOSPI + 42 KOSDAQ updated
  [2026-06-19 18:05:05] Derived metrics recalculated
  [2026-06-19 18:05:05] Daily update completed (5s)
```

---

## 7. 데이터 용량 추정

| 테이블 | 레코드 수 (1년) | 예상 크기 |
|--------|----------------|----------|
| companies | ~3,970 | < 1 MB |
| financials | ~3,970 × 5년 × 2(연결+별도) = ~40,000 | ~5 MB |
| daily_prices | ~2,700종목 × 250일 = ~675,000 | ~50 MB |
| index_prices | ~100지수 × 250일 = ~25,000 | < 1 MB |
| disclosures | Phase 2 | - |
| **총합** | | **~57 MB** |

Supabase 무료 티어 500MB 대비 충분한 여유.

---

## 8. 구현 우선순위

```
Week 1 (Day 1~3): 클라이언트 + 파서
  ├── dart-client.ts + dart-parser.ts
  ├── krx-client.ts + krx-parser.ts
  └── 단위 테스트 (실제 API 호출 확인)

Week 1 (Day 4~5): DB + 초기 수집
  ├── Supabase 프로젝트 생성
  ├── 스키마 마이그레이션 실행
  └── initial-seed.ts 실행 (companies → financials → prices)

Week 2: 일일 배치 + 검증
  ├── daily-update.ts
  ├── GitHub Actions cron 설정
  └── 데이터 정합성 검증 (네이버 금융과 대조)
```
