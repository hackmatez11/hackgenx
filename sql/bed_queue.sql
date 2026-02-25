create table public.bed_queue (
  id uuid not null default gen_random_uuid (),
  opd_queue_id uuid null,
  appointment_id uuid null,
  patient_name text not null,
  disease text not null,
  token_number text null,
  age integer null,
  phone text null,
  doctor_id uuid null,
  bed_type text null default 'general'::text,
  bed_id uuid null,
  status text null default 'waiting_for_bed'::text,
  admitted_from_opd_at timestamp with time zone null default now(),
  bed_assigned_at timestamp with time zone null,
  admitted_at timestamp with time zone null,
  discharged_at timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone null default now(),
  estimated_wait_minutes integer null,
  constraint bed_queue_pkey primary key (id),
  constraint bed_queue_bed_id_fkey foreign KEY (bed_id) references beds (bed_id) on delete set null,
  constraint bed_queue_appointment_id_fkey foreign KEY (appointment_id) references appointments (id) on delete set null,
  constraint bed_queue_opd_queue_id_fkey foreign KEY (opd_queue_id) references opd_queue (id) on delete set null,
  constraint bed_queue_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null,
  constraint bed_queue_bed_type_check check (
    (
      bed_type = any (
        array[
          'icu'::text,
          'emergency'::text,
          'general'::text,
          'private'::text,
          'maternity'::text
        ]
      )
    )
  ),
  constraint bed_queue_status_check check (
    (
      status = any (
        array[
          'waiting_for_bed'::text,
          'bed_assigned'::text,
          'admitted'::text,
          'discharged'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_bed_queue_doctor_id on public.bed_queue using btree (doctor_id) TABLESPACE pg_default;

create index IF not exists idx_bed_queue_status on public.bed_queue using btree (status) TABLESPACE pg_default;

create index IF not exists idx_bed_queue_admitted_at on public.bed_queue using btree (admitted_from_opd_at) TABLESPACE pg_default;