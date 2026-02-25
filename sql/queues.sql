create table public.queues (
  id uuid not null default gen_random_uuid (),
  patient_id uuid not null,
  stage_name text not null,
  queue_position integer not null,
  status text null default 'waiting'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint queues_pkey primary key (id),
  constraint queues_patient_id_fkey foreign KEY (patient_id) references patients (id) on delete CASCADE,
  constraint queues_status_check check (
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

create index IF not exists idx_queues_patient_id on public.queues using btree (patient_id) TABLESPACE pg_default;

create index IF not exists idx_queues_stage_name on public.queues using btree (stage_name) TABLESPACE pg_default;

create index IF not exists idx_queues_status on public.queues using btree (status) TABLESPACE pg_default;

create index IF not exists idx_queues_queue_position on public.queues using btree (queue_position) TABLESPACE pg_default;

create trigger update_queues_updated_at BEFORE
update on queues for EACH row
execute FUNCTION update_updated_at_column ();