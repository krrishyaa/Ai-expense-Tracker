import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const TABS = [
  { id: 'expenses',   label: 'Expenses' },
  { id: 'budgets',    label: 'Budgets' },
  { id: 'categories', label: 'Categories' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'insights',   label: 'Insights' },
  { id: 'reports',    label: 'Reports' },
]

export default function TabBar({ activeTab, onChange, className }) {
  const refs = useRef([])

  const onKeyDown = useCallback(
    (e, index) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const next =
        e.key === 'ArrowRight'
          ? (index + 1) % TABS.length
          : (index - 1 + TABS.length) % TABS.length
      onChange(TABS[next].id)
      refs.current[next]?.focus()
    },
    [onChange],
  )

  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto scrollbar-hide border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-lg px-4 py-2',
        className,
      )}
    >
      {TABS.map((tab, i) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative shrink-0 px-4 py-2 text-sm font-medium rounded-[10px] transition-all duration-150 whitespace-nowrap',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50',
              active
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]',
            )}
          >
            {active && (
              <motion.span
                layoutId="tab-active"
                className="absolute inset-0 rounded-[10px]"
                style={{
                  background: 'var(--accent-muted)',
                  border: '1px solid rgba(79,142,247,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { TABS }