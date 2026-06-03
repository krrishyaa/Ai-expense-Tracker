import { motion } from 'framer-motion'
import { Flame, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoastToast({ t, roast, categoryName, spent, budget }) {
  const overpct = budget > 0 ? Math.round((spent / budget) * 100) : 100
  const fillPct = Math.min(100, overpct)

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={t.visible ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-[360px] rounded-[14px] border border-[rgba(240,69,90,0.25)] bg-[#1a0d0d] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-[#f0455a]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#f0455a]">
            Budget Roast
          </span>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mb-2 mt-3 text-xs text-[var(--text-muted)]">
        {categoryName} • ₹{Math.round(spent).toLocaleString('en-IN')} of ₹
        {Math.round(budget).toLocaleString('en-IN')} budget
      </p>

      <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">{roast}</p>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full bg-[#f0455a]"
          initial={{ width: '0%' }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
