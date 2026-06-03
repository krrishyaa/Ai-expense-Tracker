import { useState, useEffect } from "react";
import { Menu, Search, Bell, Moon, Sun, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search transactions, merchants, categories…"
          className="h-10 w-full rounded-lg border-border bg-muted/40 pl-9 pr-16 text-sm focus-visible:bg-background"
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <Button size="sm" className="hidden h-9 gap-1.5 bg-[image:var(--gradient-primary)] px-3 text-primary-foreground shadow-[var(--shadow-md)] hover:opacity-95 sm:inline-flex">
          <Plus className="h-4 w-4" />
          New expense
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="font-mono text-[10px]">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { t: "Apple Store charge flagged", d: "2m ago" },
              { t: "Monthly report ready", d: "1h ago" },
              { t: "Budget threshold reached", d: "Yesterday" },
            ].map((n) => (
              <DropdownMenuItem key={n.t} className="flex flex-col items-start gap-0.5 py-2.5">
                <span className="text-sm font-medium">{n.t}</span>
                <span className="text-xs text-muted-foreground">{n.d}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AccountButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <AccountInfo />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AccountButton() {
  const user = useAuthStore((s) => s.user) || {};
  const name = user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatar = user?.user_metadata?.avatar_url || user?.avatar || user?.picture || null;

  return (
    <button className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 transition-colors hover:bg-accent" aria-label="Account menu">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center text-xs font-semibold text-primary-foreground">{initials}</div>
      )}
      <span className="hidden text-sm font-medium md:inline">{name}</span>
      <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:inline" />
    </button>
  );
}

function AccountInfo() {
  const user = useAuthStore((s) => s.user) || {};
  const name = user?.user_metadata?.full_name || user?.name || 'User';
  const email = user?.email || user?.user_metadata?.email || '';
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{name}</span>
      <span className="text-xs font-normal text-muted-foreground">{email}</span>
    </div>
  );
}