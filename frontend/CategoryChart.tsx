import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryBreakdown } from "@/lib/mock-data";

interface CategoryChartProps {
  data?: Array<{ name: string; value: number }>;
}

const COLORS = [
  "oklch(0.55 0.22 265)",
  "oklch(0.72 0.18 50)",
  "oklch(0.68 0.18 220)",
  "oklch(0.66 0.2 320)",
  "oklch(0.7 0.16 150)",
  "oklch(0.65 0.2 10)",
  "oklch(0.7 0.05 260)",
];

export function CategoryChart({ data = categoryBreakdown }: CategoryChartProps) {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
      <h2 className="text-base font-semibold tracking-tight">By category</h2>
      <p className="text-xs text-muted-foreground">Breakdown of this month</p>

      <div className="relative mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                fontSize: 12,
              }}
              formatter={(v: number) => `$${v.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-bold">${total.toLocaleString()}</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.map((c, i) => (
          <li key={c.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-foreground">{c.name}</span>
            </span>
            <span className="font-mono text-xs text-muted-foreground">${c.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}