import { Card } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-stone-400">{sub}</p>}
    </Card>
  );
}
