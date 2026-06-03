import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { generateRoast, fireRoastNotification } from '../lib/ai'
import { useAuth } from './useAuth'

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function sumSpentByCategory(expenseRows) {
  const totals = {}
  for (const row of expenseRows ?? []) {
    const id = row.category_id
    totals[id] = (totals[id] ?? 0) + Number(row.amount)
  }
  return totals
}

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([])
      return
    }

    setLoading(true)
    try {
      const { data: budgetRows, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetError) throw budgetError

      const { data: categoryRows, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)

      if (categoryError) throw categoryError

      const categoryMap = Object.fromEntries(
        (categoryRows ?? []).map((c) => [c.id, c.name]),
      )

      const { startDate, endDate } = getCurrentMonthRange()
      const { data: monthExpenses, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (expenseError) throw expenseError

      const spentByCategory = sumSpentByCategory(monthExpenses)
      const withSpent = (budgetRows ?? []).map((budget) => ({
        ...budget,
        spent: spentByCategory[budget.category_id] ?? 0,
        category_name: categoryMap[budget.category_id] ?? 'Category',
      }))

      const monthKey = format(new Date(), 'yyyy-MM')
      withSpent.forEach((budget) => {
        if (budget.spent > budget.amount) {
          const key = `roasted_${budget.id}_${monthKey}`
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, 'true')
            generateRoast(
              budget.category_name,
              budget.amount,
              budget.spent,
              budget.spent - budget.amount,
              monthExpenses ?? [],
              budget.category_id,
            ).then((roast) => {
              fireRoastNotification(
                roast,
                budget.category_name,
                budget.spent,
                budget.amount,
              )
            })
          }
        }
      })

      setBudgets(withSpent)
    } finally {
      setLoading(false)
    }
  }, [user])

  const alerts = useMemo(() => {
    return budgets
      .filter((b) => b.amount > 0 && b.spent / b.amount >= 0.8)
      .map((b) => ({
        ...b,
        alertLevel: b.spent / b.amount >= 1 ? 'critical' : 'warning',
      }))
  }, [budgets])

  const createBudget = useCallback(
    async (data) => {
      if (!user) throw new Error('Not authenticated')

      const { data: created, error } = await supabase
        .from('budgets')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      await fetchBudgets()
      return created
    },
    [user, fetchBudgets],
  )

  const deleteBudget = useCallback(
    async (id) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    },
    [user],
  )

  return { budgets, loading, alerts, fetchBudgets, createBudget, deleteBudget }
}
