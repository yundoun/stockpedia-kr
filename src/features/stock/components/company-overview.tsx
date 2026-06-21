import { Card } from "@/components/ui/card";
import { formatDate, formatLargeNumber, formatPrice } from "@/lib/format";
import type { Company, DailyPrice } from "../types";

interface CompanyOverviewProps {
  company: Company;
  price: DailyPrice | null;
}

export function CompanyOverview({ company, price }: CompanyOverviewProps) {
  const items = [
    { label: "시가총액", value: formatLargeNumber(price?.market_cap) + " 원" },
    { label: "시장", value: company.market },
    { label: "업종", value: company.industry_code ?? "-" },
    { label: "대표이사", value: company.ceo ?? "-" },
    { label: "상장일", value: formatDate(company.listed_at) },
    { label: "결산월", value: company.fiscal_month ? `${company.fiscal_month}월` : "-" },
    {
      label: "상장주식수",
      value: company.listed_shares
        ? company.listed_shares.toLocaleString("ko-KR") + "주"
        : "-",
    },
    { label: "액면가", value: company.par_value ? formatPrice(company.par_value) + "원" : "-" },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-lg font-semibold">기업 개요</h3>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-stone-500">{item.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
