import { useMemo } from 'react'
import { cn } from '../../lib/utils'

function dedupeCategories(categories) {
  const seenIds = new Set()
  const seenNames = new Set()
  const list = []
  for (const cat of categories ?? []) {
    if (!cat?.id || seenIds.has(cat.id)) continue
    const nameKey = (cat.name || '').toLowerCase()
    if (seenNames.has(nameKey)) continue
    seenIds.add(cat.id)
    seenNames.add(nameKey)
    list.push(cat)
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export default function CategorySelect({
  label,
  value,
  onChange,
  categories,
  error,
  placeholder = 'Select category',
  className,
}) {
  const options = useMemo(() => dedupeCategories(categories), [categories])

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs text-[var(--text-muted)] mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={cn(
          'w-full rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm text-[var(--text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-base)]',
          error && 'border-[#f0455a]/50',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#f0455a]">{error}</p>}
    </div>
  )
}
