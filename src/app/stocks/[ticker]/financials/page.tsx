import { notFound } from "next/navigation";
import { getCompany, getFinancials } from "@/features/stock/queries";
import { FinancialTable } from "@/features/stock/components/financial-table";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export const revalidate = 86400; // ISR 1일

export default async function FinancialsPage({ params }: PageProps) {
  const { ticker } = await params;
  const company = await getCompany(ticker);
  if (!company) notFound();

  const financials = await getFinancials(company.corp_code);

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-semibold">
        재무제표 (연간, 연결)
      </h2>
      <FinancialTable financials={financials} />
    </Card>
  );
}
