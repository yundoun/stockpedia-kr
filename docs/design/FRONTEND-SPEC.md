# Stockpedia KR — 프론트엔드 디자인 & 아키텍처 스펙

> 작성일: 2026-06-19
> 디자인 키워드: 따뜻한 데이터, 읽기 쉬운 금융

---

## 1. 디자인 원칙

### 1.1 기준: "40대 부모님이 설명 없이 쓸 수 있는가?"

| 원칙 | 의미 | 구체적 기준 |
|------|------|-----------|
| **읽기 쉬움** | 숫자가 크고, 여백이 넉넉하다 | 본문 16px, 핵심 숫자 24~32px |
| **한 눈에 파악** | 색상으로 상승/하락 즉시 구분 | 빨강=상승, 파랑=하락 (한국 관례) |
| **동작 최소화** | 클릭 한번에 원하는 정보 | 모달/팝업 지양, 페이지 전환 선호 |
| **따뜻한 톤** | 차가운 금융 느낌이 아닌 신뢰감 | 웜 화이트 배경, 라운드 카드 |
| **의미 있는 움직임** | 장식 애니메이션 없음 | 숫자 카운트업, 차트 드로인만 |

### 1.2 레퍼런스 기반 의사결정

```
Stock Analysis에서 가져갈 것:
  ✓ 종목 헤더 (이름 + 가격 + 등락)
  ✓ 탭 네비게이션 (Overview / Financials / Dividend)
  ✓ 재무 테이블 포맷 (연간/분기 토글)
  ✗ 광고 배너, 빽빽한 여백, 차가운 톤

Toss에서 가져갈 것:
  ✓ 큰 숫자 + 넉넉한 여백
  ✓ 카드형 UI (border-radius: 16px)
  ✓ 한글 숫자 표기 (3,495억 원)
  ✓ 부드러운 마이크로 인터랙션
  ✗ 모바일 퍼스트 (우리는 데스크톱 퍼스트)

Naver Finance에서 피할 것:
  ✗ iframe 기반 레이아웃
  ✗ 12px 작은 글씨
  ✗ 빽빽한 테이블
  ✗ 2000년대 디자인
```

---

## 2. 디자인 토큰

### 2.1 컬러

```css
/* ── 브랜드 ── */
--primary:        #1E293B;   /* 슬레이트 900 — 헤더, 강조 텍스트 */
--primary-light:  #334155;   /* 슬레이트 700 */
--accent:         #0F766E;   /* 틸 700 — CTA 버튼, 링크 */
--accent-light:   #14B8A6;   /* 틸 500 — 호버 */

/* ── 상승/하락 (한국 관례) ── */
--up:             #DC2626;   /* 빨강 600 — 상승 */
--up-bg:          #FEF2F2;   /* 빨강 50 — 상승 배경 */
--down:           #2563EB;   /* 파랑 600 — 하락 */
--down-bg:        #EFF6FF;   /* 파랑 50 — 하락 배경 */
--flat:           #6B7280;   /* 그레이 500 — 보합 */

/* ── 배경 ── */
--bg-body:        #FAFAF9;   /* 스톤 50 — 웜 화이트 */
--bg-card:        #FFFFFF;   /* 카드 배경 */
--bg-hover:       #F5F5F4;   /* 스톤 100 — 호버 */
--bg-muted:       #E7E5E4;   /* 스톤 200 — 구분선, 비활성 */

/* ── 텍스트 ── */
--text-primary:   #1C1917;   /* 스톤 900 — 본문 */
--text-secondary: #78716C;   /* 스톤 500 — 보조 텍스트 */
--text-muted:     #A8A29E;   /* 스톤 400 — 비활성 */

/* ── 보더 ── */
--border:         #E7E5E4;   /* 스톤 200 */
--border-focus:   #0F766E;   /* 틸 700 — 포커스 링 */
```

### 2.2 타이포그래피

```
폰트: Pretendard Variable (한글) + Inter (영문/숫자)

사이즈 시스템:
  --text-xs:    12px / 16px    ← 레이블, 캡션
  --text-sm:    14px / 20px    ← 보조 텍스트, 테이블 셀
  --text-base:  16px / 24px    ← 본문 (최소 기준)
  --text-lg:    18px / 28px    ← 섹션 제목
  --text-xl:    20px / 28px    ← 카드 타이틀
  --text-2xl:   24px / 32px    ← 페이지 제목
  --text-3xl:   30px / 36px    ← 종목 현재가
  --text-4xl:   36px / 40px    ← 히어로 숫자

숫자 전용:
  font-variant-numeric: tabular-nums;  ← 숫자 정렬
  font-feature-settings: "tnum";
```

### 2.3 간격 & 라운딩

```
간격 (8px 기반):
  --space-1:  4px
  --space-2:  8px
  --space-3:  12px
  --space-4:  16px
  --space-6:  24px
  --space-8:  32px
  --space-12: 48px
  --space-16: 64px

라운딩:
  --radius-sm:  8px     ← 버튼, 입력
  --radius-md:  12px    ← 작은 카드, 뱃지
  --radius-lg:  16px    ← 메인 카드
  --radius-xl:  24px    ← 히어로 카드

그림자:
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
  --shadow-md:  0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)
```

### 2.4 숫자 포맷

```
주가:       349,500원        (원 단위, 콤마)
시가총액:    349.5조 원       (조/억/만 단위 자동)
등락률:     +4.61%           (부호 필수)
등락액:     +15,500원
재무:       30.1조 원        (매출, 이익 등)
PER:        12.5배
배당률:     2.70%
```

---

## 3. 핵심 컴포넌트

### 3.1 숫자 표시 (ChangeText)

```
상승:  +15,500 (+4.61%)    빨강 텍스트 + 빨강 배경 pill
하락:  -3,200 (-0.92%)     파랑 텍스트 + 파랑 배경 pill
보합:  0 (0.00%)           그레이
```

### 3.2 지표 카드 (MetricCard)

```
┌─────────────────────┐
│  PER            12.5배  │
│  ▪ 업종 평균 15.2배     │
└─────────────────────┘

- 라벨 (text-sm, secondary) + 값 (text-2xl, bold)
- 선택적: 비교 기준선 (업종 평균 등)
- border-radius: 16px, 배경 white, shadow-sm
```

### 3.3 재무 테이블 (FinancialTable)

```
                 2024      2023      2022      2021      2020
매출액           30.1조    25.9조    30.2조    27.9조    23.6조
영업이익          3.3조     0.7조     4.3조     5.2조     3.6조
순이익            3.4조     1.5조     5.6조     3.9조     2.6조

- 연간/분기 토글
- 호버 시 행 하이라이트
- 숫자 우측 정렬, tabular-nums
- 성장/감소 시 미묘한 색상 힌트
```

### 3.4 가격 차트 (PriceChart)

```
- Lightweight Charts (TradingView) 또는 Recharts
- 기간 선택: 1M / 3M / 1Y / 3Y / 5Y
- 드로인 애니메이션 (300ms ease-out)
- 툴팁: 날짜 + OHLCV
- 캔들 아닌 라인/에리어 (비전문가 친화)
```

### 3.5 종목 헤더 (StockHeader)

```
삼성전자  005930  KOSPI
349,500원
+15,500 (+4.61%)           ← 빨강 pill

시가총액 2,087.5조    PER 12.5    PBR 1.2    배당률 2.7%
```

---

## 4. 페이지별 와이어프레임

### 4.1 홈 (/)

```
┌──────────────────────────────────────────────┐
│  [로고]           [검색 ──────]  [로그인]       │
├──────────────────────────────────────────────┤
│                                              │
│  KOSPI 2,847.32  +12.45 (+0.44%)             │
│  KOSDAQ 892.15   -3.21 (-0.36%)              │
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │시총 TOP 5│  │상승 TOP 5│  │하락 TOP 5│      │
│  │삼성전자  │  │종목A    │  │종목B    │      │
│  │SK하이닉스│  │종목C    │  │종목D    │      │
│  │...      │  │...      │  │...      │      │
│  └─────────┘  └─────────┘  └─────────┘      │
│                                              │
│  업종별 등락 히트맵                             │
│  ┌───┬───┬───┬───┬───┐                      │
│  │전기│반도│자동│금융│바이│                      │
│  │+2.1│+1.3│-0.5│+0.2│-1.1│                      │
│  └───┴───┴───┴───┴───┘                      │
└──────────────────────────────────────────────┘
```

### 4.2 종목 상세 (/stocks/[ticker])

```
┌──────────────────────────────────────────────┐
│  삼성전자  005930  KOSPI                      │
│  349,500원                                   │
│  +15,500 (+4.61%)                            │
│                                              │
│  [Overview] [Financials] [Valuation] [배당]   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──── 가격 차트 ────────────────────┐       │
│  │  [1M] [3M] [1Y] [3Y] [5Y]       │       │
│  │  ~~~~~~~~~~~~~~~~~~~~~~~~         │       │
│  └──────────────────────────────────┘       │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ PER  │ │ PBR  │ │ ROE  │ │배당률 │       │
│  │ 12.5 │ │  1.2 │ │ 8.5% │ │ 2.7% │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│  기업 개요                                    │
│  시가총액: 2,087.5조  업종: 반도체              │
│  상장일: 1975-06-11  결산월: 12월              │
└──────────────────────────────────────────────┘
```

### 4.3 스크리너 (/screener)

```
┌──────────────────────────────────────────────┐
│  주식 스크리너                                 │
│                                              │
│  시장: [KOSPI ▾] [KOSDAQ ▾]                  │
│  PER: [min ──] ~ [max ──]                    │
│  ROE: [min ──] ~ [max ──]                    │
│  배당률: [min ──] ~ [max ──]                  │
│  시총: [min ──] ~ [max ──]                    │
│  [검색]                                       │
├──────────────────────────────────────────────┤
│  종목명      현재가    PER    ROE   배당률  시총  │
│  삼성전자   349,500   12.5   8.5   2.7%  2087조│
│  SK하이닉스 205,000   8.3   15.2   1.2%   150조│
│  ...                                         │
│  << 1 2 3 4 5 >>                             │
└──────────────────────────────────────────────┘
```

---

## 5. 프론트엔드 아키텍처

### 5.1 설계 원칙

```
1. 서버 컴포넌트 우선 — SEO + 초기 로딩 성능
2. 클라이언트 최소화 — 차트, 인터랙션만 "use client"
3. 기능별 모듈 분리 — 도메인 단위로 코드 응집
4. 공유 UI는 순수 컴포넌트 — 비즈니스 로직 없는 프레젠테이션
```

### 5.2 디렉토리 구조

```
src/
├── app/                          ← Next.js App Router (라우팅만)
│   ├── layout.tsx                ← 글로벌 레이아웃 (헤더, 폰트)
│   ├── page.tsx                  ← 홈 (시장 개요)
│   ├── stocks/
│   │   ├── page.tsx              ← 전종목 리스트
│   │   └── [ticker]/
│   │       ├── layout.tsx        ← 종목 헤더 + 탭 공유
│   │       ├── page.tsx          ← Overview (기본 탭)
│   │       ├── financials/
│   │       │   └── page.tsx
│   │       ├── valuation/
│   │       │   └── page.tsx
│   │       └── dividend/
│   │           └── page.tsx
│   ├── screener/
│   │   └── page.tsx
│   ├── market/
│   │   └── page.tsx
│   ├── portfolio/                ← 로그인 필요
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── api/                      ← API 라우트 (필요 시)
│
├── features/                     ← 기능별 모듈 (도메인 단위)
│   ├── stock/
│   │   ├── components/
│   │   │   ├── stock-header.tsx       ← 종목 헤더 (서버)
│   │   │   ├── metric-cards.tsx       ← 지표 카드 그리드 (서버)
│   │   │   ├── price-chart.tsx        ← 가격 차트 (클라이언트)
│   │   │   ├── financial-table.tsx    ← 재무 테이블 (클라이언트: 토글)
│   │   │   └── company-overview.tsx   ← 기업 개요 (서버)
│   │   ├── queries.ts                 ← Supabase 쿼리 함수
│   │   └── types.ts                   ← 타입 정의
│   │
│   ├── screener/
│   │   ├── components/
│   │   │   ├── filter-panel.tsx       ← 필터 패널 (클라이언트)
│   │   │   └── result-table.tsx       ← 결과 테이블 (클라이언트)
│   │   ├── queries.ts
│   │   └── types.ts
│   │
│   ├── market/
│   │   ├── components/
│   │   │   ├── index-summary.tsx      ← KOSPI/KOSDAQ 요약 (서버)
│   │   │   ├── sector-heatmap.tsx     ← 업종 히트맵 (클라이언트)
│   │   │   └── top-movers.tsx         ← 상승/하락 TOP (서버)
│   │   └── queries.ts
│   │
│   ├── portfolio/
│   │   ├── components/
│   │   │   ├── portfolio-summary.tsx  ← 총 평가액/수익률 (클라이언트)
│   │   │   ├── holdings-table.tsx     ← 보유 종목 테이블 (클라이언트)
│   │   │   └── add-holding-form.tsx   ← 종목 추가 폼 (클라이언트)
│   │   ├── queries.ts
│   │   └── actions.ts                 ← Server Actions (CRUD)
│   │
│   └── search/
│       ├── components/
│       │   └── search-bar.tsx         ← 글로벌 검색 (클라이언트)
│       └── queries.ts
│
├── components/                   ← 공유 UI 컴포넌트 (순수 프레젠테이션)
│   ├── ui/                       ← shadcn/ui 기반
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── badge.tsx
│   ├── change-text.tsx           ← 등락 표시 (+15,500 +4.61%)
│   ├── metric-card.tsx           ← 지표 카드 (PER, PBR 등)
│   ├── format-number.tsx         ← 숫자 포맷 (3,495억 원)
│   └── header.tsx                ← 글로벌 헤더
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← 브라우저용
│   │   └── server.ts             ← 서버용 (서비스키)
│   ├── format.ts                 ← 숫자/날짜 포맷 유틸
│   └── constants.ts              ← 상수 (색상, 기간 옵션 등)
│
└── pipeline/                     ← 데이터 수집 (기존)
```

### 5.3 왜 이 구조인가

```
문제: "components/ 에 모든 걸 넣으면 50개 파일이 뒤섞인다"

해결: features/ 도메인 분리

  features/stock/     ← 종목 관련 컴포넌트 + 쿼리 + 타입
  features/screener/  ← 스크리너 관련
  features/portfolio/ ← 포트폴리오 관련

  각 feature는:
    components/  → 이 기능에서만 쓰는 컴포넌트
    queries.ts   → Supabase 쿼리 함수 (데이터 접근 캡슐화)
    types.ts     → 이 기능의 타입
    actions.ts   → Server Actions (mutation이 있는 경우)

  components/ (루트) → 여러 feature에서 공유하는 순수 UI만
```

### 5.4 데이터 흐름

```
                    ┌─────────────┐
                    │  Supabase   │
                    │  PostgreSQL │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   서버 컴포넌트     서버 컴포넌트      Server Actions
   (읽기 전용)      (읽기 전용)       (쓰기)
          │                │                │
   features/stock    features/market   features/portfolio
   /queries.ts       /queries.ts       /actions.ts
          │                │                │
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ 종목 페이지│    │ 시장 개요 │    │포트폴리오 │
   │  (SSR)   │    │  (ISR)   │    │ (Dynamic) │
   └──────────┘    └──────────┘    └──────────┘

시장 데이터 = 서버 컴포넌트에서 직접 Supabase 쿼리 (service key)
포트폴리오  = Server Actions로 CRUD (user context)
차트/필터   = 클라이언트 컴포넌트 (인터랙션 필요한 것만)
```

### 5.5 렌더링 전략

| 페이지 | 전략 | 이유 |
|--------|------|------|
| `/stocks/[ticker]` | ISR (revalidate: 3600) | SEO + 장중에도 1시간 캐시 |
| `/stocks/[ticker]/financials` | ISR (revalidate: 86400) | 재무제표는 분기 1회 갱신 |
| `/screener` | Dynamic (SSR) | 필터 조합이 무한, 캐시 불가 |
| `/market` | ISR (revalidate: 300) | 5분 단위 지수 갱신 |
| `/portfolio` | Dynamic + Client | 유저별 개인 데이터 |
| `/` (홈) | ISR (revalidate: 300) | 시장 요약 |

### 5.6 애니메이션 원칙

```
사용하는 애니메이션 (의미 있는 것만):
  1. 숫자 카운트업 — 현재가, 시총 로딩 시 (500ms)
  2. 차트 드로인 — 라인차트 그려지는 효과 (300ms ease-out)
  3. 카드 페이드인 — 페이지 진입 시 (200ms, stagger 50ms)
  4. 탭 전환 — 콘텐츠 슬라이드 (150ms)
  5. 호버 — 카드 shadow 확대 (150ms)

사용하지 않는 애니메이션:
  ✗ 파티클, 글리터, 그라디언트 흐름
  ✗ 스크롤 패럴랙스
  ✗ 로딩 스피너 대신 스켈레톤 UI
  ✗ 자동 캐러셀
```

---

## 6. 구현 우선순위

```
Phase 1-A (Week 3): 기반 + 종목 페이지
  - [ ] 글로벌 레이아웃 (헤더, 검색, 폰트)
  - [ ] 공유 컴포넌트 (ChangeText, MetricCard, FormatNumber)
  - [ ] 종목 상세 Overview (StockHeader + MetricCards + CompanyOverview)
  - [ ] 종목 상세 Financials (FinancialTable)

Phase 1-B (Week 4): 차트 + 시장
  - [ ] 가격 차트 (PriceChart)
  - [ ] 홈 페이지 (시장 요약 + Top Movers)
  - [ ] 종목 검색

Phase 1-C (Week 5-6): 스크리너 + 포트폴리오
  - [ ] 스크리너 (FilterPanel + ResultTable)
  - [ ] 포트폴리오 (로그인 + CRUD + 대시보드)
  - [ ] SEO + 배포
```
