create table public.icu_beds (
  id uuid not null default gen_random_uuid (),
  bed_id text null,
  bed_type text null,
  ventilator_available boolean null,
  dialysis_available boolean null,
  is_available boolean null,
  doctor_id uuid null,
  constraint icu_beds_pkey primary key (id),
  constraint icu_beds_bed_id_key unique (bed_id),
  constraint icu_beds_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_icu_beds_doctor_id on public.icu_beds using btree (doctor_id) TABLESPACE pg_default;