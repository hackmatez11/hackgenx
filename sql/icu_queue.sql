create table public.icu_queue (
  id uuid not null default gen_random_uuid (),
  patient_token text not null,
  patient_name text not null,
  diseases text not null,
  surgery_type text null,
  bed_type text null default 'icu'::text,
  severity text null,
  is_emergency boolean null default false,
  predicted_stay_days integer null,
  ventilator_needed boolean null default false,
  dialysis_needed boolean null default false,
  time timestamp with time zone null default now(),
  doctor_id uuid null,
  original_bed_id uuid null,
  status text null default 'waiting'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  assigned_bed_id text null,
  assigned_bed_label text null,
  admission_time timestamp with time zone null,
  discharge_time timestamp with time zone null,
  discharged_at timestamp with time zone null,
  constraint icu_queue_pkey primary key (id),
  constraint icu_queue_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null,
  constraint icu_queue_original_bed_id_fkey foreign KEY (original_bed_id) references beds (bed_id) on delete set null,
  constraint icu_queue_status_check check (
    (
      status = any (
        array[
          'waiting'::text,
          'admitted'::text,
          'assigned'::text,
          'cancelled'::text,
          'discharged'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_icu_queue_patient_token on public.icu_queue using btree (patient_token) TABLESPACE pg_default;

create index IF not exists idx_icu_queue_status on public.icu_queue using btree (status) TABLESPACE pg_default;

create index IF not exists idx_icu_queue_doctor_id on public.icu_queue using btree (doctor_id) TABLESPACE pg_default;

create index IF not exists idx_icu_queue_assigned_bed on public.icu_queue using btree (assigned_bed_id) TABLESPACE pg_default;

create index IF not exists idx_icu_queue_assigned_bed_id on public.icu_queue using btree (assigned_bed_id) TABLESPACE pg_default;

create trigger update_icu_queue_updated_at BEFORE
update on icu_queue for EACH row
execute FUNCTION update_updated_at_column ();