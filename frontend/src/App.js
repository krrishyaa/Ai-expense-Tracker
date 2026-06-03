import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import './styles/globals.css';
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const loading = useAuthStore((state) => state.loading);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block", children: _jsx("div", { className: "w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" }) }), _jsx("p", { className: "text-muted mt-4", children: "Loading..." })] }) }));
    }
    return isAuthenticated ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login" });
};
function App() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    useEffect(() => {
        // Initialize auth on app load
        initializeAuth();
    }, [initializeAuth]);
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/analytics", element: _jsx(ProtectedRoute, { children: _jsx(AnalyticsPage, {}) }) }), _jsx(Route, { path: "/ai-insights", element: _jsx(ProtectedRoute, { children: _jsx(AIInsightsPage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard" }) })] }) }));
}
export default App;
