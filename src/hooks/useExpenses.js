import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(
    async (filters = {}) => {
      if (!user) {
        setExpenses([])
        return
      }

      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (filters.categoryId) {
          query = query.eq('category_id', filters.categoryId)
        }
        if (filters.startDate) {
          query = query.gte('date', filters.startDate)
        }
        if (filters.endDate) {
          query = query.lte('date', filters.endDate)
        }

        const { data, error: fetchError } = await query
        if (fetchError) throw fetchError
        setExpenses(data ?? [])
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const createExpense = useCallback(
    async (data) => {
      if (!user) throw new Error('Not authenticated')

      const { data: created, error: createError } = await supabase
        .from('expenses')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()

      if (createError) throw createError
      setExpenses((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateExpense = useCallback(
    async (id, data) => {
      if (!user) throw new Error('Not authenticated')

      const { data: updated, error: updateError } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    [user],
  )

  const deleteExpense = useCallback(
    async (id) => {
      if (!user) throw new Error('Not authenticated')

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    },
    [user],
  )

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
