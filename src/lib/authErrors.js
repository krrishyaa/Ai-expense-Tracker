export function isEmailNotConfirmed(error) {
  const msg = (error?.message ?? '').toLowerCase()
  return (
    msg.includes('email not confirmed') ||
    msg.includes('email not verified') ||
    error?.code === 'email_not_confirmed'
  )
}

export function toFriendlyAuthError(error) {
  const raw = error?.message ?? ''
  const msg = raw.toLowerCase()

  if (
    msg.includes('rate limit') ||
    msg.includes('too many') ||
    error?.status === 429 ||
    error?.code === 'over_email_send_rate_limit'
  ) {
    return new Error(
      'Too many verification emails were sent. Wait 15–60 minutes, then try again. For local testing, you can disable “Confirm email” in Supabase → Authentication → Providers → Email.',
    )
  }

  if (
    msg.includes('already registered') ||
    msg.includes('already been registered') ||
    msg.includes('user already registered')
  ) {
    return new Error('An account with this email already exists. Try signing in instead.')
  }

  if (msg.includes('password') && msg.includes('weak')) {
    return new Error('Choose a stronger password (at least 8 characters).')
  }

  if (msg.includes('invalid email')) {
    return new Error('Enter a valid email address.')
  }

  if (msg.includes('signup is disabled')) {
    return new Error('Sign-up is disabled on this project. Contact the administrator.')
  }

  if (msg.includes('email not confirmed') || msg.includes('email not verified')) {
    return new Error(
      'Confirm your email first. Check your inbox (and spam), or request a new link after the rate limit clears.',
    )
  }

  return new Error(raw || 'Something went wrong. Please try again.')
}
