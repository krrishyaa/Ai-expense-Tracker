import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Chart from '../components/Chart';
import { analyticsService } from '../services/api';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [trendsRes, breakdownRes, forecastRes] = await Promise.all([
        analyticsService.monthlyTrends({ months: 12 }),
        analyticsService.categoryBreakdown({ months: 3 }),
        analyticsService.forecast(),
      ]);

      setTrends(trendsRes.data);
      setBreakdown(breakdownRes.data);
      setForecast(forecastRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="section-title mb-2">Financial Analytics</h1>
          <p className="text-muted">Deep dive into your spending patterns</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Average Monthly</p>
                <h3 className="text-3xl font-black text-accent">
                  ${forecast?.average_monthly?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <TrendingUp className="text-accent/30" size={40} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Highest Month</p>
                <h3 className="text-3xl font-black text-accent2">
                  ${Math.max(...(forecast?.actual?.map((m: any) => m[1]) || [0])).toFixed(2)}
                </h3>
              </div>
              <Target className="text-accent2/30" size={40} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Next Month (Forecast)</p>
                <h3 className="text-3xl font-black text-accent3">
                  ${forecast?.forecast?.[0]?.forecast?.toFixed(2) || '0.00'}
                </h3>
              </div>
              <TrendingDown className="text-accent3/30" size={40} />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {trends && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Chart data={trends} type="line" title="12-Month Spending Trend" />
            </motion.div>
          )}

          {breakdown && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Chart data={breakdown} type="doughnut" title="Category Breakdown" />
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
