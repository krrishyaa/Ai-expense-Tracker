import { useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Sparkles,
  CreditCard,
  Settings,
  HelpCircle,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Expenses", to: "/expenses", icon: Receipt },
  { label: "Analytics", to: "/analytics", icon: PieChart },
  { label: "AI Insights", to: "/ai-insights", icon: Sparkles },
  { label: "Cards", to: "/cards", icon: CreditCard },
];

const secondary = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help", to: "/help", icon: HelpCircle },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Ledgerly</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Expenses</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to && item.label === "Overview";
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-sm)]"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                      )}
                    />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Account
          </p>
          <ul className="space-y-1">
            {secondary.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-[image:var(--gradient-subtle)] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">Upgrade to Pro</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Unlock unlimited AI categorization & forecasts.
          </p>
          <Button size="sm" className="mt-3 w-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-md)] hover:opacity-95">
            Upgrade
          </Button>
        </div>
      </aside>
    </>
  );
}