create table public.medical_reports (
  id uuid not null default gen_random_uuid (),
  bed_queue_id uuid null,
  round_id uuid null,
  file_url text not null,
  report_type text not null,
  ai_summary text null,
  created_at timestamp with time zone null default now(),
  icu_queue_id uuid null,
  constraint medical_reports_pkey primary key (id),
  constraint medical_reports_bed_queue_id_fkey foreign KEY (bed_queue_id) references bed_queue (id) on delete CASCADE,
  constraint medical_reports_icu_queue_id_fkey foreign KEY (icu_queue_id) references icu_queue (id) on delete CASCADE,
  constraint medical_reports_round_id_fkey foreign KEY (round_id) references daily_rounds (id) on delete set null,
  constraint check_queue_source_reports check (
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
  ),
  constraint medical_reports_report_type_check check (
    (
      report_type = any (array['blood'::text, 'xray'::text, 'scan'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_medical_reports_icu_queue_id on public.medical_reports using btree (icu_queue_id) TABLESPACE pg_default;