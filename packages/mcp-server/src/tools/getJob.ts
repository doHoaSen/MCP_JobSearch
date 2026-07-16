import { db } from "../db/client.js";
import type { JobRecord } from "../lib/types.js";

interface JobRow {
  id: string;
  source_url: string | null;
  raw_text: string;
  company: string | null;
  title: string | null;
  deadline: string | null;
  required_skills: string;
  preferred_skills: string;
  responsibilities: string;
  status: "captured" | "analyzed";
  captured_at: string;
  updated_at: string;
}

interface DraftRow {
  draft_id: string;
  draft_text: string;
  version: number;
  created_at: string;
}

export function getJob(input: { job_id: string }) {
  const row = db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(input.job_id) as
    | JobRow
    | undefined;
  if (!row) {
    throw new Error(`job_id를 찾을 수 없습니다: ${input.job_id}`);
  }

  const drafts = db
    .prepare(
      `SELECT id as draft_id, draft_text, version, created_at
       FROM cover_letter_drafts WHERE job_id = ? ORDER BY version DESC`
    )
    .all(input.job_id) as DraftRow[];

  const job: JobRecord = {
    ...row,
    required_skills: JSON.parse(row.required_skills),
    preferred_skills: JSON.parse(row.preferred_skills),
    responsibilities: JSON.parse(row.responsibilities),
  };

  return { ...job, cover_letter_drafts: drafts };
}
