---
schema_version: 1
type: source
tags: [client-state-recovery]
sources:
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/prepaint/README.md — accessed 2026-07-15"
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/tests/prepaint-handoff.spec.ts — accessed 2026-07-15"
  - "https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/public/metrics/prepaint-heavy.latest.json — accessed 2026-07-15"
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

# FirstTx Prepaint의 visual replay 경계

## Source 범위

Prepaint는 CSR 애플리케이션의 재방문 시점에 이전 DOM snapshot을 IndexedDB에서 읽어 React bundle보다 먼저 보여주는 렌더 레이어다. 저장된 DOM을 hydration 대상으로 사용하지 않고 React root 밖의 Shadow DOM overlay에 비상호작용 visual cache로 표시한다.

이 경계는 [[client-state-recovery/firsttx-local-first]]의 데이터 snapshot이나 [[client-state-recovery/firsttx-tx]]의 변경 복구와 역할이 다르다. Prepaint가 보장하려는 것은 최신 데이터나 완료된 interaction이 아니라 React가 준비되는 동안의 시각적 연속성이다.

## 확인된 동작

- 공개 Playwright 시나리오는 main bundle 요청을 지연한 상태에서 overlay가 유지되고 React root가 비어 있는지 확인한다.
- overlay의 `pointer-events`가 `none`인지 검사해 이전 화면이 조작 가능한 UI로 오인되지 않게 한다.
- React의 실제 product grid가 나타난 뒤 overlay와 prepaint marker가 제거되는 handoff를 검증한다.
- package 문서는 첫 방문에는 snapshot이 없고, pure CSR과 Vite plugin을 대상으로 하며, 저장된 DOM을 hydration하지 않는다고 범위를 제한한다.

## 측정 기록의 해석

2025-11-19 Chromium `prepaint-heavy` 공개 기록은 cold FCP 140ms, warm FCP 44ms와 96ms의 차이를 남겼다. 동시에 warm hydration complete는 3573.8ms로 cold 974.4ms보다 늦었다. 이 기록은 visual replay가 빈 화면 구간을 바꿀 수 있다는 시나리오 근거이지, 전체 앱 준비 시간이 항상 줄어든다는 근거가 아니다.

따라서 [[client-state-recovery/recoverable-client-state]]에서는 visual continuity와 application readiness를 별도 지표로 취급한다.

## 적용 판단

- 재방문 빈도가 높고 CSR을 유지해야 할 때만 후보가 된다.
- 이전 DOM은 비상호작용 overlay로 격리하고 실제 React commit 뒤 제거해야 한다.
- snapshot 크기, restore 시간, handoff 시간은 대상 기기와 route에서 다시 측정해야 한다.
- DOM에 민감정보가 노출될 수 있는 화면은 capture 제외 또는 별도 정제 경계가 필요하다.

## 출처

- [Prepaint package README](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/packages/prepaint/README.md) — accessed 2026-07-15
- [Prepaint handoff Playwright scenario](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/tests/prepaint-handoff.spec.ts) — accessed 2026-07-15
- [Prepaint heavy metric record](https://github.com/joseph0926/firsttx/blob/7a13950d0268c3b9d6655b06c2398f330aaf9123/apps/playground/public/metrics/prepaint-heavy.latest.json) — accessed 2026-07-15
