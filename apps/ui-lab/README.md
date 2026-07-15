# UI Candidate Lab

동일한 fixture와 상태 조건에서 여러 UI 후보를 비교하고 브라우저 결과를 남기는 실행 환경이다.

## Commands

저장소 루트에서 실행한다.

```sh
pnpm install
pnpm ui:dev
pnpm ui:typecheck
pnpm ui:build
pnpm ui:shots
```

개발 서버는 `http://localhost:3001`을 사용한다. Screenshot은 기본적으로 `artifacts/ui-lab/`에 저장한다.

## Experiment contract

각 experiment는 slug, title, anchor, states, candidates를 가진다. 모든 candidate는 같은 `{ state }` 입력을 받고 `/view/:slug/:candidate/:state`에서 독립적으로 확인할 수 있다.

현재 `content-discovery`는 같은 저장소 콘텐츠를 Notion-like 구조 탐색, Vercel-like 정밀 조회, Pinterest-like 시각적 발견으로 나누어 비교한다. 각 candidate는 `ready`, `loading`, `empty`, `error`, `focus` 상태를 제공한다.

```text
1 experiment × 3 candidates × 5 states × 2 viewports = 30 candidate captures
gallery × 2 viewports = 2 showcase captures
```
