import { formatChange, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChangeTextProps {
  change: number | null | undefined;
  changePct: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export function ChangeText({
  change,
  changePct,
  size = "md",
  showBadge = true,
}: ChangeTextProps) {
  const isUp = (change ?? 0) > 0;
  const isDown = (change ?? 0) < 0;

  const color = isUp
    ? "text-red-600"
    : isDown
      ? "text-blue-600"
      : "text-stone-500";

  const bgColor = isUp
    ? "bg-red-50"
    : isDown
      ? "bg-blue-50"
      : "bg-stone-100";

  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  const text = `${formatChange(change)} (${formatPercent(changePct)})`;

  if (showBadge) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 font-medium tabular-nums",
          bgColor,
          color,
          sizeClass
        )}
      >
        {text}
      </span>
    );
  }

  return (
    <span className={cn("font-medium tabular-nums", color, sizeClass)}>
      {text}
    </span>
  );
}
