import { randomUUID } from "node:crypto";
import { db } from "../db/client.js";
import { fetchPostingText } from "../lib/fetchPosting.js";
import { normalizeUrl } from "../lib/normalizeUrl.js";

interface CapturePostingInput {
  url?: string;
  raw_text?: string;
}

export async function capturePosting(input: CapturePostingInput) {
  const { raw_text } = input;
  const url = input.url ? normalizeUrl(input.url) : undefined;
  if (!url && !raw_text) {
    throw new Error("url 또는 raw_text 중 하나는 필수입니다.");
  }

  const text = raw_text ?? (await fetchPostingText(url!));
  if (!text) {
    throw new Error("본문 텍스트를 가져오지 못했습니다.");
  }

  const now = new Date().toISOString();
  const id = randomUUID();

  const row = db
    .prepare(
      `INSERT INTO jobs (id, source_url, raw_text, status, captured_at, updated_at)
       VALUES (?, ?, ?, 'captured', ?, ?)
       ON CONFLICT(source_url) DO UPDATE SET
         raw_text = excluded.raw_text,
         updated_at = excluded.updated_at
       RETURNING id, status`
    )
    .get(id, url ?? null, text, now, now) as { id: string; status: "captured" | "analyzed" };

  return {
    job_id: row.id,
    raw_text_preview: text.slice(0, 500),
    status: row.status,
    recaptured: row.id !== id,
  };
}
