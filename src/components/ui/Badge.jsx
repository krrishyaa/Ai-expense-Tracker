import { cn } from '../../lib/utils'

export default function Badge({ children, color, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        'bg-[var(--bg-raised)] text-[var(--text-secondary)]',
        className,
      )}
    >
      {color && (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      {children}
    </span>
  )
}
