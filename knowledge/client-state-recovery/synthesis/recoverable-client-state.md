---
schema_version: 1
type: synthesis
tags: [client-state-recovery]
sources:
  - "https://github.com/joseph0926/firsttx/tree/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages — accessed 2026-07-19"
  - "https://github.com/joseph0926/firsttx/tree/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests — accessed 2026-07-19"
relations:
  depends_on:
    - "[[client-state-recovery/firsttx-prepaint]]"
    - "[[client-state-recovery/firsttx-local-first]]"
    - "[[client-state-recovery/firsttx-tx]]"
  contrasts_with: []
  expands_on: []
  applies_to: []
  contradicts: []
  supersedes: []
confidence: 0.85
status: current
updated: 2026-07-19
---

# 복구 가능한 클라이언트 상태 전환

## 결론

즉시 보이는 화면, 즉시 읽히는 데이터, 즉시 반영되는 변경은 같은 문제처럼 보이지만 실패 시 책임이 다르다. [[client-state-recovery/firsttx-prepaint]]는 React가 준비되기 전 visual continuity, [[client-state-recovery/firsttx-local-first]]는 React가 읽을 cached data와 freshness, [[client-state-recovery/firsttx-tx]]는 optimistic side effect의 보상을 담당한다.

세 레이어는 서로를 대체하지 않는다. 필요한 레이어만 선택하고, 조합할 때도 visual → data → mutation 순서의 독립적인 handoff를 유지해야 한다.

## 문제별 선택

| 사용자 문제 | 우선 경계 | 성공 조건 | 실패 시 처리 |
| --- | --- | --- | --- |
| CSR 재방문에서 bundle 전 빈 화면이 보임 | Prepaint visual replay | non-interactive 이전 화면이 실제 React commit까지 유지됨 | snapshot 없이 cold start, overlay 제거 |
| 재방문 시 데이터 skeleton이 반복됨 | Local-First cached snapshot | cache를 즉시 읽되 freshness를 별도 표시·재검증함 | stale 표시, background 또는 manual refresh |
| optimistic multi-step 변경이 중간 실패함 | Tx compensation | 완료 step만 역순 보상하고 실패 상태를 노출함 | retry, compensation, reconciliation 분리 |

이 선택표는 각 package의 공개 문서와 unit/E2E 시나리오를 종합한 것이다. 개별 동작의 근거는 [[client-state-recovery/firsttx-prepaint]], [[client-state-recovery/firsttx-local-first]], [[client-state-recovery/firsttx-tx]]에 분리했다.

## 조합할 때 유지할 불변 조건

### 1. 이전 화면은 현재 UI가 아니다

Prepaint snapshot은 명시적으로 허용한 민감하지 않은 exact route에서만 만들고, 조작할 수 없는 임시 화면으로 React root와 격리해야 한다. 실제 화면이 준비되면 반드시 제거한다. 공개 handoff E2E는 이 경계를 bundle 지연, route별 key와 schema migration 조건에서 확인한다. 근거: [[client-state-recovery/firsttx-prepaint]].

### 2. cached data는 최신 데이터가 아니다

Local-First snapshot은 빠른 render를 가능하게 하지만 TTL과 server revalidation이 freshness를 결정한다. cross-tab 통지는 conflict resolution이 아니며 concurrent write는 별도 정책이 필요하다. 근거: [[client-state-recovery/firsttx-local-first]].

### 3. compensation은 원자적 rollback이 아니다

Tx의 역순 보상은 client side effect를 복구하는 실행 규칙이지 server와 browser storage의 원자성을 만들지 않는다. 보상 작업도 실패할 수 있으므로 idempotency와 최종 reconciliation이 필요하다. 근거: [[client-state-recovery/firsttx-tx]].

## Evidence strength

- 강함: package API와 명시적 제한이 공개 README, unit test와 Playwright scenario에서 같은 방향으로 확인된다.
- 제한적: 공개 metrics JSON은 특정 시점의 Chromium scenario 기록이다. 보편적인 성능 향상이나 다른 기기·네트워크의 결과로 일반화하지 않는다.
- 미확인: 실제 대규모 서비스의 장기 hit rate, storage pressure, multi-device conflict와 server reconciliation 비용은 이 자료만으로 판단할 수 없다.

## 적용 체크리스트

1. 줄이려는 대기가 visual blank, data wait, mutation acknowledgement 중 무엇인지 구분한다.
2. 첫 방문과 재방문, fresh와 stale, 성공과 rollback을 별도 상태로 만든다.
3. 각 레이어의 fallback이 다른 레이어의 정상 동작을 막지 않게 한다.
4. visual replay 시간, 실제 interaction 가능 시점, freshness와 rollback 결과를 따로 측정한다.
5. 원자성이나 conflict resolution이 필요한 invariant는 server owner에게 남긴다.

## 출처

- [FirstTx packages at source revision](https://github.com/joseph0926/firsttx/tree/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages) — accessed 2026-07-19
- [FirstTx playground tests at source revision](https://github.com/joseph0926/firsttx/tree/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests) — accessed 2026-07-19
