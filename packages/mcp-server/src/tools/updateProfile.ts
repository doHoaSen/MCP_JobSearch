import { db } from "../db/client.js";

interface UpdateProfileInput {
  resume_text?: string;
  highlights?: string[];
  tone_preference?: string;
}

interface ProfileRow {
  resume_text: string;
  highlights: string;
  tone_preference: string | null;
}

export function updateProfile(input: UpdateProfileInput) {
  const now = new Date().toISOString();
  const existing = db.prepare(`SELECT * FROM profile WHERE id = 1`).get() as
    | ProfileRow
    | undefined;

  const resume_text = input.resume_text ?? existing?.resume_text ?? "";
  const highlights = input.highlights ?? JSON.parse(existing?.highlights ?? "[]");
  const tone_preference = input.tone_preference ?? existing?.tone_preference ?? null;

  db.prepare(
    `INSERT INTO profile (id, resume_text, highlights, tone_preference, updated_at)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       resume_text = excluded.resume_text,
       highlights = excluded.highlights,
       tone_preference = excluded.tone_preference,
       updated_at = excluded.updated_at`
  ).run(resume_text, JSON.stringify(highlights), tone_preference, now);

  return { status: "updated" as const };
}
