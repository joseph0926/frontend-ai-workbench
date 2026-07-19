---
schema_version: 1
type: source
tags: [client-state-recovery]
sources:
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/local-first/README.md — accessed 2026-07-19"
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/local-first/tests/model-ttl-optional.test.ts — accessed 2026-07-19"
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests/sync-staleness.spec.ts — accessed 2026-07-19"
relations:
  depends_on: []
  contrasts_with: []
  expands_on: []
  applies_to: ["[[client-state-recovery/recoverable-client-state]]"]
  contradicts: []
  supersedes: []
confidence: 0.9
status: current
updated: 2026-07-19
---

# FirstTx Local-First의 staleness 경계

## Source 범위

Local-First는 IndexedDB에 저장한 model snapshot을 React가 동기적으로 읽을 수 있는 cache로 연결하고, TTL 기반 staleness와 server revalidation을 별도 상태로 제공한다. 빠른 cached render와 최신 데이터 확인을 같은 의미로 취급하지 않는 것이 핵심 경계다.

[[client-state-recovery/firsttx-prepaint]]가 이전 화면의 픽셀 연속성을 담당한다면 Local-First는 현재 React tree가 사용할 데이터 snapshot을 담당한다. 낙관적 변경이 여러 단계의 실패 복구를 요구하면 [[client-state-recovery/firsttx-tx]]가 별도 실행 경계를 소유한다.

## 확인된 동작

- model은 기본 5분 TTL을 가지며 명시적 TTL, `Infinity`, `0`을 각각 일반 만료, 만료 없음, 항상 stale로 해석한다.
- 공개 unit test는 시간이 TTL을 넘기 전후의 `history.isStale` 변화를 확인한다.
- 공개 Playwright 시나리오는 stale data의 수동 refresh와 mount 시 자동 refresh 전략을 별도 zone에서 검증한다.
- BroadcastChannel은 다른 탭의 변경 알림을 받아 해당 model snapshot을 IndexedDB에서 다시 읽는다.

## 정합성 한계

package 문서는 concurrent write의 conflict detection을 제공하지 않으며 마지막으로 완료된 IndexedDB write가 이긴다고 명시한다. `isConflicted`도 현재 예약 필드다. 따라서 cached data가 즉시 보인다는 사실만으로 여러 writer 사이의 정합성이 해결됐다고 판단할 수 없다.

또한 Suspense 기반 hook은 client-side read 경로이며 SSR 용도가 아니다. [[client-state-recovery/recoverable-client-state]]에서는 cache availability, freshness, conflict resolution을 세 개의 독립 질문으로 나눈다.

## 적용 판단

- 재방문 시 이전 데이터를 즉시 보여줄 가치가 있고 stale 표시 또는 background revalidation을 제품 흐름에 포함할 수 있을 때 사용한다.
- 가격·재고처럼 최신성 민감도가 높은 데이터는 TTL만으로 의미를 결정하지 말고 사용자에게 freshness를 드러낸다.
- 여러 탭이나 writer가 같은 record를 바꾸면 별도 version, merge 또는 server conflict 정책이 필요하다.
- mutation rollback이 필요하면 cache layer에 책임을 섞지 않고 transaction 경계로 분리한다.

## 출처

- [Local-First package README](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/local-first/README.md) — accessed 2026-07-19
- [TTL behavior unit tests](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/local-first/tests/model-ttl-optional.test.ts) — accessed 2026-07-19
- [Staleness Playwright scenario](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests/sync-staleness.spec.ts) — accessed 2026-07-19
