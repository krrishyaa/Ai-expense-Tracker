import { useState, useEffect, useMemo } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import { Pencil, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboard } from '../context/DashboardContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import StatCard from '../components/ui/StatCard'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import CategorySelect from '../components/ui/CategorySelect'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AddExpenseModal from './AddExpenseModal'
import { formatCurrency, formatDate } from '../lib/utils'

function useDebounce(value, delay) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

export default function ExpenseList() {
  const {
    expenses,
    expensesLoading,
    categories,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    refreshAll,
    addExpenseOpen,
    setAddExpenseOpen,
  } = useDashboard()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const gridRef = useScrollReveal({ y: 20, stagger: 0.06 })

  const filterCount = [categoryId, startDate, endDate, debouncedSearch].filter(Boolean).length

  useEffect(() => {
    fetchExpenses({
      categoryId: categoryId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }, [categoryId, startDate, endDate, fetchExpenses])

  const filtered = useMemo(() => {
    let list = expenses
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((e) => e.description?.toLowerCase().includes(q))
    }
    return list
  }, [expenses, debouncedSearch])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const month = expenses
      .filter((e) => new Date(e.date + 'T00:00:00') >= monthStart)
      .reduce((s, e) => s + Number(e.amount), 0)
    return { total, month, count: expenses.length }
  }, [expenses, monthStart])

  const getCat = (id) => categories.find((c) => c.id === id)

  const saveEdit = async (id) => {
    try {
      await updateExpense(id, {
        description: editForm.description,
        amount: Number(editForm.amount),
        category_id: editForm.category_id,
        date: editForm.date,
      })
      toast.success('Expense updated')
      setEditingId(null)
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id)
      toast.success('Expense deleted')
      setConfirmId(null)
      refreshAll()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total expenses" value={stats.total} prefix="₹" />
        <StatCard label="This month" value={stats.month} prefix="₹" />
        <StatCard label="Transactions" value={stats.count} />
      </div>

      <div className="sticky top-14 lg:top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-[var(--bg-base)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[160px]"
          />
          <CategorySelect
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            categories={categories}
            placeholder="All categories"
            className="min-w-[140px]"
          />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button variant="ghost" onClick={clearFilters}>
            Clear{filterCount > 0 ? ` (${filterCount})` : ''}
          </Button>
          <Button className="hidden lg:inline-flex" onClick={() => setAddExpenseOpen(true)}>
            <Plus size={16} /> Add expense
          </Button>
        </div>
      </div>

      {expensesLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Track spending by adding your first expense."
          actionLabel="Add your first expense"
          onAction={() => setAddExpenseOpen(true)}
        />
      ) : (
        <LayoutGroup>
          <div
            ref={gridRef}
            className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
          >
            {filtered.map((expense) => {
              const cat = getCat(expense.category_id)
              const editing = editingId === expense.id
              return (
                <motion.article
                  key={expense.id}
                  layout
                  whileHover={editing ? undefined : { y: -3 }}
                  transition={{ duration: 0.15 }}
                  className="min-h-[120px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]"
                >
                  {editing ? (
                    <motion.div layout className="space-y-3">
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                      <Input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                      />
                      <CategorySelect
                        value={editForm.category_id}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, category_id: e.target.value }))
                        }
                        categories={categories}
                      />
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => saveEdit(expense.id)}>Save</Button>
                        <Button variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.color ?? '#6b7280' }}
                          />
                          <Badge color={cat?.color}>{cat?.name ?? 'Other'}</Badge>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] shrink-0">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <p className="mt-3 text-[15px] font-medium line-clamp-2">{expense.description}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="font-display text-[28px] font-semibold tabular-nums text-[var(--accent-teal)]">
                          {formatCurrency(expense.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="icon"
                            onClick={() => {
                              setConfirmId(null)
                              setEditingId(expense.id)
                              setEditForm({
                                description: expense.description,
                                amount: expense.amount,
                                category_id: expense.category_id,
                                date: expense.date,
                              })
                            }}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button variant="icon" onClick={() => setConfirmId(expense.id)}>
                            <Trash2 size={14} className="text-[var(--accent-red)]" />
                          </Button>
                        </div>
                      </div>
                      <ConfirmDialog
                        open={confirmId === expense.id}
                        message="Delete this expense?"
                        confirmLabel="Yes, delete"
                        onConfirm={() => handleDelete(expense.id)}
                        onCancel={() => setConfirmId(null)}
                        danger
                      />
                    </>
                  )}
                </motion.article>
              )
            })}
          </div>
        </LayoutGroup>
      )}

      <Button
        className="lg:hidden fixed bottom-20 right-5 z-30 shadow-[var(--shadow-elevated)] rounded-full !w-14 !h-14"
        onClick={() => setAddExpenseOpen(true)}
        aria-label="Add expense"
      >
        <Plus size={22} />
      </Button>

      <AddExpenseModal
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        categories={categories}
        createExpense={createExpense}
        onSuccess={refreshAll}
      />
    </div>
  )
}
