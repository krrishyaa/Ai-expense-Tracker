import { cn } from '../../lib/utils'

export default function Spinner({ className, size = 16 }) {
  return (
    <span
      className={cn('inline-block rounded-full border-2 border-current border-t-transparent animate-spin', className)}
      style={{ width: size, height: size }}
      aria-hidden
    />
  )
}
