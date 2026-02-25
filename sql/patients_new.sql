create table public.patients_new (
  id uuid not null default gen_random_uuid (),
  patient_id text null,
  severity text null,
  is_emergency boolean null,
  predicted_stay_days integer null,
  ventilator_needed boolean null,
  dialysis_needed boolean null,
  arrival_time timestamp without time zone null,
  constraint patients_new_pkey primary key (id),
  constraint patients_new_patient_id_key unique (patient_id)
) TABLESPACE pg_default;