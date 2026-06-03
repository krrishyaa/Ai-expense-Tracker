import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.warn('Profile fetch failed:', err.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      setProfile(data)
      return data
    },
    [user],
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, fetchProfile, updateProfile }
}