import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompany, getLatestPrice, getFinancials } from "@/features/stock/queries";
import { MetricCards } from "@/features/stock/components/metric-cards";
import { CompanyOverview } from "@/features/stock/components/company-overview";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const company = await getCompany(ticker);
  if (!company) return {};
  return {
    title: `${company.stock_name ?? company.name_ko} (${company.stock_code}) 주가, 재무제표`,
    description: `${company.stock_name ?? company.name_ko} 주가, 시가총액, PER, ROE, 배당률 — Stockpedia KR`,
  };
}

export const revalidate = 3600; // ISR 1시간

export default async function StockOverviewPage({ params }: PageProps) {
  const { ticker } = await params;
  const company = await getCompany(ticker);
  if (!company) notFound();

  const [price, financials] = await Promise.all([
    getLatestPrice(ticker),
    getFinancials(company.corp_code),
  ]);

  const latestFinancial = financials.length > 0 ? financials[0] : null;

  return (
    <div className="space-y-6">
      <MetricCards
        price={price}
        financial={latestFinancial}
        listedShares={company.listed_shares}
      />
      <CompanyOverview company={company} price={price} />
    </div>
  );
}
