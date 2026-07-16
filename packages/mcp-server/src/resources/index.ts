import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jobResourceTemplate, readJobResource } from "./job.js";
import { readProfileResource } from "./profile.js";

export function registerResources(server: McpServer) {
  server.registerResource(
    "job",
    jobResourceTemplate,
    { title: "Job Posting", description: "저장된 채용 공고의 전체 데이터" },
    async (uri, variables) => readJobResource(uri, variables.id as string)
  );

  server.registerResource(
    "profile",
    "profile://user",
    { title: "User Profile", description: "자기소개서 생성에 쓰이는 이력/강점 정보" },
    async (uri) => readProfileResource(uri)
  );
}
