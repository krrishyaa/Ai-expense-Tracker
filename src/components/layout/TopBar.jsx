import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import TabBar from './TabBar'
import { cn } from '../../lib/utils'
import { useProfile } from '../../hooks/useProfile'

function getInitial(str) {
  return (str?.[0] ?? 'U').toUpperCase()
}

function hashColor(seed) {
  if (!seed) return '#4f8ef7'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = ['#4f8ef7', '#00c9a7', '#a78bfa', '#f5a623', '#ec4899', '#10b981', '#f97316']
  return colors[Math.abs(hash) % colors.length]
}

function ProfileMenu({ user, profile, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const avatarColor = hashColor(profile?.avatar_seed || user?.id)

  const handleLogout = async () => {
    setOpen(false)
    await onLogout()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.display_name || profile?.username || user?.user_metadata?.username || 'User'
  const initial = getInitial(displayName)

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 border border-[var(--border-dim)] bg-[var(--bg-raised)] hover:border-[var(--border-default)] transition-all"
      >
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold text-white"
          style={{ background: avatarColor }}
          animate={{ boxShadow: [`0 0 0 0 ${avatarColor}40`, `0 0 0 4px ${avatarColor}00`] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {initial}
        </motion.div>
        <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-[var(--text-muted)]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-12 z-50 w-56 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-overlay)] shadow-[var(--shadow-lg)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-all"
                >
                  <User size={16} />
                  Profile settings
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-all"
                >
                  <Settings size={16} />
                  Preferences
                </button>
              </div>
              <div className="p-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[10px] text-sm text-[var(--red)] hover:bg-[var(--red-muted)] transition-all"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TopBar({ activeTab, onTabChange, user, onLogout, navItems }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { profile } = useProfile()

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-lg">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm" style={{
            background: 'linear-gradient(135deg, #4f8ef7, #00c9a7)',
          }}>₹</div>
          <span className="font-display font-semibold text-sm">ExpenseAI</span>
        </Link>
        <div className="flex items-center gap-2">
          <ProfileMenu user={user} profile={profile} onLogout={onLogout} />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      <TabBar activeTab={activeTab} onChange={onTabChange} className="lg:hidden" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.nav
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-[280px] bg-[var(--bg-overlay)] border-l border-[var(--border-default)] p-5 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-subtle)]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold" style={{
                  background: 'linear-gradient(135deg, #4f8ef7, #00c9a7)',
                }}>₹</div>
                <div>
                  <p className="font-display font-semibold text-sm">ExpenseAI</p>
                  <p className="text-xs text-[var(--text-muted)] truncate max-w-[160px]">{profile?.display_name || user?.email}</p>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onTabChange(item.id); setDrawerOpen(false) }}
                    className={cn(
                      'block w-full text-left px-3 py-2.5 rounded-[10px] text-sm mb-1 transition-all',
                      activeTab === item.id
                        ? 'bg-[var(--accent-muted)] text-[var(--accent)] font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={async () => { setDrawerOpen(false); await onLogout() }}
                className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)] text-sm text-[var(--red)]"
              >
                <LogOut size={16} /> Sign out
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}