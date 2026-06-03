import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { TrendingUp, Tag, AlertTriangle, Lightbulb, Send } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { generateInsights, chatResponse, filterByPeriod } from '../lib/ai'
import { formatCurrency, truncate } from '../lib/utils'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const SUGGESTION_CHIPS = [
  { label: 'Monthly total', query: 'How much did I spend this month?' },
  { label: 'Budget status', query: 'What is my budget status?' },
  { label: 'Top category', query: 'Which category do I spend the most on?' },
  { label: 'Daily average', query: 'What is my daily average spend?' },
  { label: 'Biggest expense', query: 'What was my biggest expense this month?' },
  { label: 'Spend trend', query: 'How does this month compare to last month?' },
  { label: 'Savings tip', query: 'Where can I save money?' },
  { label: 'Recurring costs', query: 'What are my recurring expenses?' },
  { label: 'Anomalies', query: 'Any unusual expenses?' },
  { label: 'End of month forecast', query: 'What will I spend by end of month?' },
  { label: 'Category breakdown', query: 'Give me a full category breakdown.' },
  { label: 'Weekly comparison', query: 'Compare my weekly spending.' },
]

function getContextChips(expenses, budgets) {
  const chips = []
  const overBudget = (budgets ?? []).filter((b) => b.spent > b.amount)
  if (overBudget.length > 0) {
    const worst = [...overBudget].sort(
      (a, b) => b.spent / b.amount - a.spent / a.amount,
    )[0]
    chips.push({
      label: `${worst.category_name ?? 'Category'} over budget`,
      query: `How bad is my ${worst.category_name ?? 'category'} overspend?`,
      variant: 'danger',
    })
  }

  const thisMonth = filterByPeriod(expenses, 'this_month').reduce(
    (s, e) => s + Number(e.amount),
    0,
  )
  const lastMonth = filterByPeriod(expenses, 'last_month').reduce(
    (s, e) => s + Number(e.amount),
    0,
  )
  if (thisMonth > lastMonth * 1.1) {
    chips.push({
      label: 'Spending up this month',
      query: 'How does this month compare to last month?',
      variant: 'warning',
    })
  }

  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysGone = today.getDate()
  const projected = daysGone > 0 ? (thisMonth / daysGone) * daysInMonth : thisMonth
  const totalBudget = (budgets ?? []).reduce((s, b) => s + Number(b.amount), 0)
  if (totalBudget > 0 && projected > totalBudget) {
    chips.push({
      label: 'On track to overspend',
      query: 'What will I spend by end of month?',
      variant: 'warning',
    })
  }

  return chips
}

const CHIP_VARIANT_CLASS = {
  danger:
    'border-[#f0455a]/30 text-[#f0455a] bg-[#f0455a]/8 hover:bg-[#f0455a]/15 hover:border-[#f0455a]/40',
  warning:
    'border-[#f5a623]/30 text-[#f5a623] bg-[#f5a623]/8 hover:bg-[#f5a623]/15 hover:border-[#f5a623]/40',
  default:
    'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[#4f8ef7]/40 hover:text-[#4f8ef7] hover:bg-[#4f8ef7]/8',
}

function InsightCard({ icon: Icon, title, value, sub, accent }) {
  return (
    <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <Icon size={18} style={{ color: accent }} />
      <p className="mt-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">{title}</p>
      <p className="mt-2 font-display text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-[var(--text-secondary)]">{sub}</p>}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-raised)] w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function Insights() {
  const { expenses, budgets, categories } = useDashboard()
  const insights = useMemo(() => generateInsights(expenses, budgets), [expenses, budgets])
  const contextChips = useMemo(
    () => getContextChips(expenses, budgets),
    [expenses, budgets],
  )
  const revealRef = useScrollReveal({ y: 24, stagger: 0.08 })
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const threadRef = useRef(null)
  const lastIntentRef = useRef(null)
  const conversationMemoryRef = useRef([])

  const topName =
    categories.find((c) => c.id === insights.topCategory)?.name ?? 'None'

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const submitQuery = useCallback(
    (text) => {
      const trimmed = text.trim()
      if (!trimmed || typing) return

      const previousAssistant = [...conversationMemoryRef.current]
        .reverse()
        .find((m) => m.role === 'assistant')

      setMessages((m) => [...m, { role: 'user', content: trimmed }])
      setInput('')
      setTyping(true)

      const started = Date.now()
      const reply = chatResponse(trimmed, expenses, budgets, categories, {
        previousResponse: previousAssistant?.content,
        previousIntent: lastIntentRef.current,
      })

      const delay = Math.max(0, 400 - (Date.now() - started))
      setTimeout(() => {
        lastIntentRef.current = reply.intent
        const assistantMsg = {
          role: 'assistant',
          content: reply.text,
          expenseCount: reply.expenseCount,
        }
        conversationMemoryRef.current = [
          ...conversationMemoryRef.current,
          { role: 'user', content: trimmed },
          assistantMsg,
        ].slice(-5)
        setMessages((m) => [...m, assistantMsg])
        setTyping(false)
        threadRef.current?.scrollTo({
          top: threadRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, delay)
    },
    [typing, messages, expenses, budgets, categories],
  )

  const handleChipClick = (query) => {
    setInput(query)
    submitQuery(query)
  }

  const send = (e) => {
    e?.preventDefault()
    submitQuery(input)
  }

  return (
    <div className="space-y-6">
      <div ref={revealRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          icon={TrendingUp}
          title="Forecast"
          accent="var(--accent-blue)"
          value={formatCurrency(insights.forecast)}
          sub={`Day ${insights.day} of ${insights.daysInMonth}`}
        />
        <InsightCard
          icon={Tag}
          title="Top category"
          accent="var(--accent-teal)"
          value={topName}
          sub={formatCurrency(insights.topCategoryAmount)}
        />
        <InsightCard
          icon={AlertTriangle}
          title="Anomalies"
          accent="var(--accent-amber)"
          value={insights.anomalies.length ? `${insights.anomalies.length} found` : 'None'}
          sub={
            insights.anomalies.length
              ? insights.anomalies
                  .slice(0, 3)
                  .map((a) => `${truncate(a.description, 24)} ${formatCurrency(a.amount)}`)
                  .join(' · ')
              : 'No unusual activity'
          }
        />
        <InsightCard
          icon={Lightbulb}
          title="Saving tip"
          accent="var(--accent-blue)"
          value="Tip"
          sub={insights.savingTip}
        />
      </div>

      <div className="rounded-[14px] border border-[var(--border-default)] border-t-2 border-t-[#4f8ef7]/20 bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium">Finance assistant</h3>
        </div>
        <div
          ref={threadRef}
          className="h-[280px] overflow-y-auto custom-scrollbar p-4 space-y-3"
        >
          {messages.length === 0 && !typing && (
            <p className="text-sm text-[var(--text-muted)]">
              Ask a question or tap a suggestion chip below.
            </p>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#4f8ef7]/15 rounded-2xl rounded-tr-sm'
                      : 'bg-[var(--bg-raised)] rounded-2xl rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === 'assistant' && msg.expenseCount != null && (
                    <span className="text-[10px] text-[var(--text-disabled)] mt-1 block">
                      {format(new Date(), 'h:mm a')} · Calculated from {msg.expenseCount}{' '}
                      transaction{msg.expenseCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && <TypingDots />}
        </div>

        <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
          {contextChips.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Quick insights
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {contextChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.query)}
                    disabled={typing}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0 disabled:opacity-50 ${CHIP_VARIANT_CLASS[chip.variant] ?? CHIP_VARIANT_CLASS.default}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.query)}
                disabled={typing}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[#4f8ef7]/40 hover:text-[#4f8ef7] hover:bg-[#4f8ef7]/8 transition-all duration-150 flex-shrink-0 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
            />
            <Button type="submit" disabled={typing}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
