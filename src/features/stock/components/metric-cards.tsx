import { MetricCard } from "@/components/metric-card";
import { formatLargeNumber, formatMultiple, formatPercent } from "@/lib/format";
import type { DailyPrice, Financial } from "../types";

interface MetricCardsProps {
  price: DailyPrice | null;
  financial: Financial | null;
  listedShares: number | null;
}

export function MetricCards({ price, financial, listedShares }: MetricCardsProps) {
  // PER = 주가 / EPS
  const per =
    price?.close && financial?.eps && financial.eps > 0
      ? price.close / financial.eps
      : null;

  // PBR = 주가 / BPS
  const bps =
    financial?.total_equity && listedShares && listedShares > 0
      ? Math.round(financial.total_equity / listedShares)
      : null;
  const pbr = price?.close && bps && bps > 0 ? price.close / bps : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        label="시가총액"
        value={formatLargeNumber(price?.market_cap)}
      />
      <MetricCard
        label="PER"
        value={per ? formatMultiple(per) : "-"}
      />
      <MetricCard
        label="PBR"
        value={pbr ? `${pbr.toFixed(2)}배` : "-"}
      />
      <MetricCard
        label="ROE"
        value={financial?.roe ? formatPercent(financial.roe) : "-"}
      />
      <MetricCard
        label="배당률"
        value={financial?.dividend_yield ? `${financial.dividend_yield}%` : "-"}
      />
      <MetricCard
        label="영업이익률"
        value={financial?.operating_margin ? formatPercent(financial.operating_margin) : "-"}
      />
      <MetricCard
        label="부채비율"
        value={financial?.debt_ratio ? `${financial.debt_ratio.toFixed(0)}%` : "-"}
      />
      <MetricCard
        label="EPS"
        value={financial?.eps ? `${financial.eps.toLocaleString("ko-KR")}원` : "-"}
      />
    </div>
  );
}
