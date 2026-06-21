"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLargeNumber, formatPercent } from "@/lib/format";
import type { Financial } from "../types";

interface FinancialTableProps {
  financials: Financial[];
}

const rows = [
  { label: "매출액", key: "revenue" as const, format: formatLargeNumber },
  { label: "영업이익", key: "operating_income" as const, format: formatLargeNumber },
  { label: "순이익", key: "net_income" as const, format: formatLargeNumber },
  { label: "자산총계", key: "total_assets" as const, format: formatLargeNumber },
  { label: "부채총계", key: "total_debt" as const, format: formatLargeNumber },
  { label: "자본총계", key: "total_equity" as const, format: formatLargeNumber },
  { label: "ROE", key: "roe" as const, format: (v: number | null) => formatPercent(v) },
  { label: "영업이익률", key: "operating_margin" as const, format: (v: number | null) => formatPercent(v) },
  { label: "부채비율", key: "debt_ratio" as const, format: (v: number | null) => v != null ? `${v.toFixed(0)}%` : "-" },
] as const;

export function FinancialTable({ financials }: FinancialTableProps) {
  // 오래된 순 정렬 (왼 → 오)
  const sorted = [...financials].sort((a, b) => a.fiscal_year - b.fiscal_year);

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-stone-400">
        재무제표 데이터가 없습니다
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28 text-stone-500">항목</TableHead>
            {sorted.map((f) => (
              <TableHead
                key={f.fiscal_year}
                className="text-right tabular-nums text-stone-500"
              >
                {f.fiscal_year}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} className="hover:bg-stone-50">
              <TableCell className="font-medium text-stone-700">
                {row.label}
              </TableCell>
              {sorted.map((f) => {
                const value = f[row.key];
                return (
                  <TableCell
                    key={f.fiscal_year}
                    className="text-right tabular-nums"
                  >
                    {row.format(value)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
