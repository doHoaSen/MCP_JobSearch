import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { capturePosting } from "./capturePosting.js";
import { saveJobAnalysis } from "./saveJobAnalysis.js";
import { listTimeline } from "./listTimeline.js";
import { getJob } from "./getJob.js";
import { saveCoverLetterDraft } from "./saveCoverLetterDraft.js";
import { updateProfile } from "./updateProfile.js";

function asToolResult(data: unknown) {
  return {
      content: [
          {
              type: "text" as const,
              text: JSON.stringify(data, null, 2
                  )
              }
          ]
      };
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "capture_job_posting",
    {
      title: "Capture Job Posting",
      description:
        "채용 공고를 URL 또는 텍스트로 저장합니다. LLM 분석은 하지 않고 원문만 저장합니다.",
      inputSchema: {
        url: z.string().url().optional(),
        raw_text: z.string().optional(),
      },
    },
    async ({ url, raw_text })
    => asToolResult(await capturePosting({ url, raw_text }))
  );

  server.registerTool(
    "save_job_analysis",
    {
      title: "Save Job Analysis",
      description:
        "호스트가 JD를 읽고 분석한 구조화 결과(마감일, 요건 등)를 저장합니다.",
      inputSchema: {
        job_id: z.string(),
        company: z.string().optional(),
        title: z.string().optional(),
        deadline: z.string().nullable().optional(),
        required_skills: z.array(z.string()).optional(),
        preferred_skills: z.array(z.string()).optional(),
        responsibilities: z.array(z.string()).optional(),
      },
    },
    async (input) => asToolResult(saveJobAnalysis(input))
  );

  server.registerTool(
    "list_timeline",
    {
      title: "List Timeline",
      description: "마감일 기준으로 정렬된 채용 공고 목록을 조회합니다.",
      inputSchema: {
        from: z.string().optional(),
        to: z.string().optional(),
        status: z.enum(["captured", "analyzed"]).optional(),
      },
    },
    async (input) => asToolResult(listTimeline(input))
  );

  server.registerTool(
    "get_job",
    {
      title: "Get Job",
      description: "특정 공고의 전체 데이터(원문, 분석 결과, 자소서 초안)를 조회합니다.",
      inputSchema: {
        job_id: z.string(),
      },
    },
    async ({ job_id }) => asToolResult(getJob({ job_id }))
  );

  server.registerTool(
    "save_cover_letter_draft",
    {
      title: "Save Cover Letter Draft",
      description: "호스트가 생성한 자기소개서 초안을 저장합니다.",
      inputSchema: {
        job_id: z.string(),
        draft_text: z.string(),
      },
    },
    async (input) => asToolResult(saveCoverLetterDraft(input))
  );

  server.registerTool(
    "update_profile",
    {
      title: "Update Profile",
      description: "자기소개서 생성에 쓰일 이력/강점 정보를 갱신합니다.",
      inputSchema: {
        resume_text: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        tone_preference: z.string().optional(),
      },
    },
    async (input) => asToolResult(updateProfile(input))
  );
}
