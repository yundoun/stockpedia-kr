# stockpedia-kr

한국 주식 분석 플랫폼 — Stock Analysis for Korean Market.
DART/KRX 공개 데이터 기반, 종목 분석 + 스크리너 + 시장 개요.

## 핵심 경로

| 대상 | 경로 |
|------|------|
| 기획 문서 | `docs/planning/` |
| 설계 문서 | `docs/design/` |

## 세션 규칙

1. **작업 시작 전**: `PROGRESS.md` 읽기 (없으면 생성)
2. **작업 종료 전**: `PROGRESS.md` 갱신
3. **설계 참조**: `docs/planning/PROJECT-BLUEPRINT.md`

## 기술 스택

- TypeScript only
- Next.js 16 (App Router, SSR/SSG)
- Tailwind CSS 4 + shadcn/ui
- PostgreSQL (Supabase or Neon)
- 데이터 소스: DART OpenAPI, KRX, ECOS

## 데이터 소스

| 데이터 | API |
|--------|-----|
| 재무제표/공시 | DART OpenAPI (opendart.fss.or.kr) |
| 주가/종목 | KRX (data.krx.co.kr) |
| 거시경제 | ECOS (한국은행) |
