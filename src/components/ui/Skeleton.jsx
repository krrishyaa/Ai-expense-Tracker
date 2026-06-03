import { cn } from '../../lib/utils'

export default function Skeleton({ width = '100%', height = 16, className }) {
  return (
    <div
      className={cn('animate-pulse rounded-[14px] bg-[var(--bg-raised)]', className)}
      style={{ width, height }}
    />
  )
}
