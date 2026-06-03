import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Wallet, TrendingUp, Receipt, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpendChart } from "@/components/dashboard/SpendChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { ExpensesTable } from "@/components/dashboard/ExpensesTable";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { kpis } from "@/lib/mock-data";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledgerly — AI Expense Tracker" },
      { name: "description", content: "A premium dashboard for tracking, categorizing, and forecasting expenses with AI." },
      { property: "og:title", content: "Ledgerly — AI Expense Tracker" },
      { property: "og:description", content: "A premium dashboard for tracking, categorizing, and forecasting expenses with AI." },
    ],
  }),
  component: Index,
});

const icons = [Wallet, TrendingUp, Receipt, Sparkles];

function Index() {
  const user = useAuthStore((s) => s.user) || {};
  const name = user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'there';
  const monthLabel = useMemo(
    () => new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    []
  );

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
            <Button variant="outline" size="sm">Last 30 days</Button>
            <Button size="sm" className="bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-md)] hover:opacity-95">
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
            <SpendChart />
          </div>
          <CategoryChart />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExpensesTable />
          </div>
          <AIInsights />
        </section>
      </div>
    </DashboardLayout>
  );
}
