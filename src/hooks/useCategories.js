import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef4444' },
  { name: 'Transportation', color: '#3b82f6' },
  { name: 'Shopping', color: '#8b5cf6' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Healthcare', color: '#10b981' },
  { name: 'Utilities', color: '#f59e0b' },
  { name: 'Education', color: '#06b6d4' },
  { name: 'Travel', color: '#f97316' },
  { name: 'Bills', color: '#6366f1' },
  { name: 'Other', color: '#6b7280' },
]

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error

      if (!data?.length) {
        const rows = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          user_id: user.id,
        }))
        const { data: seeded, error: seedError } = await supabase
          .from('categories')
          .insert(rows)
          .select()

        if (seedError) throw seedError
        setCategories(seeded ?? [])
      } else {
        setCategories(data)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  const createCategory = useCallback(
    async (name, color) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('categories')
        .insert({ name, color, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return data
    },
    [user],
  )

  const deleteCategory = useCallback(
    async (id) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setCategories((prev) => prev.filter((c) => c.id !== id))
    },
    [user],
  )

  return { categories, loading, fetchCategories, createCategory, deleteCategory }
}
