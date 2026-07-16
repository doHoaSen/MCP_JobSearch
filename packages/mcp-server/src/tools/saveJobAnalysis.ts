import { db } from "../db/client.js";

interface SaveJobAnalysisInput {
  job_id: string;
  company?: string;
  title?: string;
  deadline?: string | null;
  required_skills?: string[];
  preferred_skills?: string[];
  responsibilities?: string[];
}

export function saveJobAnalysis(input: SaveJobAnalysisInput) {
  const {
    job_id,
    company,
    title,
    deadline,
    required_skills = [],
    preferred_skills = [],
    responsibilities = [],
  } = input;

  const existing = db.prepare(`SELECT id FROM jobs WHERE id = ?`).get(job_id);
  if (!existing) {
    throw new Error(`job_id를 찾을 수 없습니다: ${job_id}`);
  }

  db.prepare(
    `UPDATE jobs SET
       company = ?, title = ?, deadline = ?,
       required_skills = ?, preferred_skills = ?, responsibilities = ?,
       status = 'analyzed', updated_at = ?
     WHERE id = ?`
  ).run(
    company ?? null,
    title ?? null,
    deadline ?? null,
    JSON.stringify(required_skills),
    JSON.stringify(preferred_skills),
    JSON.stringify(responsibilities),
    new Date().toISOString(),
    job_id
  );

  return { job_id, status: "analyzed" as const };
}
