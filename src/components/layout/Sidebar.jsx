import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  PieChart,
  Tags,
  BarChart3,
  Lightbulb,
  FileText,
  LogOut,
  Plus,
  ChevronDown,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useProfile } from '../../hooks/useProfile'

const NAV = [
  { id: 'expenses',    label: 'Expenses',    icon: Wallet },
  { id: 'budgets',     label: 'Budgets',      icon: PieChart },
  { id: 'categories',  label: 'Categories',   icon: Tags },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3 },
  { id: 'insights',    label: 'Insights',     icon: Lightbulb },
  { id: 'reports',     label: 'Reports',      icon: FileText },
]

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

function SidebarUser({ user, profile }) {
  const [expanded, setExpanded] = useState(false)
  const avatarColor = hashColor(profile?.avatar_seed || user?.id)
  const displayName = profile?.display_name || profile?.username || user?.user_metadata?.username || 'User'
  const initial = getInitial(displayName)

  return (
    <div className="p-3 border-t border-[var(--border-subtle)]">
      <motion.button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        className="flex items-center gap-3 w-full p-2.5 rounded-[12px] transition-all group"
      >
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold text-white shrink-0"
          style={{ background: avatarColor }}
          whileHover={{ scale: 1.05 }}
        >
          {initial}
        </motion.div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">{displayName}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-[var(--text-muted)] shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] space-y-1">
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-all"
              >
                <Settings size={15} />
                Settings
              </button>
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[10px] text-sm text-[var(--red)] hover:bg-[var(--red-muted)] transition-all"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar({ activeTab, onTabChange, user, onLogout }) {
  const { profile } = useProfile()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] z-40">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-bold text-base shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4f8ef7, #00c9a7)',
              boxShadow: '0 4px 16px rgba(79,142,247,0.3)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(79,142,247,0.4)' }}
            transition={{ duration: 0.2 }}
          >
            ₹
          </motion.div>
          <div>
            <span className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              ExpenseAI
            </span>
            <p className="text-[10px] text-[var(--text-muted)] -mt-0.5">Smart finance tracker</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 border-t border-[var(--border-subtle)]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV.map((item, i) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center gap-3 w-full h-11 px-3 rounded-[12px] text-sm transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50',
                active
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]',
              )}
              style={{ transitionProperty: 'background, color, transform' }}
            >
              {active && (
                <>
                  {/* Glow bar */}
                  <motion.div
                    layoutId="sidebar-glow"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #4f8ef7, #00c9a7)',
                      boxShadow: '0 0 12px rgba(79,142,247,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                  {/* Active bg */}
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-[12px]"
                    style={{
                      background: 'var(--accent-muted)',
                      border: '1px solid rgba(79,142,247,0.2)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                </>
              )}
              <Icon size={18} className="relative z-10 shrink-0" style={active ? { color: 'var(--accent)' } : {}} />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <motion.div
                  className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
                  layoutId="sidebar-dot"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Quick-add button */}
      <div className="px-4 mb-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(79,142,247,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-[12px] text-sm font-medium text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #4f8ef7, #5b9ef8)',
            boxShadow: '0 4px 16px rgba(79,142,247,0.3)',
          }}
        >
          <Plus size={16} />
          Add expense
        </motion.button>
      </div>

      {/* User section */}
      <SidebarUser user={user} profile={profile} />
    </aside>
  )
}