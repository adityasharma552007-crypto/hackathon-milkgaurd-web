create or replace function public.increment_user_scans(
  p_user_id uuid,
  p_is_safe boolean
) returns void as $$
begin
  update public.profiles
  set
    total_scans = total_scans + 1,
    safe_scans  = safe_scans + (case when p_is_safe then 1 else 0 end)
  where id = p_user_id;
end;
$$ language plpgsql security definer;
