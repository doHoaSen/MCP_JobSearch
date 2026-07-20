const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "ref",
  "from",
  "source",
]);

/**
 * 같은 공고를 가리키는 URL이 트래킹 파라미터나 trailing slash 차이로
 * 다른 source_url로 저장되어 중복 캡처되는 걸 막기 위한 정규화 작업
 * 파싱 실패 시(예: 상대 경로) 원본 URL을 그대로 반환한다.
 */
export function normalizeUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  parsed.hash = "";

  const params = new URLSearchParams(parsed.search);
  for (const key of [...params.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      params.delete(key);
    }
  }
  params.sort();
  parsed.search = params.toString();

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return parsed.toString();
}
