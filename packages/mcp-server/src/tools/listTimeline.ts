import { db } from "../db/client.js";

interface ListTimelineInput {
  from?: string;
  to?: string;
  status?: "captured" | "analyzed";
}

interface TimelineRow {
  job_id: string;
  company: string | null;
  title: string | null;
  deadline: string | null;
  status: string;
}

export function listTimeline(input: ListTimelineInput) {
  const { from, to, status } = input;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (from) {
    conditions.push("deadline >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("deadline <= ?");
    params.push(to);
  }
  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const jobs = db
    .prepare(
      `SELECT id as job_id, company, title, deadline, status
       FROM jobs ${where}
       ORDER BY deadline IS NULL, deadline ASC`
    )
    .all(...params) as TimelineRow[];

  return { jobs };
}
