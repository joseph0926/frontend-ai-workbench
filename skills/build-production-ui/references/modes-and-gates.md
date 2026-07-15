# Modes And Gates

## Mode

| Mode | Trigger | 보존할 계약 | Baseline |
| --- | --- | --- | --- |
| `redesign` | 기존 화면의 IA 또는 visual language 교체 | content, data, handler, routing, i18n, accessibility, state | 현재 화면 |
| `new-page` | 새 production route 추가 | design system, navigation, shell과 승인된 새 route/data/state | 인접 route 또는 shared shell |
| `new-section` | 기존 화면에 새 product surface 추가 | 주변 layout/data flow와 승인된 새 user job/data/state | section 삽입 전 화면 |

## Redesign 강도

- `refine`: 기존 topology와 section order를 유지하고 hierarchy, density, typography와 state 완성도를 바꾼다.
- `strong-recomposition`: content와 기능 계약만 보존하고 IA, section order와 component topology를 다시 설계한다. 네 방향 중 최소 두 개는 기존 화면과 다른 topology를 가져야 한다.

## Baseline

- route/params, data state/source, viewport, theme/locale과 민감정보 처리 방식을 함께 기록한다.
- 캡처가 불가능하면 이유와 대체 비교 방법을 구현 전에 남긴다.

## 격리 우선순위

1. 기존 story 또는 sandbox
2. dev/preview route
3. 실제 provider와 token을 쓰는 preview component
4. 대상 저장소 안의 static prototype

## 승인과 종료

- 네 방향 설계와 상위 두 후보 구현은 실제 제품 반영 승인이 아니다.
- 두 후보의 근거와 최종 결정을 제시한 뒤 명시적인 승인을 받는다.
- 거절·취소 시 제품 동작을 바꾸지 않고 candidate-only code를 제거한다.
- 승인 뒤 검증이 실패하면 `integration-failed`로 기록하고 안전하면 이전 동작을 복구한다.
- 어떤 종료 상태에서도 candidate route, registry, fixture, 전용 style과 preview component를 남기지 않는다.
