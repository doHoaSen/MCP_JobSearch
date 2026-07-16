import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getJob } from "../tools/getJob.js";

export const jobResourceTemplate = new ResourceTemplate("job://{id}", { list: undefined });

export async function readJobResource(uri: URL, id: string) {
  const job = getJob({ job_id: id });
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(job, null, 2),
      },
    ],
  };
}
