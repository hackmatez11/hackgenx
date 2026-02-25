create table public.opd_queue (
  id uuid not null default gen_random_uuid (),
  appointment_id uuid null,
  patient_name text not null,
  disease text not null,
  token_number text null,
  doctor_id uuid null,
  queue_position integer not null,
  status text null default 'waiting'::text,
  entered_queue_at timestamp with time zone null default now(),
  consultation_started_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  estimated_wait_minutes numeric null,
  actual_wait_minutes numeric null,
  created_at timestamp with time zone null default now(),
  constraint opd_queue_pkey primary key (id),
  constraint opd_queue_appointment_id_fkey foreign KEY (appointment_id) references appointments (id) on delete CASCADE,
  constraint opd_queue_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null,
  constraint opd_queue_status_check check (
    (
      status = any (
        array[
          'waiting'::text,
          'in_progress'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_opd_queue_doctor_id on public.opd_queue using btree (doctor_id) TABLESPACE pg_default;

create index IF not exists idx_opd_queue_status on public.opd_queue using btree (status) TABLESPACE pg_default;

create index IF not exists idx_opd_queue_position on public.opd_queue using btree (queue_position) TABLESPACE pg_default;

create index IF not exists idx_opd_queue_entered_at on public.opd_queue using btree (entered_queue_at) TABLESPACE pg_default;