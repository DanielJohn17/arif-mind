import { ArrowUpRight, Minus, TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "neutral" | "attention";
};

const toneStyles = {
  positive: {
    icon: ArrowUpRight,
    className: "text-primary",
  },
  neutral: {
    icon: Minus,
    className: "text-muted-foreground",
  },
  attention: {
    icon: TriangleAlert,
    className: "text-[#da3a32]",
  },
};

export function MetricCard({ label, value, change, tone }: MetricCardProps) {
  const toneStyle = toneStyles[tone];
  const Icon = toneStyle.icon;

  return (
    <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
      <CardContent className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <div className={cn("flex items-center gap-2 text-sm", toneStyle.className)}>
              <Icon className="size-4" />
              {change}
            </div>
          </div>
          <div className="size-11 rounded-2xl bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
