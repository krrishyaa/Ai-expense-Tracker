-- DEV ONLY: manually confirm a user when email confirmation is stuck.
-- Replace the email, then run in Supabase → SQL Editor.
-- This does NOT replace turning off "Confirm email" in Dashboard → Authentication → Providers → Email.

-- update auth.users
-- set email_confirmed_at = now(),
--     confirmed_at = coalesce(confirmed_at, now())
-- where email = 'you@example.com';
