import { cn } from '../../lib/utils'

export default function Input({
  label,
  error,
  icon,
  suffix,
  className,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label className="block text-xs text-[var(--text-muted)] mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]',
            'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]',
            icon && 'pl-10',
            suffix && 'pr-10',
            error && 'border-[#f0455a]/50',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-[#f0455a]">{error}</p>
      )}
    </div>
  )
}
