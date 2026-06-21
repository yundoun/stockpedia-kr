import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getLatestPrice } from "@/features/stock/queries";
import { StockHeader } from "@/features/stock/components/stock-header";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ ticker: string }>;
}

export default async function StockLayout({ children, params }: LayoutProps) {
  const { ticker } = await params;
  const company = await getCompany(ticker);
  if (!company) notFound();

  const price = await getLatestPrice(ticker);

  const tabs = [
    { label: "Overview", href: `/stocks/${ticker}` },
    { label: "재무제표", href: `/stocks/${ticker}/financials` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <StockHeader company={company} price={price} />

      <nav className="mt-6 flex gap-1 border-b border-stone-200">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
