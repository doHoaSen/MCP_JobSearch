export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  source_url TEXT,
  raw_text TEXT NOT NULL,
  company TEXT,
  title TEXT,
  deadline TEXT,
  required_skills TEXT NOT NULL DEFAULT '[]',
  preferred_skills TEXT NOT NULL DEFAULT '[]',
  responsibilities TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'captured',
  captured_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_source_url ON jobs(source_url);

CREATE TABLE IF NOT EXISTS cover_letter_drafts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id),
  draft_text TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  resume_text TEXT NOT NULL DEFAULT '',
  highlights TEXT NOT NULL DEFAULT '[]',
  tone_preference TEXT,
  updated_at TEXT NOT NULL
);
`;
