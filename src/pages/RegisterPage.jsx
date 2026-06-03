import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import AuthParticles from '../components/particles/AuthParticles'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const STEPS = [
  { id: 'credentials', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'complete', label: 'Done' },
]

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
]

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444' },
  { name: 'Transportation', color: '#3b82f6' },
  { name: 'Shopping', color: '#8b5cf6' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Healthcare', color: '#10b981' },
  { name: 'Utilities', color: '#f59e0b' },
]

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildFieldErrors({ username, email, password, confirm }) {
  return {
    username: username.length >= 3 ? '' : 'Username must be at least 3 characters',
    email: validateEmail(email) ? '' : 'Enter a valid email address',
    password: password.length >= 8 ? '' : 'Password must be at least 8 characters',
    confirm: password === confirm ? '' : 'Passwords do not match',
  }
}

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const isDone = i < current
        const isActive = i === current
        return (
          <div key={step.id} className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300"
              animate={{
                background: isDone || isActive ? 'var(--accent)' : 'transparent',
                borderColor: isDone || isActive ? 'var(--accent)' : 'var(--border-default)',
              }}
            >
              {isDone ? (
                <Check size={14} className="text-white" />
              ) : (
                <span className={isActive ? 'text-white' : 'text-[var(--text-muted)]'}>{i + 1}</span>
              )}
            </motion.div>
            <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <motion.div
                className="w-8 h-[2px] rounded-full"
                animate={{ background: i < current ? 'var(--accent)' : 'var(--border-dim)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterPage() {
  const { register, resendConfirmationEmail } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)

  /* Profile step */
  const [displayName, setDisplayName] = useState('')
  const [currency, setCurrency] = useState('INR')

  /* Done step */
  const [pendingEmail, setPendingEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleStep1 = () => {
    const nextErrors = buildFieldErrors({ username, email, password, confirm })
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    setDisplayName(username)
    setStep(1)
  }

  const handleStep2 = () => {
    if (!displayName.trim()) {
      setErrors({ displayName: 'Please enter your display name' })
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPendingEmail('')
    try {
      const result = await register(email, password, username, { displayName, currency })
      if (result.needsEmailConfirmation) {
        setPendingEmail(email.trim().toLowerCase())
        toast.success('Account created! Check your email to confirm.', { duration: 6000 })
      } else if (result.session) {
        toast.success('Account created — you are signed in')
        navigate('/dashboard', { replace: true })
      } else {
        toast.success('Account created')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed', { duration: 6000 })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setResending(true)
    try {
      await resendConfirmationEmail(pendingEmail)
      toast.success('Confirmation email sent.')
    } catch (err) {
      toast.error(err.message || 'Could not resend email')
    } finally {
      setResending(false)
    }
  }

  const currencyData = CURRENCIES.find((c) => c.code === currency)

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 lg:p-8">
      <AuthParticles />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{
            background: 'linear-gradient(135deg, #4f8ef7, #00c9a7)',
            boxShadow: '0 0 30px rgba(79,142,247,0.3)',
          }}>
            <span className="text-white font-display font-bold text-lg">₹</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Start tracking your finances in minutes.
          </p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* Card */}
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-lg)] relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: 'linear-gradient(90deg, #4f8ef7, #00c9a7)',
          }} />

          <AnimatePresence mode="wait">
            {/* Step 0: Credentials */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Your credentials</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Choose a username and secure password.</p>
                </div>
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearFieldError('username') }}
                  error={errors.username}
                  autoComplete="username"
                  placeholder="e.g. rahul_dev"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                  error={errors.email}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                  error={errors.password}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  suffix={
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="text-[var(--text-muted)] p-1 hover:text-[var(--text-secondary)]">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="Confirm password"
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); clearFieldError('confirm') }}
                  error={errors.confirm}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
                <Button
                  type="button"
                  className="w-full !py-3 !rounded-[12px]"
                  style={{
                    background: 'linear-gradient(135deg, #4f8ef7, #5b9ef8)',
                    boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
                  }}
                  onClick={handleStep1}
                >
                  Continue <ArrowRight size={16} />
                </Button>
                <p className="text-center text-sm text-[var(--text-muted)]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[var(--accent)] hover:underline font-medium">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 1: Profile */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Personalize your space</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">How should we call you?</p>
                </div>

                <Input
                  label="Display name"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); clearFieldError('displayName') }}
                  error={errors.displayName}
                  placeholder="How you'd like to be greeted"
                />

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-3 tracking-wide uppercase">
                    Currency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CURRENCIES.map((c) => (
                      <motion.button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-sm transition-all"
                        style={{
                          background: currency === c.code ? 'var(--accent-muted)' : 'var(--bg-raised)',
                          borderColor: currency === c.code ? 'var(--accent)' : 'var(--border-dim)',
                          color: currency === c.code ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="font-medium">{c.code}</span>
                        <span className="text-xs text-[var(--text-muted)] hidden sm:block">{c.symbol}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Category preview */}
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-2 tracking-wide uppercase">
                    Default categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <span
                        key={cat.name}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                        style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="!py-3" onClick={() => setStep(0)}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 !py-3 !rounded-[12px]"
                    style={{
                      background: 'linear-gradient(135deg, #4f8ef7, #5b9ef8)',
                      boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
                    }}
                    onClick={handleStep2}
                  >
                    Continue <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Summary card */}
                <div className="rounded-[14px] border border-[var(--border-dim)] bg-[var(--bg-raised)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Username</span>
                    <span className="font-medium text-[var(--text-primary)]">{username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Name</span>
                    <span className="font-medium text-[var(--text-primary)]">{displayName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Currency</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {currencyData?.flag} {currencyData?.code} ({currencyData?.symbol})
                    </span>
                  </div>
                </div>

                {pendingEmail ? (
                  /* Pending confirmation */
                  <div className="space-y-4 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'var(--accent-muted)' }}
                    >
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </motion.div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Check your inbox</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        We sent a confirmation link to{' '}
                        <span className="font-medium text-[var(--text-primary)]">{pendingEmail}</span>.
                        Open it to activate your account.
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      For instant access while testing: Supabase → Authentication → Providers → Email → turn off &quot;Confirm email&quot;.
                    </p>
                    <Button type="button" variant="ghost" className="w-full" loading={resending} onClick={handleResend}>
                      Resend confirmation email
                    </Button>
                    <Link to="/login" className="block text-sm text-[var(--accent)] hover:underline">
                      Go to sign in
                    </Link>
                  </div>
                ) : (
                  /* Ready to create */
                  <>
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                        style={{
                          background: 'linear-gradient(135deg, #4f8ef7, #00c9a7)',
                          boxShadow: '0 0 40px rgba(79,142,247,0.3)',
                        }}
                      >
                        <Sparkles size={24} className="text-white" />
                      </motion.div>
                      <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Ready to go!</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Your account will be created and you&apos;ll be signed in.
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Button
                        type="submit"
                        className="w-full !py-3 !rounded-[12px]"
                        style={{
                          background: 'linear-gradient(135deg, #4f8ef7, #5b9ef8)',
                          boxShadow: '0 4px 20px rgba(79,142,247,0.35)',
                        }}
                        loading={loading}
                      >
                        Create account <Check size={16} />
                      </Button>
                      <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
                        <ArrowLeft size={14} /> Back to edit
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}