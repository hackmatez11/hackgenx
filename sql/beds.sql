create table public.beds (
  bed_id uuid not null default gen_random_uuid (),
  bed_type text not null,
  status text null default 'available'::text,
  patient_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  bed_number text null,
  notes text null,
  doctor_id uuid null,
  constraint beds_pkey primary key (bed_id),
  constraint beds_bed_number_key unique (bed_number),
  constraint beds_doctor_id_fkey foreign KEY (doctor_id) references auth.users (id) on delete set null,
  constraint beds_patient_id_fkey foreign KEY (patient_id) references patients (id) on delete set null,
  constraint beds_bed_type_check check (
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
  constraint beds_status_check check (
    (
      status = any (
        array[
          'available'::text,
          'occupied'::text,
          'maintenance'::text,
          'reserved'::text,
          'cleaning'::text,
          'critical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_beds_status on public.beds using btree (status) TABLESPACE pg_default;

create index IF not exists idx_beds_bed_type on public.beds using btree (bed_type) TABLESPACE pg_default;

create index IF not exists idx_beds_patient_id on public.beds using btree (patient_id) TABLESPACE pg_default;

create index IF not exists idx_beds_doctor_id on public.beds using btree (doctor_id) TABLESPACE pg_default;

create trigger update_beds_updated_at BEFORE
update on beds for EACH row
execute FUNCTION update_updated_at_column ();