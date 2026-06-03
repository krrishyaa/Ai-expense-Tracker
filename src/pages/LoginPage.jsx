import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import AuthParticles from '../components/particles/AuthParticles'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const FLOATING_FEATURES = [
  { icon: '₹', label: 'Track expenses', color: '#4f8ef7' },
  { icon: '🧠', label: 'AI insights', color: '#00c9a7' },
  { icon: '📊', label: 'Smart budgets', color: '#a78bfa' },
  { icon: '🎙️', label: 'Voice input', color: '#f5a623' },
]

function FloatingBadge({ icon, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-3 rounded-full border px-4 py-2.5"
      style={{
        background: 'rgba(18,20,31,0.8)',
        borderColor: `${color}30`,
        boxShadow: `0 0 20px ${color}20`,
      }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
    </motion.div>
  )
}

function AnimatedLogo() {
  return (
    <motion.div
      className="relative flex items-center justify-center w-16 h-16"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer ring */}
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full">
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(79,142,247,0.2)" strokeWidth="1" strokeDasharray="8 4" />
      </svg>
      {/* Inner gradient circle */}
      <motion.div
        className="w-10 h-10 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #4f8ef7 0%, #00c9a7 100%)',
          boxShadow: '0 0 30px rgba(79,142,247,0.4)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex items-center justify-center h-full text-white font-display font-bold text-xl">₹</div>
      </motion.div>
    </motion.div>
  )
}

export default function LoginPage() {
  const { login, resendConfirmationEmail } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('')
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUnconfirmedEmail('')
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.code === 'EMAIL_NOT_CONFIRMED' && err.email) {
        setUnconfirmedEmail(err.email)
      }
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!unconfirmedEmail) return
    setResending(true)
    try {
      await resendConfirmationEmail(unconfirmedEmail)
      toast.success('Confirmation email sent. Check inbox and spam.')
    } catch (err) {
      toast.error(err.message || 'Could not resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] flex">
      <AuthParticles />

      {/* ── Left hero panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative z-10 px-12 py-16">
        {/* Animated logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-16"
        >
          <AnimatedLogo />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-bold leading-tight text-center mb-6"
        >
          <span className="gradient-text">Smart money,</span>
          <br />
          <span className="text-[var(--text-primary)]">effortlessly tracked.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-[var(--text-secondary)] text-center text-base max-w-sm mb-16"
        >
          AI-powered expense tracking that learns your habits and helps you save more every month.
        </motion.p>

        {/* Floating feature badges */}
        <div className="relative flex flex-col gap-4">
          {FLOATING_FEATURES.map((f, i) => (
            <FloatingBadge key={f.label} {...f} delay={0.5 + i * 0.12} />
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <AnimatedLogo />
          </div>

          {/* Form card */}
          <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-lg)] relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
              background: 'linear-gradient(90deg, #4f8ef7, #00c9a7, #a78bfa, #4f8ef7)',
              backgroundSize: '200% auto',
              animation: 'gradient-shift 4s linear infinite',
            }} />

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-2xl font-semibold text-[var(--text-primary)]"
            >
              Sign in
            </motion.h2>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              Welcome back. Enter your credentials to continue.
            </p>

            <div className="my-6 border-t border-[var(--border-subtle)]" />

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  label="Username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="!bg-[var(--bg-raised)]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="!bg-[var(--bg-raised)]"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="text-[var(--text-muted)] p-1 hover:text-[var(--text-secondary)] transition-colors"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  type="submit"
                  className="w-full !py-3 !rounded-[12px] !text-sm !font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #4f8ef7, #5b9ef8)',
                    boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
                  }}
                  loading={loading}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </Button>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-[12px] border border-[var(--red-muted)] bg-[var(--bg-raised)] p-4 space-y-3">
                      <p className="text-sm text-[var(--red)]">{error}</p>
                      {unconfirmedEmail && (
                        <>
                          <p className="text-xs text-[var(--text-muted)]">
                            Turn off &quot;Confirm email&quot; in Supabase Dashboard → Authentication → Providers → Email for instant access while testing.
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full !py-2"
                            loading={resending}
                            onClick={handleResend}
                          >
                            Resend to {unconfirmedEmail}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>Don&apos;t have an account?</span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors"
              >
                Create one <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}