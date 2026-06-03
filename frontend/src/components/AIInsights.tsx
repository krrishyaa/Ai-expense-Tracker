import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getAIInsights } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const toneMap: any = {
  warning: { icon: AlertTriangle, klass: 'text-yellow-700 bg-yellow-100' },
  info: { icon: TrendingUp, klass: 'text-blue-700 bg-blue-100' },
  success: { icon: CheckCircle2, klass: 'text-green-700 bg-green-100' },
};

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getAIInsights();
      if (mounted) setInsights(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold">AI insights</h2>
          <p className="text-xs text-muted-foreground">Smart observations on your spend</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {insights.map((ins) => {
          const m = toneMap[ins.tone] || toneMap.info;
          const Icon = m.icon;
          return (
            <li key={ins.title} className="group flex gap-3 rounded-xl border p-3">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.klass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{ins.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{ins.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AIInsights;
