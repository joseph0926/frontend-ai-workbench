---
name: build-production-ui
description: 실제 제품의 기존 화면을 전면 리디자인하거나 새 page/section을 설계해 production에 통합한다. 권위 있는 디자인 source 없이 visual direction을 정하거나, 여러 IA/layout 후보를 비교하고 브라우저 근거로 최종 UI를 선택해야 할 때 사용한다. 작은 스타일 수정, 정확한 Figma/screenshot 복제, review-only 요청에는 사용하지 않는다.
---

# Build Production UI

## 역할

실제 제품 repo의 기존 계약을 보존하면서 네 가지 UI 방향을 설계하고, 상위 두 후보만 격리 구현·검증한 뒤 사용자가 승인한 최종 방향을 production에 통합한다. 디자인 탐색보다 제품 계약 보존과 검증 가능한 delivery를 우선한다.

## 먼저 읽기

1. 가장 가까운 `AGENTS.md`와 대상 repo의 UI/design source of truth를 읽는다.
2. 대상 route, component, data shape, handler, token, i18n, state, preview surface와 검증 명령을 확인한다.
3. mode, baseline, 승인·격리 규칙은 `references/modes-and-gates.md`를 읽는다.
4. packet, screenshot, scoring, state와 verification 계약은 `references/evidence-and-acceptance.md`를 읽는다.
5. Skill을 검증하거나 수정할 때만 `references/test-cases.md`를 읽는다.

## 워크플로

1. 작업을 `redesign`, `new-page`, `new-section` 중 하나로 분류한다. Redesign은 기존 content, data, handler, routing, i18n, accessibility와 state를 invariant로 고정한다. 새 surface는 인접 화면의 기존 계약과 요청으로 허용된 `approved additive contract`를 분리한다.
2. Redesign은 현재 화면을 baseline으로 캡처한다. 신규 surface는 공유 shell 또는 가장 가까운 인접 화면을 comparison baseline으로 남긴다.
3. Visual anchor를 `company`, `non-company`, `none` 중 하나로 닫고 color, typography, spacing/density, composition, interaction/motion signal로 번역한다. 외부 seed를 local token과 component보다 권위 있게 취급하지 않는다.
4. `assets/decision-packet.md`를 대상 repo 관례에 맞게 복사해 common brief와 evidence 경로를 고정한다. 기존 product SPEC이 있으면 acceptance source로 연결하고, 없으면 packet에서 acceptance, edge/TBD와 acceptance→evidence trace를 닫는다.
5. 같은 content/data invariant로 IA, layout, component composition이 다른 방향 네 개를 만든다. 색·border·spacing만 다른 후보는 폐기한다.
6. Product fit, hierarchy, feasibility, mobile/state 확장성으로 네 방향을 예비 평가하고 상위 두 후보만 target repo의 story, dev route, preview component 같은 격리 표면에 구현한다.
7. 두 후보의 desktop/mobile과 필요한 state evidence를 캡처한다. Manifest에 artifact role, exact viewport, route/params, data source, theme/locale, environment/source revision, 선택 상태와 sensitive-data 처리 방식을 기록하고 direction evidence와 production correctness evidence를 분리한다.
8. 검증 결과에 따라 `select-one` 또는 `synthesize` final direction과 선택·기각 근거, 영향 파일, 검증 계획과 남은 위험을 제시한 뒤 사용자 명시 승인을 기다린다. 초기 요청의 “바로 반영”은 이 gate를 생략하지 않는다.
9. 사용자가 거절하거나 취소하면 candidate-only code를 제거한다. 승인하면 최종 방향을 실제 route에 통합하고 같은 preview code를 제거한다.
10. Repo-native typecheck, lint, test/build, acceptance mapping, keyboard/focus, desktop/mobile browser check와 위험 기반 접근성을 검증한다. Browser 또는 material acceptance evidence가 없으면 `verified`로 닫지 않는다. Integration verification이 실패하면 `integration-failed`와 복구 결과 또는 recovery plan을 기록한다.

## 경계

- 작은 스타일 수정, 정확한 Figma/screenshot 복제, review-only 요청에는 사용하지 않는다.
- Final direction 승인 전에 production behavior를 교체하지 않는다.
- Brownfield repo의 global/shared token을 바로 덮어쓰지 않고 필요한 visual language를 scoped layer로 도입한다.
- Handler, data flow, routing, form, i18n, accessibility, loading/error/recovery state를 시각 변경 때문에 제거하지 않는다.
- Tab, menu, dialog, accordion 같은 pattern은 semantic role, keyboard path와 focus-visible을 함께 구현한다.
- 실제 사용자 데이터가 screenshot이나 artifact에 남지 않도록 안전한 fixture, masking 또는 redaction을 사용하고 근거를 기록한다.
- 라틴 전용 font를 한글 glyph에 그대로 적용하지 않는다.
- Mock data에 AI 제품이나 모델 이름을 사용하지 않는다.
- 기존 사용자 변경과 관련 없는 파일을 되돌리지 않는다.

## 완료 보고

대상과 mode, 기존 invariant와 approved additive contract, acceptance source/trace, anchor decision, 네 방향과 구현한 두 후보, capture manifest, score, `select-one | synthesize` 결정, terminal state, production 변경, preview cleanup, 검증 결과와 남은 위험을 보고한다.

## References

- `references/modes-and-gates.md`
- `references/evidence-and-acceptance.md`
- `references/test-cases.md`
- `assets/decision-packet.md`
