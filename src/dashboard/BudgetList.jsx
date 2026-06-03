import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboard } from '../context/DashboardContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import StatCard from '../components/ui/StatCard'
import Select from '../components/ui/Select'
import CategorySelect from '../components/ui/CategorySelect'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Skeleton from '../components/ui/Skeleton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatCurrency, cn } from '../lib/utils'

export default function BudgetList() {
  const {
    budgets,
    budgetsLoading,
    categories,
    createBudget,
    deleteBudget,
    refreshAll,
  } = useDashboard()

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [formOpen, setFormOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const gridRef = useScrollReveal({ y: 20, stagger: 0.06 })

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent ?? 0), 0)
  const onTrack = budgets.filter((b) => b.amount > 0 && (b.spent ?? 0) / b.amount < 0.8).length

  const getCat = (id) => categories.find((c) => c.id === id)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!categoryId || !amount) return
    setLoading(true)
    try {
      await createBudget({ category_id: categoryId, amount: Number(amount), period })
      toast.success('Budget created')
      setCategoryId('')
      setAmount('')
      setFormOpen(false)
      setTimeout(() => setFormOpen(true), 100)
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id)
      toast.success('Budget deleted')
      setConfirmId(null)
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total budgeted" value={totalBudgeted} prefix="₹" />
        <StatCard label="Total spent" value={totalSpent} prefix="₹" />
        <StatCard label="Remaining" value={Math.max(totalBudgeted - totalSpent, 0)} prefix="₹" />
        <StatCard label="On track" value={onTrack} suffix={` / ${budgets.length}`} />
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="flex flex-wrap gap-3 items-end rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
          >
            <CategorySelect
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              categories={categories}
              placeholder="Select"
              className="min-w-[140px]"
            />
            <Input label="Amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </Select>
            <Button type="submit" loading={loading}>
              Add budget
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {budgetsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={140} />
          ))}
        </div>
      ) : (
        <div ref={gridRef} className="grid gap-4 md:grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {budgets.map((budget) => {
            const cat = getCat(budget.category_id)
            const spent = Number(budget.spent ?? 0)
            const limit = Number(budget.amount)
            const pct = limit > 0 ? (spent / limit) * 100 : 0
            const over = spent > limit
            return (
              <motion.article
                key={budget.id}
                whileHover={{ y: -2 }}
                className={cn(
                  'group relative rounded-[14px] border bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]',
                  over ? 'border-[var(--accent-red)]/30' : 'border-[var(--border-default)]',
                )}
              >
                <button
                  type="button"
                  onClick={() => setConfirmId(budget.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent-red)]"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color }} />
                  <h3 className="font-medium">{cat?.name}</h3>
                  <span className="ml-auto text-xs capitalize text-[var(--text-muted)]">{budget.period}</span>
                </div>
                <ProgressBar percent={pct} className="mt-4" />
                <div className="mt-3 flex justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    {formatCurrency(spent)} of {formatCurrency(limit)}
                  </span>
                  <span>{Math.round(pct)}% used</span>
                </div>
                <p className={cn('mt-1 text-sm', over ? 'text-[var(--accent-red)]' : 'text-[var(--accent-teal)]')}>
                  {over
                    ? `${formatCurrency(spent - limit)} over budget`
                    : `${formatCurrency(limit - spent)} remaining`}
                </p>
                <ConfirmDialog
                  open={confirmId === budget.id}
                  message="Delete this budget?"
                  confirmLabel="Yes, delete"
                  onConfirm={() => handleDelete(budget.id)}
                  onCancel={() => setConfirmId(null)}
                  danger
                />
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
