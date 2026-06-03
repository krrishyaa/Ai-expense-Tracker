import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Receipt, Sparkles } from "lucide-react";
import { DashboardLayout } from "../DashboardLayout";
import { StatCard } from "../StatCard";
import { SpendChart } from "../SpendChart";
import { CategoryChart } from "../CategoryChart";
import { ExpensesTable } from "../ExpensesTable";
import { AIInsights } from "../AIInsights";
import {
  getKpis,
  getSpendTrend,
  getCategoryBreakdown,
  getExpenses,
  getAIInsights,
  type Kpi,
  type Expense,
} from "@/lib/mock-data";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

const icons = [Wallet, TrendingUp, Receipt, Sparkles];

function Index() {
  const user = useAuthStore((s) => s.user) || {};
  const name =
    user?.user_metadata?.full_name || user?.name || user?.email?.split("@")[0] || "there";
  const monthLabel = useMemo(
    () => new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    []
  );

  const { data: kpis = [] } = useQuery<Kpi[]>({
    queryKey: ["dashboard", "kpis"],
    queryFn: getKpis,
    staleTime: 1000 * 60 * 5,
  });
  const { data: spendTrend = [] } = useQuery<{ month: string; spend: number; budget: number }[]>({
    queryKey: ["dashboard", "spendTrend"],
    queryFn: getSpendTrend,
    staleTime: 1000 * 60 * 5,
  });
  const { data: categoryData = [] } = useQuery<{ name: string; value: number }[]>({
    queryKey: ["dashboard", "categoryBreakdown"],
    queryFn: getCategoryBreakdown,
    staleTime: 1000 * 60 * 5,
  });
  const { data: expenseData = [] } = useQuery<Expense[]>({
    queryKey: ["dashboard", "expenses"],
    queryFn: getExpenses,
    staleTime: 1000 * 60 * 5,
  });
  const { data: insights = [] } = useQuery<{ title: string; body: string; tone: string }[]>({
    queryKey: ["dashboard", "insights"],
    queryFn: getAIInsights,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Overview · {monthLabel}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Welcome back, {name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's a snapshot of your finances and the AI's latest insights.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full border border-border px-3 py-2 text-sm">
              Last 30 days
            </Button>
            <Button size="sm" className="rounded-full bg-[image:var(--gradient-primary)] px-3 py-2 text-sm text-primary-foreground shadow-[var(--shadow-md)] hover:opacity-95">
              Generate report
            </Button>
          </div>
        </div>

        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatCard key={k.label} {...k} icon={icons[i]} positiveIsUp={i !== 1} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SpendChart data={spendTrend} />
          </div>
          <CategoryChart data={categoryData} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExpensesTable data={expenseData} />
          </div>
          <AIInsights data={insights} />
        </section>
      </div>
    </DashboardLayout>
  );
}
