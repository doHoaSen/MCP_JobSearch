# MCP JobSearch

여러 채용 공고 사이트의 공고 링크를 던져주면, MCP를 통해 연결된 Claude가 공고 원문을 가져와 분석하고(회사/직무/마감일/자격요건/우대사항/주요업무) 마감일 타임라인과 자기소개서 초안까지 관리해주는 개인용 채용공고 관리 MCP 서버입니다.

호스트(Claude Desktop 또는 Claude Code)가 LLM 분석을 담당하고, 이 서버는 원문 수집·저장·조회만 담당하는 구조라 별도 LLM API 비용이 들지 않습니다.

## 사전 요구사항

- [Node.js](https://nodejs.org/) 20 이상 (개발 시 22.13.0 사용)
- [Claude Desktop](https://claude.ai/download) 또는 [Claude Code](https://docs.claude.com/en/docs/claude-code) — 둘 중 하나만 있으면 됩니다.

## 설치 및 빌드

```bash
git clone https://github.com/doHoaSen/MCP_JobSearch.git
cd MCP_JobSearch
npm install
npm run build --workspace=@mcp-jobsearch/mcp-server
```

빌드가 끝나면 `packages/mcp-server/dist/index.js`가 생성됩니다. 서버는 실행 시 같은 패키지 안의 `data/jobs.sqlite`에 데이터를 저장합니다 (최초 실행 시 자동 생성).

## Claude Code에 연결하기

리포지토리 루트의 `.mcp.json`이 이미 다음과 같이 설정되어 있습니다.

```json
{
  "mcpServers": {
    "job-search-mcp": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

이 리포지토리 루트 폴더에서 `claude` 명령으로 세션을 시작하면 서버가 자동으로 인식됩니다. 최초 연결 시 `claude mcp list`에 `Pending approval`로 뜨면, 세션을 한 번 더 열어서 승인해주세요.

## Claude Desktop에 연결하기

Claude Desktop 설정 파일에 아래 항목을 추가하세요. `<REPO_PATH>`는 이 리포지토리를 clone한 절대 경로로 바꿔주세요.

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "job-search-mcp": {
      "command": "node",
      "args": ["<REPO_PATH>/packages/mcp-server/dist/index.js"]
    }
  }
}
```

저장 후 Claude Desktop을 재시작하면 연결됩니다.

## 제공하는 툴 (Tools)

| 툴 | 설명 |
|---|---|
| `capture_job_posting` | 채용 공고를 URL 또는 텍스트로 저장 (LLM 분석 없이 원문만) |
| `save_job_analysis` | 호스트가 분석한 구조화 결과(회사/직무/마감일/자격요건/우대사항/주요업무) 저장 |
| `list_timeline` | 마감일 기준 정렬된 채용 공고 목록 조회 |
| `get_job` | 특정 공고의 전체 데이터(원문, 분석 결과, 자소서 초안) 조회 |
| `save_cover_letter_draft` | 호스트가 생성한 자기소개서 초안 저장 |
| `update_profile` | 자기소개서 생성에 쓰일 이력/강점 정보 갱신 |

## 제공하는 리소스 (Resources)

| 리소스 URI | 설명 |
|---|---|
| `job://{id}` | 저장된 채용 공고의 전체 데이터 |
| `profile://user` | 자기소개서 생성에 쓰이는 이력/강점 정보 |

## 사용 방법

Claude와의 대화창에 채용 공고 링크를 붙여넣고 분석해달라고 요청하면, Claude가 `capture_job_posting`으로 원문을 가져와 읽고, 구조화한 결과를 `save_job_analysis`로 저장합니다. 이후 "마감일 임박한 공고 보여줘" 같은 요청에는 `list_timeline`을, 특정 공고를 다시 볼 땐 `get_job`을 사용합니다.

## 지원하는 채용 사이트

| 사이트 | 상태 |
|---|---|
| 원티드 (wanted.co.kr) | 지원 — 비공식 내부 API(`chaos/jobs/v4`)로 기술스택 태그까지 포함 |
| 사람인 (saramin.co.kr) | 지원 — `view-ajax` 엔드포인트로 상세페이지 fetch |
| 잡코리아 (jobkorea.co.kr) | 지원 — 정적 HTML |
| 점핏 (jumpit.saramin.co.kr) | 지원 — 정적 HTML |
| 그룹바이 (groupby.kr) | 지원 — 정적 HTML |
| 그 외 사이트 | 별도 처리가 없어 정적 HTML 파싱만 시도합니다. 클라이언트 렌더링 페이지는 원문이 비어있을 수 있습니다. |

새 사이트에서 fetch가 안 될 경우, 브라우저 개발자도구 Network 탭에서 실제 콘텐츠를 채우는 API 요청을 찾아 `packages/mcp-server/src/lib/fetchPosting.ts`에 사이트별 처리를 추가하는 방식으로 해결해왔습니다.

## 한계점

- 원티드/사람인은 각 사이트의 비공식 내부 API를 사용하므로, 사이트 구조가 바뀌면 다시 깨질 수 있습니다.
- 로그인이 필요한 비공개 공고나, 위 방식으로도 원문을 가져올 수 없는 사이트는 지원하지 않습니다.
- 데이터는 로컬 SQLite 파일에만 저장되며, 여러 사람이 데이터를 공유하는 구조가 아닙니다 (개인용).
