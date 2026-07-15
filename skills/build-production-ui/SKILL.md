---
name: build-production-ui
description: 실제 제품의 기존 화면을 전면 리디자인하거나 새 page/section을 설계해 제품 코드에 통합한다. 권위 있는 디자인 source 없이 visual direction을 정하거나, 여러 IA/layout 후보를 비교하고 브라우저 근거로 최종 UI를 선택해야 할 때 사용한다. 작은 스타일 수정, 정확한 Figma/screenshot 복제, review-only 요청에는 사용하지 않는다.
---

# Build Production UI

## 역할

대상 제품의 기존 계약을 보존하면서 네 가지 UI 방향을 설계하고, 상위 두 후보만 격리 구현·검증한 뒤 승인된 방향을 실제 화면에 통합한다.

## 먼저 읽기

1. 가장 가까운 `AGENTS.md`와 대상 저장소의 design source of truth를 읽는다.
2. 대상 route, component, data shape, handler, token, i18n, state와 검증 명령을 확인한다.
3. mode와 승인 gate는 `references/modes-and-gates.md`를 읽는다.
4. packet, screenshot, scoring과 검증 계약은 `references/evidence-and-acceptance.md`를 읽는다.
5. Skill 자체를 수정하거나 검증할 때만 `references/test-cases.md`를 읽는다.

## 워크플로

1. 작업을 `redesign`, `new-page`, `new-section` 중 하나로 분류한다.
2. Redesign은 content, data, handler, routing, i18n, accessibility와 state를 invariant로 고정한다. 새 surface는 인접 화면의 계약과 요청으로 허용된 additive contract를 분리한다.
3. Redesign은 현재 화면을, 신규 surface는 가장 가까운 인접 화면을 baseline으로 남긴다.
4. Visual anchor를 `company`, `non-company`, `none` 중 하나로 정하고 color, typography, density, composition, interaction signal로 번역한다. 외부 anchor를 기존 token과 component보다 우선하지 않는다.
5. `assets/decision-packet.md`를 대상 저장소의 문서 관례에 맞춰 복사하고 acceptance와 evidence 경로를 고정한다.
6. 같은 invariant로 IA, layout, component composition이 다른 방향 네 개를 만든다. 색이나 간격만 다른 방향은 폐기한다.
7. Product fit, hierarchy, feasibility, mobile/state 확장성으로 예비 평가하고 상위 두 후보만 격리 구현한다.
8. 두 후보의 desktop/mobile과 필요한 상태를 캡처하고 동일 rubric으로 평가한다. 생성자와 분리된 평가자를 사용할 수 없으면 그 한계를 기록한다.
9. `select-one` 또는 `synthesize`로 최종 방향을 제안하고 명시적인 승인을 기다린다.
10. 거절·취소 시 candidate-only code를 제거한다. 승인 시 최종 방향을 실제 화면에 통합하고 같은 preview code를 제거한다.
11. typecheck, lint, test/build, acceptance mapping, keyboard/focus, desktop/mobile과 위험 기반 접근성을 검증한다.

## 경계

- 작은 스타일 수정, 정확한 Figma/screenshot 복제, review-only 요청에는 사용하지 않는다.
- 최종 방향 승인 전에 실제 제품 화면을 교체하지 않는다.
- 시각 변경을 이유로 handler, data flow, routing, form, i18n, accessibility 또는 loading/error/recovery state를 제거하지 않는다.
- 실제 사용자 데이터가 screenshot이나 artifact에 남지 않도록 fixture, masking 또는 redaction을 사용한다.
- 라틴 전용 font를 한글 glyph에 그대로 적용하지 않는다.
- mock data에 AI 제품이나 모델 이름을 사용하지 않는다.
- 기존 사용자 변경과 관련 없는 파일을 되돌리지 않는다.

## 완료 보고

대상과 mode, invariant와 additive contract, acceptance source, 네 방향과 구현한 두 후보, capture manifest, score, 최종 결정, 승인 상태, 실제 변경과 preview cleanup, 검증 결과와 남은 위험을 보고한다.

## References

- `references/modes-and-gates.md`
- `references/evidence-and-acceptance.md`
- `references/test-cases.md`
- `assets/decision-packet.md`
