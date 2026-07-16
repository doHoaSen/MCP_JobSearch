import { randomUUID } from "node:crypto";
import { db } from "../db/client.js";
import { fetchPostingText } from "../lib/fetchPosting.js";

interface CapturePostingInput {
  url?: string;
  raw_text?: string;
}

export async function capturePosting(input: CapturePostingInput) {
  const { url, raw_text } = input;
  if (!url && !raw_text) {
    throw new Error("url 또는 raw_text 중 하나는 필수입니다.");
  }

  const text = raw_text ?? (await fetchPostingText(url!));
  if (!text) {
    throw new Error("본문 텍스트를 가져오지 못했습니다.");
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO jobs (id, source_url, raw_text, status, captured_at, updated_at)
     VALUES (?, ?, ?, 'captured', ?, ?)`
  ).run(id, url ?? null, text, now, now);

  return {
    job_id: id,
    raw_text_preview: text.slice(0, 500),
    status: "captured" as const,
  };
}
