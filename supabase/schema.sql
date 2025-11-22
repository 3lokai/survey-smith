-- Create table for survey requests
create table public.survey_requests (
  id uuid default gen_random_uuid() primary key,
  brand_name text not null,
  context text not null,
  goals text not null,
  audience text not null,
  question_count int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.survey_requests enable row level security;

-- Create policy to allow anonymous inserts (since no auth is required for MVP)
create policy "Allow anonymous inserts"
on public.survey_requests
for insert
to public
with check (true);

-- Create policy to allow anonymous selects (if needed for result page, though we might just pass data)
-- For now, let's allow reading your own request if we had auth, but without auth, 
-- we might want to restrict it or just allow all for MVP simplicity if we fetch by ID.
-- Given the prompt says "No auth needed", allowing public read by ID is acceptable for MVP.
create policy "Allow anonymous select"
on public.survey_requests
for select
to public
using (true);

-- Create table for survey questions
create table public.survey_questions (
  id uuid default gen_random_uuid() primary key,
  survey_request_id uuid not null references public.survey_requests(id) on delete cascade,
  question_id text not null,
  text text not null,
  type text not null,
  options jsonb,
  config jsonb,
  rationale text not null,
  order_index int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups by survey_request_id
create index idx_survey_questions_request_id on public.survey_questions(survey_request_id);

-- Create index for ordering questions
create index idx_survey_questions_order on public.survey_questions(survey_request_id, order_index);

-- Enable Row Level Security for survey_questions
alter table public.survey_questions enable row level security;

-- Create policy to allow anonymous inserts
create policy "Allow anonymous inserts"
on public.survey_questions
for insert
to public
with check (true);

-- Create policy to allow anonymous selects
create policy "Allow anonymous select"
on public.survey_questions
for select
to public
using (true);