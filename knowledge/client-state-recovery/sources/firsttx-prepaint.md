---
schema_version: 1
type: source
tags: [client-state-recovery]
sources:
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/prepaint/README.md — accessed 2026-07-19"
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests/prepaint-handoff.spec.ts — accessed 2026-07-19"
  - "https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/public/metrics/prepaint-heavy.latest.json — accessed 2026-07-19"
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

# FirstTx Prepaint의 visual replay 경계

## Source 범위

Prepaint는 명시적으로 허용한 CSR route의 DOM snapshot을 IndexedDB에 저장하고 재방문 시 React bundle보다 먼저 보여주는 렌더 레이어다. 저장된 DOM을 hydration 대상으로 사용하지 않고 React root 밖의 Shadow DOM overlay에 비상호작용 visual cache로 표시한다.

이 경계는 [[client-state-recovery/firsttx-local-first]]의 데이터 snapshot이나 [[client-state-recovery/firsttx-tx]]의 변경 복구와 역할이 다르다. Prepaint가 보장하려는 것은 최신 데이터나 완료된 interaction이 아니라 React가 준비되는 동안의 시각적 연속성이다.

## 확인된 동작

- 공개 Playwright 시나리오는 main bundle 요청을 지연한 상태에서 overlay가 유지되고 React root가 비어 있는지 확인한다.
- overlay의 `pointer-events`가 `none`인지 검사해 이전 화면이 조작 가능한 UI로 오인되지 않게 한다.
- React의 실제 product grid가 나타난 뒤 overlay와 prepaint marker가 제거되는 handoff를 검증한다.
- capture와 restore는 `policy.routes`에 등록된 exact pathname에서만 활성화되고, 같은 policy가 허용 범위 밖의 저장 record를 제거한다.
- schema v2 boot는 v1 snapshot을 restore 전에 제거하며 route별 record를 pathname key로 분리한다.
- 기본 최대 payload는 UTF-8 JSON 기준 1 MiB이고, 초과 snapshot은 저장 계약 밖이다.
- 정적 Vite output은 self-starting `/firsttx-boot.js`를 기본으로 사용한다. Inline boot는 생성된 script의 CSP hash를 관리할 때만 선택한다.

## 측정 기록의 해석

2025-11-19 Chromium `prepaint-heavy` 공개 기록은 cold FCP 140ms, warm FCP 44ms와 96ms의 차이를 남겼다. 동시에 legacy metric key인 `warmHydrationCompleteMs`는 3573.8ms로 `coldHydrationCompleteMs` 974.4ms보다 늦었다. 현재 구현은 hydration이 아니라 빈 root에 React를 mount하므로 이 오래된 field name을 현재 동작 설명으로 사용하지 않는다. 이 기록은 visual replay가 빈 화면 구간을 바꿀 수 있다는 한 시나리오 근거이지, 전체 앱 준비 시간이 항상 줄어든다는 근거가 아니다.

따라서 [[client-state-recovery/recoverable-client-state]]에서는 visual continuity와 application readiness를 별도 지표로 취급한다.

## 적용 판단

- 재방문 빈도가 높고 CSR을 유지해야 할 때만 후보가 된다.
- 첫 도입은 민감하지 않은 exact route의 명시적 opt-in으로 시작한다.
- 이전 DOM은 비상호작용 overlay로 격리하고 실제 React commit 뒤 제거해야 한다.
- snapshot 크기, restore 시간, handoff 시간은 대상 기기와 route에서 다시 측정해야 한다.
- 저장 HTML은 password, marked-sensitive field, 위험 element·attribute·URL scheme을 제거하지만 capture 허용 판단을 대신하지 않는다.
- CSS는 application data처럼 sanitize되지 않으므로 사용자 제어 또는 민감한 style이 가능한 route는 `includeStyles: false` 또는 capture 제외가 필요하다.

## 출처

- [Prepaint package README](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/packages/prepaint/README.md) — accessed 2026-07-19
- [Prepaint handoff Playwright scenario](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/tests/prepaint-handoff.spec.ts) — accessed 2026-07-19
- [Prepaint heavy metric record](https://github.com/joseph0926/firsttx/blob/df1e923d531a06ff5ee8687ae2e5a9369e212186/apps/playground/public/metrics/prepaint-heavy.latest.json) — accessed 2026-07-19
