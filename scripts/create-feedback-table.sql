-- SQL for Supabase: create table for feedback reports
-- Run this in Supabase SQL editor (or psql)

create table if not exists public.feedback_reports (
  id text primary key,
  type text,
  message text,
  test_id text,
  question_index integer,
  question_text text,
  lang text,
  timestamp timestamptz,
  resolved boolean default false,
  meta jsonb,
  github_issue text,
  github_issue_number integer,
  synced_at timestamptz,
  inserted_at timestamptz default now()
);

-- Optional: index for faster lookups
create index if not exists idx_feedback_reports_inserted_at on public.feedback_reports(inserted_at);
