import { Badge } from "@/components/ui/badge";
import { ChangeText } from "@/components/change-text";
import { formatPrice } from "@/lib/format";
import type { Company, DailyPrice } from "../types";

interface StockHeaderProps {
  company: Company;
  price: DailyPrice | null;
}

export function StockHeader({ company, price }: StockHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{company.stock_name ?? company.name_ko}</h1>
        <span className="text-sm text-stone-400 tabular-nums">
          {company.stock_code}
        </span>
        <Badge variant="secondary" className="text-xs">
          {company.market}
        </Badge>
      </div>

      {price && (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums">
            {formatPrice(price.close)}
            <span className="ml-1 text-base font-normal text-stone-400">원</span>
          </span>
          <ChangeText
            change={price.change}
            changePct={price.change_pct}
            size="md"
          />
        </div>
      )}
    </div>
  );
}
