create table public.daily_rounds (
  id uuid not null default gen_random_uuid (),
  bed_queue_id uuid null,
  bed_id uuid null,
  round_date timestamp with time zone null default now(),
  temperature numeric(5, 2) null,
  heart_rate integer null,
  blood_pressure text null,
  oxygen_level numeric(5, 2) null,
  condition_status text not null,
  doctor_notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  icu_queue_id uuid null,
  icu_bed_id uuid null,
  constraint daily_rounds_pkey primary key (id),
  constraint daily_rounds_icu_queue_id_fkey foreign KEY (icu_queue_id) references icu_queue (id) on delete CASCADE,
  constraint daily_rounds_bed_queue_id_fkey foreign KEY (bed_queue_id) references bed_queue (id) on delete CASCADE,
  constraint daily_rounds_bed_id_fkey foreign KEY (bed_id) references beds (bed_id) on delete set null,
  constraint daily_rounds_icu_bed_id_fkey foreign KEY (icu_bed_id) references icu_beds (id) on delete set null,
  constraint daily_rounds_condition_status_check check (
    (
      condition_status = any (
        array[
          'improving'::text,
          'stable'::text,
          'critical'::text
        ]
      )
    )
  ),
  constraint check_queue_source check (
    (
      (
        (bed_queue_id is not null)
        and (icu_queue_id is null)
      )
      or (
        (bed_queue_id is null)
        and (icu_queue_id is not null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_daily_rounds_icu_queue_id on public.daily_rounds using btree (icu_queue_id) TABLESPACE pg_default;