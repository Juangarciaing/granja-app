-- current_piglets is a live counter that must only ever decrease (mortality),
-- never increase — there is no "add a piglet" concept in the v1 scope. The
-- app layer already enforces this (validatePigletCountUpdate), but RLS is the
-- actual write boundary for a public anon key, so the rule is enforced here
-- too as a BEFORE UPDATE trigger.
create or replace function public.enforce_farrowing_counter_decrement_only()
returns trigger
language plpgsql
as $$
begin
  if new.current_piglets > old.current_piglets then
    raise exception 'current_piglets cannot increase (was %, attempted %)',
      old.current_piglets, new.current_piglets;
  end if;
  return new;
end;
$$;

create trigger farrowings_counter_decrement_only
  before update on public.farrowings
  for each row
  when (new.current_piglets is distinct from old.current_piglets)
  execute function public.enforce_farrowing_counter_decrement_only();
