create table public.discharge_predictions (
  id uuid not null default gen_random_uuid (),
  bed_queue_id uuid null,
  round_id uuid null,
  predicted_discharge_date date null,
  remaining_days integer null,
  confidence numeric(5, 2) null,
  reasoning text null,
  created_at timestamp with time zone null default now(),
  icu_queue_id uuid null,
  constraint discharge_predictions_pkey primary key (id),
  constraint discharge_predictions_icu_queue_id_round_id_key unique (icu_queue_id, round_id),
  constraint discharge_predictions_bed_queue_id_round_id_key unique (bed_queue_id, round_id),
  constraint discharge_predictions_icu_queue_id_fkey foreign KEY (icu_queue_id) references icu_queue (id) on delete CASCADE,
  constraint discharge_predictions_bed_queue_id_fkey foreign KEY (bed_queue_id) references bed_queue (id) on delete CASCADE,
  constraint discharge_predictions_round_id_fkey foreign KEY (round_id) references daily_rounds (id) on delete set null,
  constraint check_queue_source_predictions check (
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

create index IF not exists idx_discharge_predictions_icu_queue_id on public.discharge_predictions using btree (icu_queue_id) TABLESPACE pg_default;