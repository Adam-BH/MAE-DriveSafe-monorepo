-- DriveGuard Supabase Schema
-- Run this in your Supabase project → SQL Editor

-- DRIVERS
create table if not exists drivers (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  full_name     text not null,
  email         text unique not null,
  phone         text,
  date_of_birth date,
  license_class text,
  license_since date,
  vehicle_make  text,
  vehicle_model text,
  vehicle_year  int,
  vehicle_plate text,
  policy_id     text unique not null,
  policy_type   text check (policy_type in ('third_party','comprehensive','full')) default 'comprehensive',
  premium_monthly numeric(10,2),
  coverage_start  date,
  coverage_end    date,
  enrolled_at     timestamptz default now(),
  app_user_id     uuid references auth.users(id) on delete set null,
  insurer_notes   text
);

-- SESSIONS
create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  driver_id       uuid references drivers(id) on delete cascade not null,
  started_at      timestamptz not null,
  ended_at        timestamptz,
  duration_sec    int,
  distance_km     numeric(8,3),
  route_type      text check (route_type in ('highway','urban','rural','mixed')),
  time_of_day     text check (time_of_day in ('morning','afternoon','evening','night')),
  weather         text,
  start_lat       numeric(10,7),
  start_lng       numeric(10,7),
  end_lat         numeric(10,7),
  end_lng         numeric(10,7),
  gps_trace       jsonb,
  trip_score      int check (trip_score between 0 and 100),
  score_breakdown jsonb,
  app_version     text,
  device_platform text check (device_platform in ('ios','android'))
);

-- EVENTS
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references sessions(id) on delete cascade not null,
  driver_id    uuid references drivers(id) on delete cascade not null,
  occurred_at  timestamptz not null,
  event_type   text check (event_type in (
    'harsh_brake','harsh_acceleration','sharp_corner',
    'phone_pickup','phone_in_use','speeding_start','speeding_end',
    'night_driving_start','night_driving_end'
  )) not null,
  severity     text check (severity in ('low','medium','high')),
  value        numeric,
  lat          numeric(10,7),
  lng          numeric(10,7),
  metadata     jsonb
);

-- SCORES
create table if not exists scores (
  id              uuid primary key default gen_random_uuid(),
  driver_id       uuid references drivers(id) on delete cascade not null,
  period_start    date not null,
  period_end      date not null,
  composite_score int check (composite_score between 0 and 100),
  phone_score     int,
  braking_score   int,
  speeding_score  int,
  cornering_score int,
  night_score     int,
  trips_counted   int,
  km_counted      numeric(10,2),
  phone_avg_sec   numeric(8,2),
  harsh_brakes_per_100km numeric(6,2),
  speeding_pct    numeric(5,2),
  night_pct       numeric(5,2),
  risk_tier       text check (risk_tier in ('low','medium','high')),
  discount_pct    numeric(4,2),
  created_at      timestamptz default now(),
  unique (driver_id, period_start)
);

-- CLAIMS
create table if not exists claims (
  id                uuid primary key default gen_random_uuid(),
  driver_id         uuid references drivers(id) on delete cascade not null,
  session_id        uuid references sessions(id) on delete set null,
  filed_at          timestamptz default now(),
  incident_at       timestamptz,
  claim_type        text check (claim_type in (
    'property_damage','bodily_injury','total_loss','theft','weather','other'
  )),
  status            text check (status in (
    'open','under_review','approved','denied','settled','litigated'
  )) default 'open',
  estimated_cost    numeric(12,2),
  settled_cost      numeric(12,2),
  incident_lat      numeric(10,7),
  incident_lng      numeric(10,7),
  description       text,
  telematics_match  boolean,
  phone_at_impact   boolean,
  fraud_flag        boolean default false,
  fraud_reason      text,
  adjuster_notes    text,
  evidence_urls     text[]
);

-- ALERTS
create table if not exists alerts (
  id           uuid primary key default gen_random_uuid(),
  driver_id    uuid references drivers(id) on delete cascade not null,
  created_at   timestamptz default now(),
  alert_type   text check (alert_type in (
    'score_critical','score_trending_down','phone_high',
    'second_claim','data_gap','fraud_flag','reward_eligible',
    'session_skipped','night_spike'
  )) not null,
  severity     text check (severity in ('critical','warning','info','positive')) not null,
  title        text not null,
  body         text,
  resolved     boolean default false,
  resolved_at  timestamptz,
  metadata     jsonb
);

-- Row-level security (enable after confirming schema)
alter table drivers   enable row level security;
alter table sessions  enable row level security;
alter table events    enable row level security;
alter table scores    enable row level security;
alter table claims    enable row level security;
alter table alerts    enable row level security;

-- Indexes for common queries
create index if not exists sessions_driver_id_idx on sessions(driver_id);
create index if not exists sessions_started_at_idx on sessions(started_at desc);
create index if not exists events_session_id_idx on events(session_id);
create index if not exists events_driver_id_idx on events(driver_id);
create index if not exists scores_driver_id_idx on scores(driver_id);
create index if not exists claims_driver_id_idx on claims(driver_id);
create index if not exists alerts_driver_id_idx on alerts(driver_id);
create index if not exists alerts_resolved_idx on alerts(resolved);
