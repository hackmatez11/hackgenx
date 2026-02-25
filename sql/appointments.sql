create table public.appointments (
  id uuid not null default gen_random_uuid (),
  patient_name text not null,
  age integer not null,
  disease text not null,
  phone text not null,
  email text not null,
  appointment_date timestamp with time zone null,
  doctor_id uuid null,
  status text null default 'scheduled'::text,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  token_number text null,
  is_emergency boolean null default false,
  constraint appointments_pkey primary key (id),
  constraint appointments_token_number_key unique (token_number),
  constraint appointments_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null,
  constraint appointments_age_check check (
    (
      (age > 0)
      and (age < 150)
    )
  ),
  constraint appointments_status_check check (
    (
      status = any (
        array[
          'scheduled'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_appointments_doctor_id on public.appointments using btree (doctor_id) TABLESPACE pg_default;

create index IF not exists idx_appointments_status on public.appointments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_appointments_appointment_date on public.appointments using btree (appointment_date) TABLESPACE pg_default;

create index IF not exists idx_appointments_token_number on public.appointments using btree (token_number) TABLESPACE pg_default;

create index IF not exists idx_appointments_is_emergency on public.appointments using btree (is_emergency) TABLESPACE pg_default;

create trigger generate_appointment_token_trigger BEFORE INSERT on appointments for EACH row
execute FUNCTION generate_appointment_token ();

create trigger set_appointment_token BEFORE INSERT on appointments for EACH row
execute FUNCTION generate_appointment_token ();

create trigger update_appointments_updated_at BEFORE
update on appointments for EACH row
execute FUNCTION update_updated_at_column ();