export interface Company {
  corp_code: string;
  stock_code: string;
  name_ko: string;
  name_en: string | null;
  stock_name: string | null;
  market: string;
  stock_type: string | null;
  industry_code: string | null;
  industry_name: string | null;
  ceo: string | null;
  established_at: string | null;
  listed_at: string | null;
  fiscal_month: number | null;
  par_value: number | null;
  listed_shares: number | null;
}

export interface Financial {
  fiscal_year: number;
  quarter: number | null;
  fs_div: string;
  revenue: number | null;
  operating_income: number | null;
  net_income: number | null;
  total_assets: number | null;
  total_debt: number | null;
  total_equity: number | null;
  eps: number | null;
  bps: number | null;
  dividend_per_share: number | null;
  dividend_yield: number | null;
  payout_ratio: number | null;
  roe: number | null;
  roa: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  debt_ratio: number | null;
}

export interface DailyPrice {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  change: number | null;
  change_pct: number | null;
  volume: number | null;
  market_cap: number | null;
}
