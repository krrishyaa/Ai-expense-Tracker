import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useExpenseStore } from '../store';
import { expenseService, analyticsService, budgetService } from '../services/api';
import Navbar from '../components/Navbar';
import ExpenseCard from '../components/ExpenseCard';
import Chart from '../components/Chart';
import { Plus, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
export const DashboardPage = () => {
    const user = useAuthStore((state) => state.user);
    const expenses = useExpenseStore((state) => state.expenses);
    const setExpenses = useExpenseStore((state) => state.setExpenses);
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
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
        }
        catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
        finally {
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
        return (_jsx("div", { className: "min-h-screen bg-bg flex items-center justify-center", children: _jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity }, className: "w-12 h-12 border-2 border-accent border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-bg", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-6 pt-24 pb-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "mb-12", children: [_jsxs("h1", { className: "section-title mb-2", children: ["Welcome back, ", user?.first_name || 'User', "! \uD83D\uDC4B"] }), _jsx("p", { className: "text-muted", children: "Here's your financial overview" })] }), _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [_jsx(motion.div, { variants: itemVariants, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "Total Spent" }), _jsxs("h3", { className: "text-3xl font-black text-accent", children: ["$", summary?.total_all_time?.toFixed(2) || '0.00'] })] }), _jsx(DollarSign, { className: "text-accent/30", size: 40 })] }) }), _jsx(motion.div, { variants: itemVariants, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "This Month" }), _jsxs("h3", { className: "text-3xl font-black text-accent2", children: ["$", summary?.monthly_total?.toFixed(2) || '0.00'] })] }), _jsx(TrendingUp, { className: "text-accent2/30", size: 40 })] }) }), _jsx(motion.div, { variants: itemVariants, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "This Week" }), _jsxs("h3", { className: "text-3xl font-black text-accent3", children: ["$", summary?.weekly_total?.toFixed(2) || '0.00'] })] }), _jsx(AlertCircle, { className: "text-accent3/30", size: 40 })] }) }), _jsx(motion.div, { variants: itemVariants, className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-muted text-sm mb-1", children: "Expenses Count" }), _jsx("h3", { className: "text-3xl font-black", children: summary?.expense_count || 0 })] }), _jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-lg" })] }) })] }), _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [trends && (_jsx(motion.div, { variants: itemVariants, children: _jsx(Chart, { data: trends, type: "line", title: "Monthly Spending Trend" }) })), _jsxs(motion.div, { variants: itemVariants, className: "card", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Budget Status" }), _jsx("div", { className: "space-y-4", children: budgetStatus.slice(0, 3).map((budget) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: budget.category }), _jsxs("span", { className: `text-sm font-bold ${budget.alert ? 'text-accent3' : 'text-accent2'}`, children: [budget.percentage.toFixed(0), "%"] })] }), _jsx("div", { className: "w-full h-2 bg-bg3 rounded-full overflow-hidden", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${Math.min(budget.percentage, 100)}%` }, transition: { duration: 1 }, className: `h-full rounded-full ${budget.alert
                                                            ? 'bg-gradient-to-r from-accent3 to-accent'
                                                            : 'bg-gradient-to-r from-accent to-accent2'}` }) })] }, budget.budget_id))) })] })] }), _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "section-title", children: "Recent Expenses" }), _jsxs("button", { className: "btn-primary flex items-center gap-2", children: [_jsx(Plus, { size: 18 }), "Add Expense"] })] }), _jsx("div", { className: "space-y-4", children: expenses.map((expense) => (_jsx(ExpenseCard, { expense: expense }, expense.id))) })] })] })] }));
};
export default DashboardPage;
