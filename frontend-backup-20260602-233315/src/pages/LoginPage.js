import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { supabaseAuthService } from '../services/supabase';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            // Login with Supabase
            const data = await supabaseAuthService.login(email, password);
            const { session, user } = data;
            if (session && user) {
                setAuth(user, session);
                navigate('/dashboard');
            }
            else {
                throw new Error('Login failed - no session');
            }
        }
        catch (err) {
            const errorMessage = err.message || err?.response?.data?.detail || 'Login failed';
            setError(errorMessage);
            console.error('Login error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-accent to-accent2 rounded-2xl flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-3xl", children: "\uD83D\uDCB0" }) }), _jsx("h1", { className: "text-4xl font-black mb-2", children: "AI Expense Tracker" }), _jsx("p", { className: "text-muted", children: "Smart financial intelligence at your fingertips" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3.5 text-muted", size: 20 }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field pl-10", placeholder: "Enter your email", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3.5 text-muted", size: 20 }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "input-field pl-10", placeholder: "Enter your password", required: true })] })] }), error && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "p-3 bg-accent3/10 border border-accent3/30 rounded-lg flex gap-2 items-start", children: [_jsx(AlertCircle, { size: 18, className: "text-accent3 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-accent3 text-sm", children: error })] })), _jsxs("button", { type: "submit", disabled: loading, className: "w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50", children: [loading ? 'Signing in...' : 'Sign In', _jsx(ArrowRight, { size: 18 })] })] }), _jsxs("p", { className: "text-center text-muted text-sm mt-6", children: ["Don't have an account?", ' ', _jsx("button", { onClick: () => navigate('/register'), className: "text-accent hover:text-accent2 font-medium", children: "Sign up" })] })] }) }));
};
export default LoginPage;
