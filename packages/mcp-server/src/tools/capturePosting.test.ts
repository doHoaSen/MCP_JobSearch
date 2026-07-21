import { describe, it, expect, afterAll, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("../lib/fetchPosting.js", () => ({
  fetchPostingText: vi.fn(async (url: string) => `가짜 공고 본문: ${url}`),
}));

const tmpDir = mkdtempSync(join(tmpdir(), "jobsearch-test-"));
process.env.JOBSEARCH_DB_PATH = join(tmpDir, "test.sqlite");

const { capturePosting } = await import("./capturePosting.js");
const { db } = await import("../db/client.js");

afterAll(() => {
  db.close();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("capturePosting", () => {
  it("새로운 캡처는 새 row로 저장됨", async () => {
    const result = await capturePosting({ raw_text: "테스트 공고 A" });
    expect(result.recaptured).toBe(false);
    expect(result.status).toBe("captured");
  });

  it("정규화된 URL이 같으면 재캡처로 처리되고 기존 status가 유지됨", async () => {
    const first = await capturePosting({ url: "https://example.com/jobs/1/" });
    expect(first.recaptured).toBe(false);

    db.prepare("UPDATE jobs SET status = 'analyzed' WHERE id = ?").run(first.job_id);

    const second = await capturePosting({
      url: "https://example.com/jobs/1?utm_source=slack&ref=abc",
    });
    expect(second.job_id).toBe(first.job_id);
    expect(second.recaptured).toBe(true);
    expect(second.status).toBe("analyzed");

    const count = db.prepare("SELECT COUNT(*) as c FROM jobs").get() as { c: number };
    expect(count.c).toBe(2); // 첫 번째 테스트의 raw_text row + 이 row, 중복 생성 안 됨
  });

  it("url 없이 raw_text만 캡처하면 매번 새 row가 생성됨", async () => {
    const a = await capturePosting({ raw_text: "같은 텍스트" });
    const b = await capturePosting({ raw_text: "같은 텍스트" });
    expect(a.job_id).not.toBe(b.job_id);
  });
});
