create table public.voice_calls (
  id uuid not null default gen_random_uuid (),
  call_id text null,
  phone_number text null,
  action_type text null,
  booking_id text null,
  appointment_date text null,
  status text null,
  transcript text null,
  created_at timestamp with time zone null default now(),
  constraint voice_calls_pkey primary key (id),
  constraint voice_calls_call_id_key unique (call_id)
) TABLESPACE pg_default;