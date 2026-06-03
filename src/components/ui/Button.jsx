import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-[#4f8ef7] hover:bg-[#6aa1f8] text-white border-transparent',
  ghost:
    'bg-transparent border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-white/[0.04]',
  danger:
    'bg-transparent border-[#f0455a]/30 text-[#f0455a] hover:bg-[#f0455a]/10',
  icon: 'bg-transparent border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-white/[0.04] p-0 w-9 h-9 min-w-9',
}

export default function Button({
  variant = 'primary',
  className,
  children,
  loading,
  disabled,
  type = 'button',
  ...props
}) {
  const isIcon = variant === 'icon'

  return (
    <motion.button
      type={type}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] border font-medium text-sm transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]',
        'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]',
        isIcon ? '' : 'px-4 py-2.5',
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={14} /> : children}
    </motion.button>
  )
}
