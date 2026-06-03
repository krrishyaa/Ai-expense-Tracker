import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useExpenseStore } from '../store';
import { expenseService, analyticsService, budgetService } from '../services/api';
import Navbar from '../components/Navbar';
import ExpenseCard from '../components/ExpenseCard';
import Chart from '../components/Chart';
import { Plus, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const expenses = useExpenseStore((state) => state.expenses);
  const setExpenses = useExpenseStore((state) => state.setExpenses);
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [expRes, sumRes, trendsRes, budgetRes] = await Promise.all([
        expenseService.list({ ordering: '-date', page_size: 10 }),
        analyticsService.summary(),
        analyticsService.monthlyTrends({ months: 6 }),
        budgetService.spendingStatus(),
      ]);

      setExpenses(expRes.data.results || expRes.data);
      setSummary(sumRes.data);
      setTrends(trendsRes.data);
      setBudgetStatus(budgetRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="section-title mb-2">Welcome back, {user?.first_name || 'User'}! 👋</h1>
          <p className="text-muted">Here's your financial overview</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Total Spent</p>
                <h3 className="text-3xl font-black text-accent">
                  ${summary?.total_all_time?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <DollarSign className="text-accent/30" size={40} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">This Month</p>
                <h3 className="text-3xl font-black text-accent2">
                  ${summary?.monthly_total?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <TrendingUp className="text-accent2/30" size={40} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">This Week</p>
                <h3 className="text-3xl font-black text-accent3">
                  ${summary?.weekly_total?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <AlertCircle className="text-accent3/30" size={40} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Expenses Count</p>
                <h3 className="text-3xl font-black">{summary?.expense_count || 0}</h3>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-lg" />
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {trends && (
            <motion.div variants={itemVariants}>
              <Chart
                data={trends}
                type="line"
                title="Monthly Spending Trend"
              />
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="card">
            <h3 className="font-semibold mb-4">Budget Status</h3>
            <div className="space-y-4">
              {budgetStatus.slice(0, 3).map((budget) => (
                <div key={budget.budget_id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{budget.category}</span>
                    <span className={`text-sm font-bold ${budget.alert ? 'text-accent3' : 'text-accent2'}`}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bg3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        budget.alert
                          ? 'bg-gradient-to-r from-accent3 to-accent'
                          : 'bg-gradient-to-r from-accent to-accent2'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Recent Expenses</h2>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              Add Expense
            </button>
          </div>

          <div className="space-y-4">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
