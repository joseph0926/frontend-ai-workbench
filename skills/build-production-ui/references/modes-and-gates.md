# Modes And Gates

## Mode 판별

| Mode | Trigger | Invariant | Baseline | Preview |
| --- | --- | --- | --- | --- |
| Redesign | 기존 route/screen의 IA 또는 visual language 교체 | 기존 content, data, handler, routing, i18n, a11y, state | 현재 화면 desktop/mobile | target repo 안의 격리 candidate |
| New page | 실제 앱에 새 production route/page 추가 | 기존 design system/navigation/shell을 보존하고 새 route, metadata, data source/handler, i18n, state를 approved additive contract로 고정 | 공유 shell 또는 인접 route | dev route/story 뒤 production route |
| New section | 기존 화면에 새로운 product surface 추가 | 기존 주변 layout/data flow를 보존하고 새 user job, data source/handler, copy/i18n, responsive/state를 approved additive contract로 고정 | section 삽입 전 대상 화면 | preview component 또는 dev-only state |

Small styling tweak, exact Figma/screenshot handoff, review-only 요청은 이 스킬 범위 밖이다.

## Redesign register

### Refine

“다듬기”, “정리”, “개선”처럼 유지 신호가 강하면 기존 topology와 section order를 기본 invariant로 둔다. 네 방향은 hierarchy, density, typography, state craft에서 달라야 한다. Topology 변경이 필요하면 이유를 packet에 적고 strong recomposition 여부를 확인한다.

### Strong recomposition

“아예 새롭게”, “기존 UI 폐기”, “전면 리디자인”이면 content/function 계약만 보존하고 IA, DOM 골격, section order와 component topology를 다시 설계한다. 네 방향 중 최소 두 개는 기존 화면과 다른 topology를 가져야 한다.

## Baseline 계약

- Redesign baseline은 필수다. 기술적으로 캡처할 수 없으면 이유, 현재 구조 evidence와 대체 비교 방법을 packet에 남기고 구현 전 사용자에게 알린다.
- New page는 같은 shell/navigation/token을 쓰는 인접 route를 comparison baseline으로 고른다.
- New section은 삽입 전 화면을 baseline으로 캡처한다.
- Dark/light 또는 locale 축이 제품 계약이면 대표 baseline에 포함한다.
- Capture 전에 route/params, data state/source, exact viewport, environment/source revision과 sensitive-data handling을 packet에 고정한다.

## 격리 우선순위

1. 기존 story 또는 sandbox.
2. 기존 dev route 또는 preview route.
3. 실제 provider와 token을 쓰는 preview component.
4. Target repo 안의 static prototype.

Static prototype도 target repo의 실제 contract와 existing safe fixture를 우선하고 임의 product content/data를 발명하지 않는다. 어떤 방식도 안전하게 만들 수 없으면 네 방향과 top-two implementation plan까지만 제공하고 production 변경을 중단한다.

## 승인 Gate

- 네 방향 설계와 상위 두 후보 선택에는 별도 production 승인이 필요하지 않다.
- 두 후보의 screenshot·score와 `select-one | synthesize` final decision을 제시한 뒤 명시 승인을 받는다.
- “바로 반영”, “진행”, “기존 UI 폐기” 같은 초기 요청은 final synthesis 승인이 아니다.
- 승인 뒤 scope가 바뀌면 packet을 갱신하고 변경된 방향을 다시 승인받는다.

## Integration과 cleanup

- 승인된 final direction만 production route에 통합한다.
- `select-one`이면 선택된 후보만, `synthesize`이면 승인된 조합만 production route에 통합한다.
- Candidate 전용 route, registry, fixture, style scope와 preview component를 제거한다.
- Production에서도 필요한 shared component와 token만 남긴다.
- Decision packet과 baseline/candidate/final screenshot은 유지한다.
- Cleanup 뒤 route, import, registry와 build artifact에 candidate 참조가 남지 않았는지 확인한다.

## 거절·취소·실패 Gate

- 사용자가 final direction을 거절하거나 작업을 취소하면 production behavior를 바꾸지 않고 candidate-only code를 제거한 뒤 `rejected` 또는 `cancelled`로 닫는다.
- 승인 뒤 integration verification이 실패하면 `integration-failed`로 기록한다. 이전 production behavior를 안전하게 복구할 수 있으면 복구하고, 그렇지 않으면 추가 변경을 멈추고 blocker와 recovery plan을 보고한다.
- 어떤 terminal state도 candidate-only route, registry, fixture, style scope 또는 preview component 잔여가 있으면 닫지 않는다.
