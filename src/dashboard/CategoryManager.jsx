import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboard } from '../context/DashboardContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { cn } from '../lib/utils'

const PRESETS = [
  '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#06b6d4', '#f97316', '#6366f1', '#6b7280',
]

export default function CategoryManager() {
  const { categories, categoriesLoading, createCategory, deleteCategory, refreshAll } =
    useDashboard()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESETS[0])
  const [loading, setLoading] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createCategory(name.trim(), color)
      toast.success('Category created')
      setName('')
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
      setConfirmId(null)
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-4 max-w-md"
      >
        <h3 className="font-medium text-[var(--text-primary)]">Add category</h3>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-2">Color</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-transform',
                  color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-raised)]"
          />
        </div>
        <Button type="submit" loading={loading}>
          Add category
        </Button>
      </form>

      {categoriesLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={56} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-medium truncate">{cat.name}</span>
              </div>
              <div className="shrink-0">
                {confirmId === cat.id ? (
                  <ConfirmDialog
                    open
                    message="Delete category?"
                    confirmLabel="Yes"
                    onConfirm={() => handleDelete(cat.id)}
                    onCancel={() => setConfirmId(null)}
                    danger
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(cat.id)}
                    className="text-[var(--accent-red)] p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
