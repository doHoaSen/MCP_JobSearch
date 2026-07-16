import { db } from "../db/client.js";

interface ProfileRow {
  resume_text: string;
  highlights: string;
  tone_preference: string | null;
}

export async function readProfileResource(uri: URL) {
  const row = db.prepare(`SELECT * FROM profile WHERE id = 1`).get() as
    | ProfileRow
    | undefined;

  const data = row
    ? { resume_text: row.resume_text, highlights: JSON.parse(row.highlights), tone_preference: row.tone_preference }
    : { resume_text: "", highlights: [], tone_preference: null };

  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
