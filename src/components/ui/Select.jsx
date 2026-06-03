import { cn } from '../../lib/utils'

export default function Select({ label, error, className, children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-[var(--text-muted)] mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm text-[var(--text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]',
          error && 'border-[#f0455a]/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-[#f0455a]">{error}</p>}
    </div>
  )
}
