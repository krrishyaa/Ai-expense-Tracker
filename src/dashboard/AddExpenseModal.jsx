import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import CategorySelect from '../components/ui/CategorySelect'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useSpeech } from '../hooks/useSpeech'
import { categorizeExpense, parseExpenseFromSpeech } from '../lib/ai'
import { cn } from '../lib/utils'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function buildExpenseErrors({ description, amount, categoryId }) {
  const errors = {}
  if ((description || '').trim().length < 3) {
    errors.description = 'Description must be at least 3 characters'
  }
  if (!amount || Number(amount) <= 0) {
    errors.amount = 'Enter a valid amount'
  }
  if (!categoryId) {
    errors.category = 'Select a category'
  }
  return errors
}

export default function AddExpenseModal({ open, onClose, categories, createExpense, onSuccess }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [errors, setErrors] = useState({})
  const [parsingVoice, setParsingVoice] = useState(false)
  const [categorizing, setCategorizing] = useState(false)
  const [aiNote, setAiNote] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const parsingLockRef = useRef(false)

  const applyCategoryByName = useCallback(
    (name) => {
      const match = categories.find((c) => c.name.toLowerCase() === (name || '').toLowerCase())
      if (match) setCategoryId(match.id)
    },
    [categories],
  )

  const applyVoiceParse = useCallback(
    async (text) => {
      if (!text?.trim() || parsingLockRef.current) return
      parsingLockRef.current = true
      setParsingVoice(true)
      try {
        const parsed = await parseExpenseFromSpeech(text)
        if (parsed.description) setDescription(parsed.description)
        if (parsed.amount != null && parsed.amount > 0) {
          setAmount(String(parsed.amount))
        }
        if (parsed.categoryName) applyCategoryByName(parsed.categoryName)
        setErrors({})
        setTouched(false)
        setAiNote(true)
        setTimeout(() => setAiNote(false), 3000)
        toast.success('Voice expense parsed')
      } catch {
        toast.error('Could not parse voice input')
      } finally {
        setParsingVoice(false)
        parsingLockRef.current = false
      }
    },
    [applyCategoryByName],
  )

  const handleFinalTranscript = useCallback(
    (text) => {
      applyVoiceParse(text)
    },
    [applyVoiceParse],
  )

  const { transcript, isListening, supported, error: speechError, start, stop, reset } =
    useSpeech({ onFinalTranscript: handleFinalTranscript })

  const runCategorize = useCallback(
    async (text) => {
      if (!text?.trim()) return
      setCategorizing(true)
      try {
        const name = await categorizeExpense(text)
        applyCategoryByName(name)
        setAiNote(true)
        setTimeout(() => setAiNote(false), 3000)
      } finally {
        setCategorizing(false)
      }
    },
    [applyCategoryByName],
  )

  useEffect(() => {
    if (!open) {
      setDescription('')
      setAmount('')
      setCategoryId('')
      setDate(todayISO())
      setRecurring(false)
      setErrors({})
      setTouched(false)
      reset()
    }
  }, [open, reset])

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    const nextErrors = buildExpenseErrors({ description, amount, categoryId })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      await createExpense({
        description: description.trim(),
        amount: Number(amount),
        category_id: categoryId,
        date,
        is_recurring: recurring,
        recurring_frequency: recurring ? frequency : null,
      })
      toast.success('Expense added')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const showErrors = touched

  return (
    <Modal open={open} onClose={onClose} title="Add expense" className="lg:max-w-2xl">
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Input
              label="Description"
              autoFocus
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                clearFieldError('description')
              }}
              error={showErrors ? errors.description : undefined}
            />
            {supported && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="icon"
                    disabled={parsingVoice}
                    onClick={() => {
                      if (isListening) {
                        stop()
                        return
                      }
                      reset()
                      const ok = start()
                      if (!ok && speechError) toast.error(speechError)
                    }}
                    className={cn(isListening && 'ring-2 ring-[#f0455a]/50')}
                    title="Voice input"
                  >
                    <motion.span
                      animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ repeat: isListening ? Infinity : 0, duration: 0.8 }}
                      className="flex items-center gap-1"
                    >
                      {parsingVoice ? <Spinner size={16} /> : <Mic size={16} />}
                      {isListening && (
                        <span className="w-2 h-2 rounded-full bg-[#f0455a]" />
                      )}
                    </motion.span>
                  </Button>
                  {isListening && (
                    <span className="text-xs text-[var(--accent-teal)]">
                      Speak now, then tap the mic to finish
                    </span>
                  )}
                  {!isListening && !parsingVoice && (
                    <span className="text-xs text-[var(--text-muted)]">
                      Example: &quot;500 rupees on Swiggy lunch&quot;
                    </span>
                  )}
                </div>
                {speechError && (
                  <p className="text-xs text-[var(--accent-red)]">{speechError}</p>
                )}
              </div>
            )}
            <AnimatePresence>
              {(isListening || parsingVoice) && transcript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-lg bg-[var(--bg-raised)] p-3 text-sm text-[var(--text-secondary)]"
                >
                  {transcript}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              clearFieldError('amount')
            }}
            error={showErrors ? errors.amount : undefined}
            className="pl-8"
            icon={<span className="text-sm text-[var(--text-muted)]">₹</span>}
          />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1">
                <CategorySelect
                  label="Category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    clearFieldError('category')
                  }}
                  categories={categories}
                  error={showErrors ? errors.category : undefined}
                />
              </div>
              {description.trim().length >= 4 && (
                <button
                  type="button"
                  onClick={() => runCategorize(description)}
                  disabled={categorizing}
                  className="flex items-center gap-1 text-xs text-[var(--accent-blue)] shrink-0 pb-2"
                >
                  {categorizing ? <Spinner size={12} /> : <Sparkles size={12} />}
                  AI Suggest
                </button>
              )}
            </div>
            {aiNote && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">Filled from voice / AI</p>
            )}
          </div>
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => setRecurring((r) => !r)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-150',
                recurring ? 'bg-[#4f8ef7]' : 'bg-[var(--bg-raised)] border border-[var(--border-default)]',
              )}
            >
              <motion.span
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                animate={{ x: recurring ? 20 : 0 }}
                transition={{ duration: 0.15 }}
              />
            </button>
            <span className="text-sm text-[var(--text-primary)]">Recurring expense</span>
          </label>
          <AnimatePresence>
            {recurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" className="w-full" loading={loading}>
            Save expense
          </Button>
        </div>
      </form>
    </Modal>
  )
}
