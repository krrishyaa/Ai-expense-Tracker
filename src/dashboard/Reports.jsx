import { useState, useMemo } from 'react'
import { format, startOfMonth } from 'date-fns'
import toast from 'react-hot-toast'
import { useDashboard } from '../context/DashboardContext'
import StatCard from '../components/ui/StatCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { exportCSV, exportPDF } from '../lib/export'
import { formatCurrency, formatDate } from '../lib/utils'

function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.max(Math.floor((d2 - d1) / 86400000) + 1, 1)
}

export default function Reports() {
  const { expenses, categories } = useDashboard()
  const defaultStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const defaultEnd = format(new Date(), 'yyyy-MM-dd')

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)
  const [applied, setApplied] = useState({ start: defaultStart, end: defaultEnd })
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const getCat = (id) => categories.find((c) => c.id === id)?.name ?? 'Unknown'

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        if (applied.start && e.date < applied.start) return false
        if (applied.end && e.date > applied.end) return false
        return true
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [expenses, applied])

  const summary = useMemo(() => {
    const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
    const days = daysBetween(applied.start || filtered.at(-1)?.date, applied.end || filtered[0]?.date)
    const byCat = {}
    filtered.forEach((e) => {
      byCat[e.category_id] = (byCat[e.category_id] ?? 0) + Number(e.amount)
    })
    let top = 'None'
    let topAmt = 0
    Object.entries(byCat).forEach(([id, amt]) => {
      if (amt > topAmt) {
        topAmt = amt
        top = getCat(id)
      }
    })
    return { total, daily: total / days, count: filtered.length, top }
  }, [filtered, applied, categories])

  const categoryRows = useMemo(() => {
    const byCat = {}
    filtered.forEach((e) => {
      const id = e.category_id
      if (!byCat[id]) byCat[id] = { amount: 0, count: 0 }
      byCat[id].amount += Number(e.amount)
      byCat[id].count += 1
    })
    return Object.entries(byCat)
      .map(([id, v]) => ({ id, name: getCat(id), ...v }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, categories])

  const exportRows = filtered.map((e) => ({
    date: e.date,
    description: e.description,
    category: getCat(e.category_id),
    amount: e.amount,
  }))

  const runExport = async (type) => {
    if (!filtered.length) return
    const setLoading = type === 'csv' ? setCsvLoading : setPdfLoading
    setLoading(true)
    toast.loading(type === 'csv' ? 'Exporting CSV...' : 'Exporting PDF...')
    await new Promise((r) => setTimeout(r, 300))
    if (type === 'csv') {
      exportCSV(exportRows)
      toast.dismiss()
      toast.success('CSV downloaded')
    } else {
      exportPDF(exportRows, {
        total: summary.total,
        count: summary.count,
        dailyAverage: summary.daily,
        topCategory: summary.top,
      })
      toast.dismiss()
      toast.success('PDF downloaded')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-end">
          <Input label="Start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button onClick={() => setApplied({ start: startDate, end: endDate })}>Apply</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={!filtered.length || csvLoading} onClick={() => runExport('csv')}>
            {csvLoading ? <Spinner size={14} /> : 'Export CSV'}
          </Button>
          <Button variant="ghost" disabled={!filtered.length || pdfLoading} onClick={() => runExport('pdf')}>
            {pdfLoading ? <Spinner size={14} /> : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total spend" value={summary.total} prefix="₹" />
        <StatCard label="Avg per day" value={summary.daily} prefix="₹" decimals={2} />
        <StatCard label="Transactions" value={summary.count} />
      </div>

      <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border-subtle)]">
            <tr>
              {['Category', 'Amount', '% of total', 'Transactions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryRows.map((row) => {
              const pct = summary.total > 0 ? (row.amount / summary.total) * 100 : 0
              const cat = categories.find((c) => c.id === row.id)
              return (
                <tr key={row.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-raised)]/60">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color }} />
                      {row.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-raised)] max-w-[120px]">
                        <div
                          className="h-full rounded-full bg-[#4f8ef7]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {formatCurrency(row.amount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{pct.toFixed(1)}%</td>
                  <td className="px-4 py-3">{row.count}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--bg-raised)] border-b border-[var(--border-subtle)]">
            <tr>
              {['Date', 'Description', 'Category', 'Amount'].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[var(--text-muted)] font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr
                key={e.id}
                className={i % 2 === 1 ? 'bg-[var(--bg-raised)]/40' : ''}
              >
                <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(e.date)}</td>
                <td className="px-4 py-3">{e.description}</td>
                <td className="px-4 py-3">{getCat(e.category_id)}</td>
                <td className="px-4 py-3 text-right font-display tabular-nums text-[var(--accent-teal)]">
                  {formatCurrency(e.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
