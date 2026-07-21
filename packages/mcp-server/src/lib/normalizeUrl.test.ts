import { describe, it, expect } from "vitest";
import { normalizeUrl } from "./normalizeUrl.js";

describe("normalizeUrl", () => {
  it("trailing slash를 제거함", () => {
    expect(normalizeUrl("https://example.com/jobs/1/")).toBe("https://example.com/jobs/1");
  });

  it("알려진 트래킹 파라미터를 제거함", () => {
    expect(normalizeUrl("https://example.com/jobs/1?utm_source=slack&ref=abc")).toBe(
      "https://example.com/jobs/1"
    );
  });

  it("해시 프래그먼트를 제거함", () => {
    expect(normalizeUrl("https://example.com/jobs/1#section")).toBe("https://example.com/jobs/1");
  });

  it("fetchPosting.ts가 실제로 사용하는 파라미터는 유지함 (예: 사람인 rec_idx)", () => {
    expect(
      normalizeUrl("https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=123&utm_medium=x")
    ).toBe("https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=123");
  });

  it("URL 파싱에 실패하면 원본 문자열을 그대로 반환함", () => {
    expect(normalizeUrl("not-a-valid-url")).toBe("not-a-valid-url");
  });
});
