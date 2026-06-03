import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export const Navbar = () => {
    return (_jsx(motion.nav, { initial: { y: -100 }, animate: { y: 0 }, className: "fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur border-b border-gray-800", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-lg font-bold text-white", children: "\uD83D\uDCB0" }) }), _jsx("span", { className: "font-bold text-lg", children: "ExpenseTracker" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { className: "btn-ghost", children: "Dashboard" }), _jsx("button", { className: "btn-ghost", children: "Analytics" }), _jsx("button", { className: "btn-primary", children: "Profile" })] })] }) }));
};
export default Navbar;
