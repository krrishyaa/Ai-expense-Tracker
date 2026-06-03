import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Chart from '../components/Chart';
import { analyticsService } from '../services/api';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
export const AnalyticsPage = () => {
    const [trends, setTrends] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [forecast, setForecast] = useState(null);
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
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-bg flex items-center justify-center", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, className: "w-12 h-12 border-2 border-accent border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-bg", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-6 pt-24 pb-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "mb-12", children: [_jsx("h1", { className: "section-title mb-2", children: "Financial Analytics" }), _jsx("p", { className: "text-muted", children: "Deep dive into your spending patterns" })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { staggerChildren: 0.1 }, className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "Average Monthly" }), _jsxs("h3", { className: "text-3xl font-black text-accent", children: ["$", forecast?.average_monthly?.toFixed(2) || '0.00'] })] }), _jsx(TrendingUp, { className: "text-accent/30", size: 40 })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "Highest Month" }), _jsxs("h3", { className: "text-3xl font-black text-accent2", children: ["$", Math.max(...(forecast?.actual?.map((m) => m[1]) || [0])).toFixed(2)] })] }), _jsx(Target, { className: "text-accent2/30", size: 40 })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "Next Month (Forecast)" }), _jsxs("h3", { className: "text-3xl font-black text-accent3", children: ["$", forecast?.forecast?.[0]?.forecast?.toFixed(2) || '0.00'] })] }), _jsx(TrendingDown, { className: "text-accent3/30", size: 40 })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { staggerChildren: 0.1 }, className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [trends && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: _jsx(Chart, { data: trends, type: "line", title: "12-Month Spending Trend" }) })), breakdown && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: _jsx(Chart, { data: breakdown, type: "doughnut", title: "Category Breakdown" }) }))] })] })] }));
};
export default AnalyticsPage;
