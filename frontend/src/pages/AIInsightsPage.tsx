import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import AIInsights from '@/components/AIInsights';

const AIInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [command, setCommand] = useState('');
  const user = useAuthStore((s) => s.user);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      console.log('Command received:', command);
      setCommand('');
      alert('Command received by Nexus AI Engine.');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      {/* SideNavBar (Shared Component) */}
      <aside className="hidden md:flex flex-col h-screen w-64 sticky top-0 bg-surface-container border-r border-border-subtle p-4 gap-md z-50">
        <div className="mb-8">
          <h1 className="font-hero-display-mobile text-hero-display-mobile text-primary tracking-tighter">Nexus AI</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Syncing...
          </p>
        </div>
        <nav className="flex-grow flex flex-col gap-1">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all duration-200 text-left">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-label-caps text-label-caps">Dashboard</span>
          </button>
          <button onClick={() => navigate('/expenses')} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all duration-200 text-left">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span className="font-label-caps text-label-caps">Expenses</span>
          </button>
          {/* Active Tab */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <span>AI Insights</span>
          </div>
          <button onClick={() => navigate('/budgets')} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all duration-200 text-left">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            <span className="font-label-caps text-label-caps">Budgets</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-all duration-200 text-left">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-label-caps text-label-caps">Settings</span>
          </button>
        </nav>
        <button className="mt-4 w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span> Add Expense
        </button>
        <div className="mt-auto border-t border-border-subtle pt-4 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-all">
            <span className="material-symbols-outlined text-[20px]">help</span> Help
          </button>
          <button className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-all">
            <span className="material-symbols-outlined text-[20px]">logout</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* TopAppBar (Shared Component) */}
        <header className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <span className="font-hero-display-mobile text-hero-display-mobile font-extrabold text-primary tracking-tighter md:hidden">Nexus</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                className="bg-surface-container-lowest border border-border-subtle rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 w-64 md:w-80 outline-none"
                placeholder="Search analytics..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-100">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-100 relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-tertiary-container rounded-full"></span>
            </button>
            <img
              alt="User profile"
              className="w-8 h-8 rounded-full border border-primary/20"
              src={
                user?.user_metadata?.avatar_url || user?.avatar || user?.picture || '/assets/default-avatar.png'
              }
            />
          </div>
        </header>

        <div className="max-w-container-max mx-auto px-4 py-section-v-desktop space-y-12">
          {/* Financial Brain Visualization Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gap-lg items-center">
            <div className="space-y-6">
              <h2 className="font-section-title text-section-title text-text-primary">
                Cognitive <span className="text-primary">Engine</span>
              </h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant">
                Our ML models process thousands of data points per second to map your spending habits onto a semantic neural graph. This high-fidelity visualization represents how our engine categorizes and predicts your financial future.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-label-caps font-label-caps text-secondary">AI-CATEGORIZED</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-label-caps font-label-caps text-primary">REAL-TIME SYNC</span>
                </div>
              </div>
            </div>
            
            {/* AI Brain Visualization */}
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden bg-surface-elevated/40 border border-border-subtle backdrop-blur-md group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }}></div>
                  <div className="absolute inset-4 rounded-full border border-secondary/30 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[80px] text-primary drop-shadow-lg" style={{ textShadow: '0 0 15px rgba(198,191,255,0.4)' }}>psychology</span>
                  </div>
                  {/* Nodes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary rounded-full blur-sm"></div>
                  <div className="absolute bottom-10 right-4 w-4 h-4 bg-primary rounded-full blur-md"></div>
                  <div className="absolute bottom-20 left-0 w-2 h-2 bg-tertiary rounded-full blur-xs"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 font-code-block text-code-block text-text-muted">
                LATENCY: 14ms<br />MODEL: XL-LEDGER-V4
              </div>
            </div>
          </section>

          {/* Deep Analytics: Multi-line Chart Forecast */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-label-caps text-label-caps text-primary mb-2">PREDICTIVE MODELING</p>
                <h3 className="font-section-title text-section-title">3-Month Forecast</h3>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-label-caps font-label-caps">
                  <span className="w-3 h-[2px] bg-primary"></span> Fixed Costs
                </span>
                <span className="flex items-center gap-2 text-label-caps font-label-caps">
                  <span className="w-3 h-[2px] bg-secondary"></span> Projected Spending
                </span>
              </div>
            </div>
            <div className="h-80 w-full bg-surface-elevated/40 border border-border-subtle rounded-xl p-6 relative overflow-hidden backdrop-blur-md">
              {/* Chart Mockup */}
              <div className="absolute inset-0 p-8 flex items-end gap-2">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 900 200">
                  <path
                    className="text-primary drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(198,191,255,0.6))' }}
                    d="M0 80 Q 150 120 300 40 T 600 100 T 900 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-secondary opacity-60"
                    d="M0 120 Q 150 150 300 110 T 600 140 T 900 90"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="8,4"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              {/* Axis Labels */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between font-label-caps text-label-caps text-text-muted">
                <span>CURRENT</span>
                <span>MONTH 1</span>
                <span>MONTH 2</span>
                <span>MONTH 3</span>
              </div>
              <div className="absolute top-6 right-6 bg-surface-elevated/80 border border-border-bold p-3 rounded-lg backdrop-blur-md">
                <p className="font-label-caps text-label-caps text-primary">AI INSIGHT</p>
                <p className="text-body-md font-body-md">{/* AI insight placeholder */ '+12% anticipated variance due to subscription cycles.'}</p>
              </div>
            </div>
          </section>

          {/* Bento Grid: Smart Budgeting & Reports */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gap-md">
            {/* AI Insights Widget */}
            <div className="md:col-span-1">
              <AIInsights />
            </div>
            {/* Smart Budgeting Recommendations */}
            <div className="md:col-span-2 bg-surface-elevated/40 border border-border-subtle rounded-xl p-6 space-y-6 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">auto_awesome</span>
                <h4 className="font-data-highlight text-data-highlight">Smart Recommendations</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-container-low border border-border-subtle rounded-lg hover:border-primary transition-all duration-300">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">coffee</span>
                    </div>
                    <div>
                      <p className="font-body-lg text-text-primary">Reduce Food & Drink</p>
                      <p className="text-body-md text-text-muted">Save approx. $124/mo by limiting morning takeout.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-secondary text-secondary rounded-lg font-label-caps text-label-caps hover:bg-secondary hover:text-on-secondary transition-all">APPLY</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-low border border-border-subtle rounded-lg hover:border-primary transition-all duration-300">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">subscriptions</span>
                    </div>
                    <div>
                      <p className="font-body-lg text-text-primary">Consolidate SaaS</p>
                      <p className="text-body-md text-text-muted">You have 3 overlapping storage subscriptions.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-primary text-primary rounded-lg font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all">VIEW</button>
                </div>
              </div>
            </div>

            {/* Automated Reports */}
            <div className="bg-surface-elevated/40 border border-border-subtle rounded-xl p-6 flex flex-col backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-[28px]">description</span>
                <h4 className="font-data-highlight text-data-highlight">Reports</h4>
              </div>
              <div className="flex-grow space-y-3 overflow-y-auto max-h-64 pr-2">
                <div className="flex items-center justify-between py-3 border-b border-border-subtle group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">picture_as_pdf</span>
                    <div>
                      <p className="text-body-md text-text-primary">Q2_Financial_Audit.pdf</p>
                      <p className="font-label-caps text-[9px] text-text-muted">GEN BY CELERY • 2M AGO</p>
                    </div>
                  </div>
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">download</button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">text_snippet</span>
                    <div>
                      <p className="text-body-md text-text-primary">Tax_Export_2023.csv</p>
                      <p className="font-label-caps text-[9px] text-text-muted">GEN BY CELERY • 5D AGO</p>
                    </div>
                  </div>
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">download</button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border-subtle group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">picture_as_pdf</span>
                    <div>
                      <p className="text-body-md text-text-primary">Monthly_Recap_May.pdf</p>
                      <p className="font-label-caps text-[9px] text-text-muted">GEN BY CELERY • 10D AGO</p>
                    </div>
                  </div>
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">download</button>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-surface-variant hover:bg-surface-bright text-on-surface-variant rounded-lg font-label-caps text-label-caps transition-all">
                GENERATE NEW
              </button>
            </div>
          </div>

          {/* Chat Interface: Ask Your Financial AI */}
          <section className="space-y-6">
            <div className="bg-surface-elevated/40 border-2 border-primary/20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="bg-primary/10 px-6 py-3 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-error"></div>
                  <div className="w-2 h-2 rounded-full bg-chart-yellow"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="ml-4 font-code-block text-code-block text-primary uppercase tracking-widest">NEXUS-TERMINAL-V2.0</span>
                </div>
                <span className="font-code-block text-code-block text-text-muted opacity-50">ENCRYPTED</span>
              </div>
              <div className="p-8 font-code-block text-code-block space-y-4 min-h-[300px]">
                <div className="flex gap-4">
                  <span className="text-primary shrink-0">user@nexus:~$</span>
                  <span className="text-text-primary">How much did I spend on coffee in Q1?</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-secondary shrink-0">nexus:ai_engine:~$</span>
                    <div className="text-secondary space-y-2">
                      <p>{'Processing query for Period [2024-01-01 to 2024-03-31]...'}</p>
                      <p>{'Scan complete. Found 42 transactions under category [Beverages/Coffee].'}</p>
                      <p className="bg-secondary/10 p-2 inline-block rounded">{'TOTAL Q1 COFFEE SPEND: $542.15 (Trend: +4.2% vs Q4)'}</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-8 animate-pulse">
                  <span className="text-primary shrink-0">user@nexus:~$</span>
                  <span className="w-2 h-5 bg-primary"></span>
                </div>
              </div>
              <div className="p-4 bg-surface-container-lowest border-t border-border-subtle">
                <form onSubmit={handleCommandSubmit} className="flex gap-4 items-center">
                  <input
                    className="flex-grow bg-transparent border-none focus:ring-0 font-code-block text-text-primary outline-none placeholder-text-muted"
                    placeholder="Type a command or question (e.g., 'Export Q2 taxes')..."
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                  <button className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 transition-transform" type="submit">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>

        {/* Footer (Shared Component) */}
        <footer className="max-w-container-max mx-auto w-full py-8 flex justify-between items-center px-4 border-t border-border-subtle">
          <div className="flex flex-col">
            <p className="font-bold text-primary">Nexus Ledger</p>
            <p className="font-label-caps text-label-caps text-text-muted mt-1">Deployed on Render</p>
          </div>
          <div className="flex gap-8">
            <a className="font-label-caps text-label-caps text-text-muted hover:text-secondary transition-colors underline-offset-4 hover:underline" href="#">GitHub</a>
            <a className="font-label-caps text-label-caps text-text-muted hover:text-secondary transition-colors underline-offset-4 hover:underline" href="#">Documentation</a>
          </div>
        </footer>
      </main>

      {/* Mobile Navigation (Responsive Pivot) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-elevated/80 border-t border-border-subtle flex justify-around items-center py-4 z-40 backdrop-blur-md">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-label-caps">DASHBOARD</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-label-caps">EXPENSES</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-[10px] font-label-caps">INSIGHTS</span>
        </div>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-label-caps">SETTINGS</span>
        </button>
      </nav>
    </div>
  );
};

export default AIInsightsPage;
