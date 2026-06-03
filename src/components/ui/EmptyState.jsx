import Button from './Button'

function ReceiptIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect x="16" y="8" width="32" height="48" rx="4" stroke="rgba(79,142,247,0.4)" strokeWidth="2" />
      <path d="M24 20h16M24 28h16M24 36h10" stroke="rgba(238,240,246,0.3)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ReceiptIcon />
      <h3 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
