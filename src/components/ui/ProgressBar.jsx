import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function ProgressBar({ percent = 0, className }) {
  const pct = Math.min(Math.max(percent, 0), 100)
  const color =
    pct >= 100 ? 'var(--accent-red)' : pct >= 80 ? 'var(--accent-amber)' : 'var(--accent-teal)'

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-[var(--bg-raised)]', className)}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: '0%' }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
