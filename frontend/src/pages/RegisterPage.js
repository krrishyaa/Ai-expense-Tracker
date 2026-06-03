import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { supabaseAuthService } from '../services/supabase';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Validate passwords match
            if (formData.password !== formData.password_confirm) {
                throw new Error('Passwords do not match');
            }
            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            // Register with Supabase
            const data = await supabaseAuthService.register(formData.email, formData.password, {
                first_name: formData.first_name,
                last_name: formData.last_name,
            });
            // Get the session and user
            const { session, user } = data;
            if (session && user) {
                setAuth(user, session);
                setSuccess(true);
                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            }
            else {
                setError('Account created successfully! Please check your email to confirm.');
                setSuccess(true);
            }
        }
        catch (err) {
            const errorMessage = err.message || err?.response?.data?.detail || 'Registration failed';
            setError(errorMessage);
            console.error('Registration error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    if (success && !error) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, className: "w-full max-w-md text-center", children: [_jsx("div", { className: "w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-10 h-10 text-green-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h2", { className: "text-2xl font-bold mb-2", children: "Account Created!" }), _jsx("p", { className: "text-muted mb-4", children: "Redirecting to dashboard..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3 flex items-center justify-center px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-accent to-accent2 rounded-2xl flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-3xl", children: "\uD83D\uDCB0" }) }), _jsx("h1", { className: "text-4xl font-black mb-2", children: "Get Started" }), _jsx("p", { className: "text-muted", children: "Create your expense tracker account" })] }), _jsxs("form", { onSubmit: handleRegister, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { children: _jsx("input", { type: "text", placeholder: "First name", value: formData.first_name, onChange: (e) => setFormData({ ...formData, first_name: e.target.value }), className: "input-field text-sm" }) }), _jsx("div", { children: _jsx("input", { type: "text", placeholder: "Last name", value: formData.last_name, onChange: (e) => setFormData({ ...formData, last_name: e.target.value }), className: "input-field text-sm" }) })] }), _jsx("div", { children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-3.5 text-muted", size: 20 }), _jsx("input", { type: "email", placeholder: "Email address", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "input-field pl-10", required: true })] }) }), _jsx("div", { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3.5 text-muted", size: 20 }), _jsx("input", { type: "password", placeholder: "Password (min 6 characters)", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "input-field pl-10", required: true })] }) }), _jsx("div", { children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3.5 text-muted", size: 20 }), _jsx("input", { type: "password", placeholder: "Confirm password", value: formData.password_confirm, onChange: (e) => setFormData({ ...formData, password_confirm: e.target.value }), className: "input-field pl-10", required: true })] }) }), error && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "p-3 bg-accent3/10 border border-accent3/30 rounded-lg flex gap-2 items-start", children: [_jsx(AlertCircle, { size: 18, className: "text-accent3 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "text-accent3 text-sm", children: error })] })), _jsxs("button", { type: "submit", disabled: loading, className: "w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50", children: [loading ? 'Creating account...' : 'Create Account', _jsx(ArrowRight, { size: 18 })] })] }), _jsxs("p", { className: "text-center text-muted text-sm mt-6", children: ["Already have an account?", ' ', _jsx("button", { onClick: () => navigate('/login'), className: "text-accent hover:text-accent2 font-medium", children: "Sign in" })] })] }) }));
};
export default RegisterPage;
