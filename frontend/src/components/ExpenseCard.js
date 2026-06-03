import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Trash2, Edit2 } from 'lucide-react';
export const ExpenseCard = ({ expense, onEdit, onDelete }) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };
    const getCategoryColor = (category) => {
        const colors = {
            food: 'bg-red-500/10 text-red-400 border-red-500/30',
            transport: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            entertainment: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            healthcare: 'bg-green-500/10 text-green-400 border-green-500/30',
            shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
            travel: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
            business: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        };
        return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    };
    return (_jsx(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "card", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg mb-2", children: expense.description }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `text-xs px-3 py-1 rounded-full border ${getCategoryColor(expense.category)}`, children: expense.category_display }), _jsx("span", { className: "text-xs text-muted", children: expense.date })] }), expense.ai_insights && (_jsx("p", { className: "text-sm text-muted italic", children: expense.ai_insights }))] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-accent", children: ["$", expense.amount] }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [onEdit && (_jsx("button", { onClick: () => onEdit(expense), className: "p-2 hover:bg-bg2 rounded transition-colors", children: _jsx(Edit2, { size: 16, className: "text-muted hover:text-text" }) })), onDelete && (_jsx("button", { onClick: () => onDelete(expense.id), className: "p-2 hover:bg-bg2 rounded transition-colors", children: _jsx(Trash2, { size: 16, className: "text-muted hover:text-accent3" }) }))] })] })] }) }));
};
export default ExpenseCard;
