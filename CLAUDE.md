# stockpedia-kr

한국 주식 분석 플랫폼 — Stock Analysis for Korean Market.
DART/KRX 공개 데이터 기반, 종목 분석 + 스크리너 + 포트폴리오.

## 세션 규칙

1. **작업 시작 전**: `PROGRESS.md` 읽기
2. **작업 종료 전**: `PROGRESS.md` 갱신
3. **설계 참조**: `docs/planning/`, `docs/design/`

## 핵심 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| 프로젝트 청사진 | `docs/planning/PROJECT-BLUEPRINT.md` | Lean Canvas, 경쟁 분석, 기능 명세, 로드맵 |
| 데이터 파이프라인 | `docs/planning/DATA-PIPELINE.md` | API 매핑, DB 스키마, 수집 전략 |
| 프론트엔드 스펙 | `docs/design/FRONTEND-SPEC.md` | 디자인 토큰, 컬러, 아키텍처, 와이어프레임 |
| 진행 상태 | `PROGRESS.md` | 현재 완료/진행 중/다음 단계 |

## 기술 스택

- TypeScript only (Python 금지)
- Next.js 16 (App Router, SSR/ISR)
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- 데이터 소스: DART OpenAPI, KRX Open API

## 핵심 경로

| 대상 | 경로 |
|------|------|
| Next.js 페이지 | `src/app/` |
| 도메인별 기능 모듈 | `src/features/` (stock, screener, market, portfolio) |
| 공유 UI 컴포넌트 | `src/components/` |
| Supabase 클라이언트 | `src/lib/supabase/` |
| 숫자/날짜 포맷 | `src/lib/format.ts` |
| 데이터 파이프라인 | `src/pipeline/` |
| DB 마이그레이션 | `supabase/migrations/` |

## 아키텍처 원칙

- **features/ 도메인 분리**: 각 기능(stock, screener 등)마다 components/ + queries.ts + types.ts
- **서버 컴포넌트 우선**: SEO + 성능, 클라이언트는 인터랙션만
- **queries.ts로 데이터 접근 캡슐화**: 컴포넌트가 Supabase 직접 호출하지 않음

## 데이터 소스

| 데이터 | API | 인증 |
|--------|-----|------|
| 재무제표/배당/기업정보 | DART OpenAPI | 쿼리파라미터 `crtfc_key` |
| 주가/종목/지수 | KRX Open API | 헤더 `AUTH_KEY` |

## 명령어

| 명령어 | 용도 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run seed` | 전체 초기 데이터 수집 |
| `npm run seed:companies` | 기업 마스터만 수집 |
| `npm run seed:prices` | 시세만 수집 |
| `npm run seed:financials` | 재무제표만 수집 |
