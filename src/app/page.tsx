import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChangeText } from "@/components/change-text";
import { formatPrice, formatLargeNumber } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/client";

export const revalidate = 300; // ISR 5분

async function getTopStocks() {
  const supabase = createPublicClient();

  // 최신 날짜 가져오기
  const { data: latest } = await supabase
    .from("daily_prices")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!latest) return [];

  const { data } = await supabase
    .from("daily_prices")
    .select("stock_code, close, change, change_pct, volume, market_cap")
    .eq("date", latest.date)
    .order("market_cap", { ascending: false })
    .limit(20);

  if (!data) return [];

  // 종목명 조인
  const codes = data.map((d) => d.stock_code);
  const { data: companies } = await supabase
    .from("companies")
    .select("stock_code, stock_name, name_ko, market")
    .in("stock_code", codes);

  const companyMap = new Map(
    (companies ?? []).map((c) => [c.stock_code, c])
  );

  return data.map((d) => {
    const company = companyMap.get(d.stock_code);
    return {
      ...d,
      name: company?.stock_name ?? company?.name_ko ?? d.stock_code,
      market: company?.market ?? "",
    };
  });
}

export default async function HomePage() {
  const stocks = await getTopStocks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">한국 주식 분석</h1>
        <p className="mt-2 text-stone-500">
          KOSPI/KOSDAQ 재무제표, 밸류에이션, 스크리너
        </p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold">시가총액 TOP 20</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">종목명</th>
                <th className="pb-2 pr-4 text-right">현재가</th>
                <th className="pb-2 pr-4 text-right">등락</th>
                <th className="pb-2 text-right">시가총액</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, i) => (
                <tr
                  key={stock.stock_code}
                  className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                >
                  <td className="py-3 pr-4 text-stone-400">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/stocks/${stock.stock_code}`}
                      className="font-medium text-stone-900 hover:text-teal-700"
                    >
                      {stock.name}
                    </Link>
                    <span className="ml-2 text-xs text-stone-400">
                      {stock.market}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatPrice(stock.close)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <ChangeText
                      change={stock.change}
                      changePct={stock.change_pct}
                      size="sm"
                      showBadge={false}
                    />
                  </td>
                  <td className="py-3 text-right tabular-nums text-stone-600">
                    {formatLargeNumber(stock.market_cap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
