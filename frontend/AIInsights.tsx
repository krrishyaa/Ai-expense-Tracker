import { Sparkles, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { aiInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AIInsightsProps {
  data?: Array<{ title: string; body: string; tone: string }>;
}

const toneMap = {
  warning: { icon: AlertTriangle, klass: "text-warning bg-warning/10" },
  info: { icon: TrendingUp, klass: "text-primary bg-primary/10" },
  success: { icon: CheckCircle2, klass: "text-success bg-success/10" },
} as const;

export function AIInsights({ data = aiInsights }: AIInsightsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">AI insights</h2>
          <p className="text-xs text-muted-foreground">Smart observations on your spend</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {data.map((ins) => {
          const m = toneMap[ins.tone as keyof typeof toneMap];
          return (
            <li
              key={ins.title}
              className="group flex gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:bg-accent/40"
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", m.klass)}>
                <m.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{ins.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{ins.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}