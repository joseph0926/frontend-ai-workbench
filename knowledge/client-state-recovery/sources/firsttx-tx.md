---
schema_version: 1
type: source
tags: [client-state-recovery]
sources:
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/tx/README.md — accessed 2026-07-15"
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/tx/tests/transaction.test.ts — accessed 2026-07-15"
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/tests/tx-rollback.spec.ts — accessed 2026-07-15"
relations:
  depends_on: []
  contrasts_with: []
  expands_on: []
  applies_to: ["[[client-state-recovery/recoverable-client-state]]"]
  contradicts: []
  supersedes: []
confidence: 0.9
status: current
updated: 2026-07-15
---

# FirstTx Tx의 compensating rollback 경계

## Source 범위

Tx는 여러 optimistic step을 순서대로 실행하고 중간 실패 시 이미 완료된 step의 compensation을 역순으로 호출하는 실행 레이어다. step별 retry와 전체 timeout을 제공하지만 remote API, IndexedDB와 React state를 하나의 원자적 commit으로 만들지는 않는다.

[[client-state-recovery/firsttx-local-first]]가 cached snapshot과 staleness를 관리하는 반면 Tx는 변경 도중 실패했을 때 어떤 작업을 되돌릴지 명시한다. [[client-state-recovery/firsttx-prepaint]]의 visual handoff와도 독립된 실패 경계다.

## 확인된 동작

- 공개 unit test는 여러 step의 실행 순서, retry 횟수, exponential backoff, timeout과 역순 compensation을 확인한다.
- timeout이 발생하면 앞서 완료된 step의 compensation이 역순으로 실행된다.
- 공개 Playwright rollback scenario는 지정한 단계에서 실패했을 때 완료 단계가 보상되고 rollback 상태가 화면에 나타나는지 확인한다.
- commit 이후 transaction은 종료되며 같은 commit 호출은 idempotent하게 처리된다.

## 복구의 한계

Compensation은 database rollback과 같은 원자성 보장이 아니라 best-effort 복구다. 보상 작업 자체도 실패할 수 있고, timeout 이후에도 `AbortSignal`을 사용하지 않는 실제 함수는 계속 실행될 수 있다. 따라서 side effect가 중복되거나 늦게 완료되는 상황을 호출자가 별도로 방어해야 한다.

[[client-state-recovery/recoverable-client-state]]에서는 retry 가능 오류, 보상 가능한 변경, 사람 또는 서버 reconciliation이 필요한 실패를 구분한다.

## 적용 판단

- 사용자가 즉시 결과를 봐야 하지만 server request가 실패할 수 있는 multi-step 변경에 사용한다.
- compensation은 실패 가능성이 낮고 반복 호출해도 안전하도록 설계한다.
- retry는 네트워크 일시 오류처럼 재시도 가능한 step에만 적용하고 business rejection에는 사용하지 않는다.
- 원자성이 필요한 데이터 invariant는 client compensation이 아니라 server transaction이 소유해야 한다.

## 출처

- [Tx package README](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/tx/README.md) — accessed 2026-07-15
- [Transaction unit tests](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/tx/tests/transaction.test.ts) — accessed 2026-07-15
- [Rollback Playwright scenario](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/tests/tx-rollback.spec.ts) — accessed 2026-07-15
