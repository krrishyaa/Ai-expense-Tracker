import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function AlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState(new Set())

  const visible = alerts.filter((a) => !dismissed.has(a.id))
  if (!visible.length) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-[var(--border-default)] bg-[var(--bg-raised)] px-4 md:px-6 py-3"
      >
        <div className="flex flex-wrap gap-3">
          {visible.map((alert) => {
            const critical = alert.alertLevel === 'critical'
            return (
              <span
                key={alert.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  critical
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                [{alert.categoryName}] at {alert.percent}% of budget
                <button
                  type="button"
                  onClick={() => setDismissed((s) => new Set(s).add(alert.id))}
                  className="opacity-70 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
