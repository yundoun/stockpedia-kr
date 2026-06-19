# Stockpedia KR — 프로젝트 청사진

> 작성일: 2026-06-19
> 상태: Phase 0 기획

---

## 1. Lean Canvas

### Problem (해결할 문제)

1. **한국 주식 분석 도구가 없다** — Stock Analysis, Simply Wall St 같은 깔끔한 종목 분석 플랫폼이 한국 시장에 없음
2. **네이버 금융은 분석이 아니라 나열** — 재무제표를 보여주지만 시각화, 스크리닝, 비교 기능 없음
3. **데이터는 공개인데 접근이 어렵다** — DART, KRX 데이터는 무료지만 API가 파편화되어 있고 raw 상태로 제공

### Customer Segment (타깃 사용자)

| 세그먼트 | 특징 | 핵심 니즈 |
|---------|------|----------|
| **P1: 개인 투자자** | 2030 직장인, 주식 직접투자 | "이 종목 PER/PBR 추이 보고 싶어" |
| **P2: 가치투자자** | 재무제표 기반 종목 발굴 | "PER 10 이하, ROE 15% 이상 종목 찾아줘" |
| **P3: 배당 투자자** | 배당 수익 중심 투자 | "배당률 4% 이상, 5년 연속 증가 종목" |

### Unique Value Proposition

**"한국 주식의 Stock Analysis"**

네이버 금융 = 정보 나열
Stockpedia KR = 정보 분석 + 시각화 + 스크리닝

### Solution

1. **종목 분석 페이지** — 재무제표 시각화, 밸류에이션, 배당 이력, 공시
2. **스크리너** — 재무 지표 필터로 종목 발굴
3. **시장 개요** — KOSPI/KOSDAQ 등락, 업종별 히트맵, 시장 지표

### Revenue Model

| 단계 | 모델 | 타이밍 |
|------|------|--------|
| Phase 1 | 무료 (트래픽 확보) | 0~6개월 |
| Phase 2 | 광고 (Google AdSense) | 트래픽 일 1,000+ |
| Phase 3 | 프리미엄 ($5~8/월) | 유저 기반 확보 후 |

프리미엄 후보 기능: 장기 재무 데이터 (10년+), 데이터 내보내기, 실시간 시세, 포트폴리오 트래커

### Channels

| 채널 | 전략 |
|------|------|
| SEO | "삼성전자 PER", "KOSPI 시가총액 순위" 등 검색 유입 |
| 커뮤니티 | 디시 주갤, 클리앙, 뽐뿌 재테크 |
| SNS | 트위터/X 한국 주식 커뮤니티 |

### Key Metrics

| 지표 | 의미 | 목표 (3개월) |
|------|------|-------------|
| DAU | 일간 활성 사용자 | 500+ |
| 페이지뷰/세션 | 탐색 깊이 | 3+ |
| 검색 유입 | SEO 성과 | 일 300+ |
| 종목 커버리지 | 데이터 완성도 | KOSPI+KOSDAQ 전종목 |

### Unfair Advantage

- 한국 시장 특화 (세금, 제도, 원화 기준)
- DART/KRX 공개 데이터 활용 (라이선스 비용 0)
- 기존 프로젝트에서 검증된 Next.js + 검색 + 배포 파이프라인

---

## 2. 경쟁 분석

### Stock Analysis (벤치마크)

| 항목 | 내용 |
|------|------|
| 커버리지 | 130,000+ 종목 (미국 중심, 글로벌) |
| 수익 모델 | Free (광고) + Pro $79/yr + Unlimited $199/yr |
| 핵심 기능 | 스크리너 (299 필터), 재무제표 (40년), 실시간 시세, IPO 캘린더 |
| 데이터 소스 | S&P Global, Cboe, Benzinga, Finnhub |
| 기술 스택 | ASP.NET, Vercel, Cloudflare |
| UX 특징 | 깔끔, 광고 최소, 소셜 기능 없음, 순수 리서치 도구 |

### 한국 경쟁 현황

| 서비스 | 강점 | 약점 |
|--------|------|------|
| 네이버 금융 | 트래픽 압도적, 뉴스 통합 | 분석 도구 없음, UI 구식 |
| 증권사 MTS | 실시간 시세, 매매 | 자사 계좌만, 분석 빈약 |
| 알파스퀘어 | 스크리너 있음 | UI/UX 구식, 느림 |
| 컴퍼니가이드 | 기관용 상세 데이터 | B2B, 개인에겐 과도 |
| FnGuide | 전문 재무 데이터 | 유료, 기관 타깃 |

### 포지셔닝

```
           무료 ─────────────────────── 유료
            │                           │
   네이버 금융  ●                       │
   (나열, UI 구식)                      │
            │                           │
            │     ★ Stockpedia KR       │
            │     (분석, 시각화, 깔끔)   │
            │                           │
   알파스퀘어 ●                    ●  FnGuide
   (기능은 있지만 UX↓)          (기관 전용)
            │                           │
           단순 ─────────────────────── 전문
```

---

## 3. 데이터 아키텍처

### 3.1 데이터 소스

| 데이터 | 소스 | 비용 | 제한 |
|--------|------|------|------|
| 재무제표 (연간/분기) | DART OpenAPI | 무료 | 10,000 req/일 |
| 공시 (보고서) | DART OpenAPI | 무료 | 10,000 req/일 |
| 주가 (일봉) | KRX 정보데이터 | 무료 | 등록 필요 |
| 주가 (실시간) | 한국투자증권 API | 무료 (계좌 필요) | 초당 제한 |
| 종목 기본정보 | KRX | 무료 | - |
| 배당 이력 | DART + KRX | 무료 | - |
| 업종 분류 | KRX | 무료 | - |
| 환율/금리 | ECOS (한국은행) | 무료 | - |

### 3.2 데이터 파이프라인

```
[DART API] ──→ ┐
[KRX API]  ──→ ├──→ [데이터 수집기] ──→ [DB] ──→ [API 서버] ──→ [프론트엔드]
[ECOS API] ──→ ┘     (일 1회 배치)     (PostgreSQL)   (Next.js API Routes)
```

### 3.3 데이터 갱신 주기

| 데이터 | 갱신 주기 | 방법 |
|--------|----------|------|
| 재무제표 | 분기 1회 (실적 발표 후) | DART 배치 |
| 주가 (종가) | 매일 장마감 후 | KRX 배치 |
| 공시 | 실시간~일 1회 | DART 폴링 |
| 종목 목록 | 월 1회 | KRX |
| 환율/금리 | 일 1회 | ECOS |

### 3.4 DB 스키마 (핵심 테이블)

```
companies
  ├── corp_code (DART 고유코드)
  ├── stock_code (종목코드, 6자리)
  ├── name_ko, name_en
  ├── market (KOSPI / KOSDAQ)
  ├── sector, industry
  ├── listing_date
  └── market_cap

financials (연간/분기 재무제표)
  ├── corp_code
  ├── period (2024Q4, 2025Q1 등)
  ├── report_type (annual / quarterly)
  ├── revenue, operating_income, net_income
  ├── total_assets, total_equity, total_debt
  ├── eps, bps, per, pbr, roe, roa
  └── dividend_per_share, dividend_yield

daily_prices
  ├── stock_code
  ├── date
  ├── open, high, low, close
  ├── volume, market_cap
  └── change_pct

disclosures (공시)
  ├── corp_code
  ├── rcept_no (접수번호)
  ├── title
  ├── filed_at
  └── report_url
```

---

## 4. 기능 명세 (Phase 1 — MVP)

### 4.1 핵심 페이지

```
stockpedia-kr/
├── / (홈)                        ← 시장 개요 + 검색
├── /stocks                       ← 전종목 리스트
├── /stocks/[ticker]              ← 종목 상세 (아래 탭)
│   ├── /overview                 ← 가격, 차트, 핵심 지표
│   ├── /financials               ← 재무제표 (시각화)
│   ├── /valuation                ← PER/PBR/ROE 추이
│   ├── /dividend                 ← 배당 이력
│   └── /disclosure               ← 공시 목록
├── /screener                     ← 스크리너 (필터 검색)
└── /market                       ← KOSPI/KOSDAQ 현황
```

### 4.2 종목 상세 페이지 (/stocks/[ticker])

**Overview 탭:**
- 현재가, 전일대비, 등락률
- 52주 최고/최저
- 시가총액, 거래량
- 핵심 지표 카드: PER, PBR, ROE, 배당률
- 가격 차트 (1M / 3M / 1Y / 3Y / 5Y)
- 기업 개요 (업종, 상장일, 종업원수)

**Financials 탭:**
- 매출, 영업이익, 순이익 — 연간 바 차트 (5년)
- 자산, 부채, 자본 — 스택 차트
- 수익성 지표: 영업이익률, 순이익률, ROE 트렌드
- 테이블 뷰 (연간/분기 토글)

**Valuation 탭:**
- PER / PBR 밴드 차트 (5년)
- 동종업종 비교 테이블
- EPS 성장률 추이

**Dividend 탭:**
- 연간 배당금, 배당률 추이
- 배당 성향 (Payout Ratio)
- 배당 달력

**Disclosure 탭:**
- 최근 공시 리스트 (DART 링크)
- 공시 유형 필터

### 4.3 스크리너 (/screener)

**Phase 1 필터 (20개):**

| 카테고리 | 필터 |
|----------|------|
| 시장 | KOSPI / KOSDAQ |
| 업종 | KRX 업종 분류 |
| 시가총액 | min~max |
| 가격 | 현재가 범위 |
| 밸류에이션 | PER, PBR |
| 수익성 | ROE, ROA, 영업이익률 |
| 성장성 | 매출 성장률, 이익 성장률 |
| 배당 | 배당률, 배당성향 |
| 재무 안정성 | 부채비율 |

**결과 테이블:**
- 정렬 가능 (시총, PER, ROE 등)
- 페이지네이션
- 종목 클릭 → 상세 페이지 이동

### 4.4 시장 개요 (/market)

- KOSPI / KOSDAQ 지수 + 차트
- 업종별 등락 히트맵
- 시가총액 TOP 20
- 상승/하락 종목
- 거래대금 상위

---

## 5. 기술 스택

### 5.1 선정 기준

| 기준 | 결정 |
|------|------|
| 언어 | TypeScript (풀스택) |
| SEO | SSR/SSG 필수 (검색 유입이 핵심 채널) |
| 비용 | 최소화 (개인 프로젝트) |
| 배포 | Vercel (프론트) + 별도 DB |

### 5.2 스택

```
프론트엔드:
  Next.js 16 (App Router, SSR/SSG)
  Tailwind CSS 4
  shadcn/ui
  Recharts 또는 Lightweight Charts (차트)

백엔드:
  Next.js API Routes (or Route Handlers)
  PostgreSQL (Supabase 또는 Neon — 무료 티어)

데이터 수집:
  Node.js 스크립트 (cron)
  DART OpenAPI 클라이언트
  KRX 데이터 파서

배포:
  Vercel (프론트 + API)
  Supabase / Neon (DB)
  GitHub Actions (데이터 수집 cron)
```

### 5.3 왜 이 스택인가

- **Next.js SSG**: 종목 페이지를 정적 생성 → SEO 최적화 + CDN 캐시 → 서버 비용 0에 수렴
- **PostgreSQL**: 재무 데이터는 관계형이 자연스러움 (종목 → 재무제표 → 일봉)
- **Supabase 무료 티어**: 500MB DB, 충분 (KOSPI+KOSDAQ 전종목 재무 5년 < 100MB)
- **GitHub Actions**: 일배치 cron 무료 (월 2,000분)

---

## 6. SEO 전략

### 6.1 타깃 키워드

| 키워드 유형 | 예시 | 월간 검색량 (추정) |
|------------|------|------------------|
| 종목 + 지표 | "삼성전자 PER" | 5,000+ |
| 종목 + 재무 | "카카오 영업이익" | 2,000+ |
| 스크리닝 | "고배당주 추천" | 10,000+ |
| 비교 | "KOSPI 시가총액 순위" | 8,000+ |
| 시장 | "코스피 지수" | 50,000+ |

### 6.2 페이지 SEO 설계

```
/stocks/005930 → title: "삼성전자 (005930) 주가, 재무제표, 밸류에이션 | Stockpedia KR"
/stocks/005930/financials → title: "삼성전자 재무제표 — 매출, 영업이익, 순이익 (5년) | Stockpedia KR"
/screener → title: "한국 주식 스크리너 — PER, ROE, 배당률로 종목 찾기 | Stockpedia KR"
```

### 6.3 SSG + ISR 전략

- 종목 페이지: ISR (1일 재검증) — 장마감 후 데이터 갱신
- 스크리너: SSR (실시간 필터)
- 시장 개요: ISR (1시간 재검증)

---

## 7. Roadmap

### Phase 1: MVP (4~6주)

```
Week 1-2: 데이터 파이프라인
  - [ ] DART API 클라이언트 (TypeScript)
  - [ ] KRX 데이터 수집기
  - [ ] DB 스키마 + 마이그레이션
  - [ ] 전종목 기본정보 수집 (KOSPI + KOSDAQ)
  - [ ] 재무제표 수집 (최근 5년)
  - [ ] 일봉 데이터 수집 (최근 1년)

Week 3-4: 프론트엔드 코어
  - [ ] Next.js 프로젝트 셋업
  - [ ] 종목 상세 페이지 (overview + financials)
  - [ ] 재무제표 차트 (매출/이익 바차트, 수익성 라인차트)
  - [ ] 가격 차트
  - [ ] 글로벌 종목 검색

Week 5-6: 스크리너 + 시장
  - [ ] 스크리너 페이지 (기본 필터 10개)
  - [ ] 시장 개요 페이지
  - [ ] SEO 메타태그 + sitemap
  - [ ] Vercel 배포
  - [ ] 데이터 갱신 cron (GitHub Actions)
```

### Phase 2: 확장 (이후)
- 스크리너 필터 확대 (20개+)
- 밸류에이션 밴드 차트
- 배당 상세 페이지
- 공시 연동
- 업종 비교 기능
- 다크 모드

### Phase 3: 수익화 (이후)
- 광고 삽입
- 포트폴리오 트래커
- 프리미엄 플랜 (장기 데이터, 내보내기)
- AI 분석 (이때 RAG 재활용 가능)

---

## 8. 리스크 & 미결정 사항

### 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| DART API 일 10,000건 제한 | 전종목 재무제표 초기 수집 시 며칠 소요 | 배치 분산, 캐시 활용 |
| KRX 데이터 접근 변경 | 주가 데이터 소스 차단 가능 | 대체 소스 확보 (한투 API) |
| 실시간 시세 제공 어려움 | UX 제한 | Phase 1에서는 종가 기준, 실시간은 Phase 2+ |
| 한국 주식 데이터 라이브러리가 Python | TS 래핑 필요 | DART/KRX REST API 직접 호출 |

### 미결정 사항

1. **DB 선택**: Supabase vs Neon vs PlanetScale?
2. **차트 라이브러리**: Recharts vs Lightweight Charts vs Chart.js?
3. **종목 코드 URL 형식**: `/stocks/005930` vs `/stocks/samsung-electronics`?
4. **영어 지원**: 한국어 전용 vs 한/영?
5. **모바일 대응**: 반응형 vs 별도 모바일?

---

## 참고 자료

- [Stock Analysis](https://stockanalysis.com) — 벤치마크
- [DART OpenAPI](https://opendart.fss.or.kr) — 재무제표/공시 데이터
- [KRX 정보데이터](https://data.krx.co.kr) — 시세/종목 데이터
- [한국투자증권 Open API](https://github.com/koreainvestment/open-trading-api) — 실시간 시세
- [ECOS 한국은행](https://ecos.bok.or.kr) — 거시경제 데이터
