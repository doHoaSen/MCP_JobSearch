export interface JobRecord {
  id: string;
  source_url: string | null;
  raw_text: string;
  company: string | null;
  title: string | null;
  deadline: string | null;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  status: "captured" | "analyzed";
  captured_at: string;
  updated_at: string;
}

export interface CoverLetterDraft {
  draft_id: string;
  draft_text: string;
  version: number;
  created_at: string;
}

export interface Profile {
  resume_text: string;
  highlights: string[];
  tone_preference: string | null;
}
