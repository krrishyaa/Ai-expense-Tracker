-- Run in Supabase SQL Editor (after schema.sql) for username-based login

alter table public.profiles
  drop constraint if exists profiles_username_unique;

alter table public.profiles
  add constraint profiles_username_unique unique (username);

create or replace function public.get_login_email_for_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from auth.users u
  inner join public.profiles p on p.id = u.id
  where lower(p.username) = lower(trim(p_username))
  limit 1;
  return v_email;
end;
$$;

revoke all on function public.get_login_email_for_username(text) from public;
grant execute on function public.get_login_email_for_username(text) to anon, authenticated;
