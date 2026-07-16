import { randomUUID } from "node:crypto";
import { db } from "../db/client.js";

export function saveCoverLetterDraft(input: { job_id: string; draft_text: string }) {
  const job = db.prepare(`SELECT id FROM jobs WHERE id = ?`).get(input.job_id);
  if (!job) {
    throw new Error(`job_id를 찾을 수 없습니다: ${input.job_id}`);
  }

  const { version } = db
    .prepare(
      `SELECT COALESCE(MAX(version), 0) + 1 as version FROM cover_letter_drafts WHERE job_id = ?`
    )
    .get(input.job_id) as { version: number };

  const id = randomUUID();
  db.prepare(
    `INSERT INTO cover_letter_drafts (id, job_id, draft_text, version, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.job_id, input.draft_text, version, new Date().toISOString());

  return { draft_id: id, version };
}
