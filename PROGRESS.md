# PROGRESS

## 현재 상태: Phase 1 MVP 프론트엔드 구현 중

### Phase 0: 기획 — 완료
- [x] Lean Canvas + 경쟁 분석 (`docs/planning/PROJECT-BLUEPRINT.md`)
- [x] 포트폴리오 트래커 Phase 1 포함 결정 (리텐션 + 고객 데이터 확보)
- [x] 데이터 파이프라인 설계 (`docs/planning/DATA-PIPELINE.md`)
- [x] DART/KRX API 탐색 및 응답 구조 확인
- [x] 프론트엔드 디자인 & 아키텍처 스펙 (`docs/design/FRONTEND-SPEC.md`)

### Phase 1 Week 1-2: 데이터 파이프라인 — 완료
- [x] Supabase 프로젝트 생성 + 연결 (project-ref: aafruzcwmidrtuqcfnlh)
- [x] DB 스키마 마이그레이션 (8 테이블 + RLS + 인덱스)
- [x] DART API 클라이언트 (`src/pipeline/clients/dart.ts`)
- [x] KRX API 클라이언트 (`src/pipeline/clients/krx.ts`)
- [x] 기업 마스터 수집 → **3,970개 전종목** (KOSPI + KOSDAQ)
- [x] 시세 수집 (6/18) → **2,767종목 + 지수 125건**
- [x] 재무제표 수집 (2024) → **2,758건** (1,211건은 사업보고서 미제출)
- [ ] 재무제표 수집 (2020~2023) — 미실행, 일일 한도 때문에 며칠 분산 필요

### Phase 1 Week 3-4: 프론트엔드 코어 — 진행 중
- [x] Next.js 16 + shadcn/ui + Tailwind 4 초기화
- [x] features/ 도메인 분리 아키텍처 구축
- [x] 글로벌 레이아웃 (Header, 웜톤 배경)
- [x] 공유 컴포넌트 (ChangeText, MetricCard, format 유틸)
- [x] 홈 페이지: 시총 TOP 20 테이블 (실 데이터)
- [x] 종목 상세 Overview: StockHeader + MetricCards(8개) + CompanyOverview
- [x] 종목 상세 재무제표: FinancialTable (9행 × 5년)
- [ ] 가격 차트 (PriceChart — Lightweight Charts or Recharts)
- [ ] 종목 검색 (SearchBar — 글로벌)

### Phase 1 Week 5-6: 스크리너 + 포트폴리오 — 미시작
- [ ] 스크리너 (FilterPanel + ResultTable)
- [ ] 로그인/회원가입 (Supabase Auth)
- [ ] 포트폴리오 CRUD + 대시보드
- [ ] SEO (메타태그, sitemap, robots)
- [ ] Vercel 배포

### Phase 2: 확장 — 미시작
- [ ] 밸류에이션 밴드 차트, 배당 상세
- [ ] 매매 이력 + 실현 손익, 양도세 시뮬레이션
- [ ] 업종 비교, 공시 연동
- [ ] 다크 모드
- [ ] 일봉 백필 (과거 1년)
- [ ] 일일 배치 cron (GitHub Actions)

### Phase 3: AI + 수익화 — 미시작
- [ ] 광고 삽입
- [ ] 프리미엄 플랜
- [ ] AI 포트폴리오 분석 (RAG — finance-docs-mcp 합류)
- [ ] MCP 서버

## DB 현황 (Supabase)

| 테이블 | 레코드 수 | 비고 |
|--------|----------|------|
| companies | 3,970 | KOSPI + KOSDAQ 전종목 |
| daily_prices | 2,767 | 6/18 하루분 |
| index_prices | 125 | 6/18 KOSPI/KOSDAQ/KRX 지수 |
| financials | 2,758 | 2024년 연간 (2020~2023 미수집) |
| portfolios | 0 | Auth 미구현 |
| holdings | 0 | |
| transactions | 0 | |

## 기술적 의사결정 기록

1. **포트폴리오를 Phase 1에 포함** — 종목 분석만으로는 네이버 금융 열화판.
   유저 데이터가 쌓여야 리텐션 + AI 확장(Phase 3) 가능.

2. **KRX > Yahoo Finance** — KRX Open API가 공식 데이터, 한국 전종목 일괄 조회.
   Yahoo는 종목별 호출 + rate limit + 비공식.

3. **features/ 도메인 분리** — components/ 플랫 구조는 50개 넘으면 카오스.
   stock/screener/portfolio 각각 components + queries + types 응집.

4. **서버 컴포넌트 우선** — 종목 페이지 SEO가 핵심 성장 채널.
   클라이언트는 차트/필터/폼 등 인터랙션만.

5. **디자인 방향** — "Toss의 따뜻함 + Stock Analysis의 데이터 밀도".
   웜톤(stone 계열), 큰 숫자, 라운드 카드, 상승=빨강/하락=파랑.
