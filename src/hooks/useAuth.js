import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toFriendlyAuthError, isEmailNotConfirmed } from '../lib/authErrors'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (username, password) => {
    const trimmed = username?.trim()
    if (!trimmed) throw new Error('Username is required')

    const { data: email, error: lookupError } = await supabase.rpc(
      'get_login_email_for_username',
      { p_username: trimmed },
    )

    if (lookupError) {
      throw new Error(
        lookupError.message?.includes('function')
          ? 'Username login is not set up. Run supabase/username-login.sql in Supabase.'
          : 'Invalid username or password',
      )
    }

    if (!email) {
      throw new Error('Invalid username or password')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      if (isEmailNotConfirmed(error)) {
        const err = new Error(
          'Your email is not confirmed yet. Check your inbox and spam, or resend the confirmation email below.',
        )
        err.code = 'EMAIL_NOT_CONFIRMED'
        err.email = email
        throw err
      }
      throw toFriendlyAuthError(error)
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    return data
  }, [])

  const register = useCallback(async (email, password, username, options = {}) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedUsername = username.trim()
    const displayName = (options.displayName || trimmedUsername)
    const currency = options.currency || 'INR'

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: displayName,
          currency,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw toFriendlyAuthError(error)

    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username: trimmedUsername,
        display_name: displayName,
        currency,
        avatar_seed: Math.random().toString(36).substring(2, 14),
        onboarded: false,
      })
      if (profileError && profileError.code !== '23505') {
        throw toFriendlyAuthError(profileError)
      }
    }

    return {
      ...data,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    }
  }, [])

  const resendConfirmationEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw toFriendlyAuthError(error)
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return { user, loading, login, register, resendConfirmationEmail, logout }
}
