import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { cn } from '../../lib/utils'

function easeOutExpo(t, b, c, d) {
  return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b
}

export default function StatCard({ label, value, prefix = '', suffix = '', decimals = 0, delta, className }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const num = Number(value) || 0

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]',
        'hover:shadow-[var(--shadow-elevated)] transition-shadow duration-150',
        className,
      )}
    >
      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
        {inView ? (
          <CountUp
            end={num}
            duration={1.2}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            useEasing
            easingFn={easeOutExpo}
          />
        ) : (
          `${prefix}0${suffix}`
        )}
      </p>
      {delta != null && (
        <p
          className={cn(
            'mt-1 text-xs font-medium',
            delta.direction === 'up' ? 'text-[var(--accent-teal)]' : 'text-[var(--accent-red)]',
          )}
        >
          {delta.direction === 'up' ? '↑' : '↓'} {Math.abs(delta.value)}%
        </p>
      )}
    </motion.div>
  )
}
