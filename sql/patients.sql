create table public.patients (
  id uuid not null default gen_random_uuid (),
  name text not null,
  age integer not null,
  phone text not null,
  token_number text null,
  current_stage text null default 'registration'::text,
  priority_level text null default 'normal'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  street text null,
  city text null,
  state text null,
  zip_code text null,
  country text null,
  constraint patients_pkey primary key (id),
  constraint patients_token_number_key unique (token_number),
  constraint patients_age_check check (
    (
      (age > 0)
      and (age < 150)
    )
  ),
  constraint patients_priority_level_check check (
    (
      priority_level = any (
        array[
          'low'::text,
          'normal'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_patients_city on public.patients using btree (city) TABLESPACE pg_default;

create index IF not exists idx_patients_token_number on public.patients using btree (token_number) TABLESPACE pg_default;

create index IF not exists idx_patients_current_stage on public.patients using btree (current_stage) TABLESPACE pg_default;

create index IF not exists idx_patients_priority_level on public.patients using btree (priority_level) TABLESPACE pg_default;

create trigger generate_patient_token BEFORE INSERT on patients for EACH row
execute FUNCTION generate_token_number ();

create trigger update_patients_updated_at BEFORE
update on patients for EACH row
execute FUNCTION update_updated_at_column ();