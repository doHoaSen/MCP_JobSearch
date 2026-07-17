import * as cheerio from "cheerio";

const DEFAULT_USER_AGENT = "Mozilla/5.0 (compatible; JobSearchMCP/1.0)";

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg").remove();
  return $.root().text().replace(/\s+/g, " ").trim();
}

/**
 * saramin.co.kr의 공고 상세 페이지는 클라이언트 JS가 렌더링하는 빈 껍데기라
 * 일반 fetch로는 본문이 안 잡힌다. 실제 콘텐츠는 view-ajax 엔드포인트가
 * rec_idx만으로(로그인 세션 없이) HTML 조각을 돌려주므로 그걸 대신 호출한다.
 */
async function fetchSaraminPosting(recIdx: string): Promise<string> {
  const res = await fetch("https://www.saramin.co.kr/zf_user/jobs/relay/view-ajax", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=${recIdx}`,
      Origin: "https://www.saramin.co.kr",
      "User-Agent": DEFAULT_USER_AGENT,
    },
    body: new URLSearchParams({ rec_idx: recIdx, rec_seq: "0", view_type: "search" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch saramin posting ${recIdx}: ${res.status} ${res.statusText}`);
  }
  return htmlToText(await res.text());
}

export async function fetchPostingText(url: string): Promise<string> {
  const saraminMatch = url.match(/saramin\.co\.kr\/.*[?&]rec_idx=(\d+)/);
  if (saraminMatch) {
    return fetchSaraminPosting(saraminMatch[1]);
  }

  const res = await fetch(url, { headers: { "User-Agent": DEFAULT_USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return htmlToText(await res.text());
}
