-- ============================================
-- Stockpedia KR — 초기 스키마
-- ============================================

-- 기업 마스터
CREATE TABLE companies (
  corp_code       VARCHAR(8) PRIMARY KEY,
  stock_code      VARCHAR(6) UNIQUE NOT NULL,
  name_ko         TEXT NOT NULL,
  name_en         TEXT,
  stock_name      TEXT,
  market          VARCHAR(10) NOT NULL,
  stock_type      VARCHAR(10) DEFAULT '보통주',
  industry_code   VARCHAR(10),
  industry_name   TEXT,
  ceo             TEXT,
  established_at  DATE,
  listed_at       DATE,
  fiscal_month    SMALLINT DEFAULT 12,
  par_value       INTEGER,
  listed_shares   BIGINT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 재무제표
CREATE TABLE financials (
  id              SERIAL PRIMARY KEY,
  corp_code       VARCHAR(8) REFERENCES companies(corp_code),
  fiscal_year     SMALLINT NOT NULL,
  quarter         SMALLINT,
  fs_div          VARCHAR(3) NOT NULL,
  revenue         BIGINT,
  operating_income BIGINT,
  net_income      BIGINT,
  total_assets    BIGINT,
  total_debt      BIGINT,
  total_equity    BIGINT,
  current_assets  BIGINT,
  current_liabilities BIGINT,
  eps             INTEGER,
  bps             INTEGER,
  dividend_per_share INTEGER,
  dividend_yield  NUMERIC(5,2),
  payout_ratio    NUMERIC(5,2),
  roe             NUMERIC(7,2),
  roa             NUMERIC(7,2),
  operating_margin NUMERIC(7,2),
  net_margin      NUMERIC(7,2),
  debt_ratio      NUMERIC(7,2),
  revenue_growth  NUMERIC(7,2),
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
  change          INTEGER,
  change_pct      NUMERIC(7,2),
  volume          BIGINT,
  trade_value     BIGINT,
  market_cap      BIGINT,
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
  rcept_no        VARCHAR(20) PRIMARY KEY,
  corp_code       VARCHAR(8) REFERENCES companies(corp_code),
  title           TEXT NOT NULL,
  filed_at        DATE NOT NULL,
  report_url      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 사용자 데이터 ──

CREATE TABLE portfolios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '내 포트폴리오',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE holdings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id    UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_code      VARCHAR(6) NOT NULL,
  quantity        INTEGER NOT NULL,
  avg_price       INTEGER NOT NULL,
  bought_at       DATE,
  memo            TEXT,
  UNIQUE (portfolio_id, stock_code)
);

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

-- ── RLS ──

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

-- 시장 데이터: 누구나 읽기 가능
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read financials" ON financials FOR SELECT USING (true);
CREATE POLICY "Public read daily_prices" ON daily_prices FOR SELECT USING (true);
CREATE POLICY "Public read index_prices" ON index_prices FOR SELECT USING (true);
CREATE POLICY "Public read disclosures" ON disclosures FOR SELECT USING (true);

-- ── 인덱스 ──

CREATE INDEX idx_daily_prices_date ON daily_prices(date);
CREATE INDEX idx_daily_prices_stock ON daily_prices(stock_code);
CREATE INDEX idx_financials_corp ON financials(corp_code);
CREATE INDEX idx_financials_year ON financials(fiscal_year);
CREATE INDEX idx_disclosures_corp ON disclosures(corp_code);
CREATE INDEX idx_disclosures_date ON disclosures(filed_at);
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX idx_index_prices_date ON index_prices(date);
