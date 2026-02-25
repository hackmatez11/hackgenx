create table public.user_profiles (
  id uuid not null,
  email text not null,
  role text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  street text null,
  city text null,
  state text null,
  zip_code text null,
  country text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  name text null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id),
  constraint user_profiles_role_check check (
    (
      role = any (array['doctor'::text, 'patient'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_location on public.user_profiles using btree (latitude, longitude) TABLESPACE pg_default
where
  (
    (latitude is not null)
    and (longitude is not null)
  );

create index IF not exists idx_user_profiles_city on public.user_profiles using btree (city) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_name on public.user_profiles using btree (name) TABLESPACE pg_default;

create trigger update_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION update_updated_at_column ();