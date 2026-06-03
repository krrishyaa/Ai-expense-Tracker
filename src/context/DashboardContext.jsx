import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useExpenses } from '../hooks/useExpenses'
import { useBudgets } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const { user, logout } = useAuth()
  const {
    expenses,
    loading: expensesLoading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses()
  const {
    budgets,
    loading: budgetsLoading,
    alerts,
    fetchBudgets,
    createBudget,
    deleteBudget,
  } = useBudgets()
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    createCategory,
    deleteCategory,
  } = useCategories()

  const [activeTab, setActiveTab] = useState('expenses')
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchExpenses(), fetchBudgets(), fetchCategories()])
  }, [fetchExpenses, fetchBudgets, fetchCategories])

  useEffect(() => {
    if (user) {
      fetchExpenses()
      fetchBudgets()
      fetchCategories()
    }
  }, [user, fetchExpenses, fetchBudgets, fetchCategories])

  const bannerAlerts = useMemo(() => {
    return alerts.map((alert) => {
      const category = categories.find((c) => c.id === alert.category_id)
      const percent = Math.round((alert.spent / alert.amount) * 100)
      return {
        id: alert.id,
        categoryName: category?.name ?? 'Category',
        percent,
        alertLevel: alert.alertLevel,
      }
    })
  }, [alerts, categories])

  const value = useMemo(
    () => ({
      user,
      logout,
      activeTab,
      setActiveTab,
      addExpenseOpen,
      setAddExpenseOpen,
      refreshAll,
      bannerAlerts,
      expenses,
      expensesLoading,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
      budgets,
      budgetsLoading,
      fetchBudgets,
      createBudget,
      deleteBudget,
      categories,
      categoriesLoading,
      fetchCategories,
      createCategory,
      deleteCategory,
    }),
    [
      user,
      logout,
      activeTab,
      addExpenseOpen,
      refreshAll,
      bannerAlerts,
      expenses,
      expensesLoading,
      fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
      budgets,
      budgetsLoading,
      fetchBudgets,
      createBudget,
      deleteBudget,
      categories,
      categoriesLoading,
      fetchCategories,
      createCategory,
      deleteCategory,
    ],
  )

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
