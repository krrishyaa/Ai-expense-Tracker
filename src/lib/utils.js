import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format as dateFnsFormat, parseISO, isValid } from 'date-fns'

export function cn(...classes) {
  return twMerge(clsx(classes))
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

export function formatDate(dateStr, pattern = 'MMM d, yyyy') {
  if (!dateStr) return ''
  const date = dateStr.includes('T') ? parseISO(dateStr) : parseISO(`${dateStr}T00:00:00`)
  if (!isValid(date)) return dateStr
  return dateFnsFormat(date, pattern)
}

export function truncate(str, maxLength = 32) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 1)}…`
}
