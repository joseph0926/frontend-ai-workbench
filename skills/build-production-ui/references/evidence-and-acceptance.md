# Evidence And Acceptance

## Decision packet

대상 저장소에 기존 spec 관례가 없으면 `assets/decision-packet.md`를 복사한다.

필수 상태는 `draft`, `awaiting-approval`, `approved`, `rejected`, `cancelled`, `integration-failed`, `verified`다. Browser 근거, 주요 acceptance 또는 cleanup이 비어 있으면 `verified`로 닫지 않는다.

## Artifact contract

```text
artifacts/uiux/<slug>/
  baseline/<surface>-<viewport>-<width>x<height>.png
  <candidate-id>/<state>-<viewport>-<width>x<height>.png
  final/<state>-<viewport>-<width>x<height>.png
```

Capture manifest에는 artifact role, candidate, viewport, route/params, state, theme/locale, environment/source revision, 선택·기각 상태와 민감정보 처리 방식을 기록한다. 후보 방향을 비교하는 근거와 실제 제품 반영 후 correctness 근거를 구분한다.

## State matrix

각 상태를 `implemented`, `covered-by-existing`, `not-applicable`, `deferred` 중 하나로 닫는다.

- loading / refresh / empty / error / recovery
- focus / keyboard / accessible name / state announcement
- hover / touch target / disabled / selected
- reduced motion / zoom / reflow / text spacing
- 위험 기반 assistive-technology 또는 실제 작업 흐름

## Candidate scoring

네 방향을 product fit, hierarchy, feasibility와 mobile/state 확장성으로 예비 평가해 두 후보를 고른다. 구현한 두 후보는 다음 축을 0~2점으로 평가한다.

- first-glance comprehension
- information hierarchy
- visual completion
- product fit
- implementation feasibility
- mobile stability
- state extensibility
- surface economy

점수가 높아도 invariant나 acceptance를 위반하면 선택하지 않는다. `synthesize`를 선택하면 base candidate와 가져올 요소, 제외할 요소를 분리한다.

## Production verification

- Targeted typecheck, lint, unit/component test와 build
- 대상 route의 desktop/mobile browser capture
- acceptance와 실제 evidence의 양방향 mapping
- keyboard, focus-visible, semantic role/name/state, contrast와 target size
- loading/empty/error/recovery와 theme/locale 회귀
- capture manifest와 실제 파일 대조
- candidate route/import/registry/style 잔여 확인
- 기존 사용자 변경 보존 확인

실행하지 못한 검증은 이유와 가장 가까운 대체 근거를 기록한다.

## Final handoff

- Target와 mode
- invariant와 additive contract
- acceptance source와 evidence coverage
- anchor와 local signal mapping
- 네 방향, 구현한 두 후보와 score
- 최종 결정과 승인 근거
- 종료 상태와 cleanup/recovery
- 실제 변경 파일과 제거한 preview code
- 검증 결과와 남은 위험
