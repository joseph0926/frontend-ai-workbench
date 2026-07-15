# Build Production UI Smoke Matrix

| Case | 요청 | 기대 동작 |
| --- | --- | --- |
| redesign | `기능은 유지하고 현재 dashboard를 전면 리디자인해줘` | baseline과 invariant를 고정하고 네 방향 중 두 후보만 격리 구현한 뒤 승인을 기다린다. |
| new page | `기존 앱에 고객 활동을 보는 새 page를 추가해줘` | 인접 route를 baseline으로 쓰고 새 route/data/i18n/state를 additive contract로 분리한다. |
| new section | `홈에 실제 데이터 기반 section을 새로 설계해줘` | 삽입 전 화면과 주변 data flow를 보존하고 두 후보를 비교한다. |
| small tweak | `버튼 radius를 4px로 바꿔줘` | Skill을 사용하지 않고 작은 변경으로 처리한다. |
| exact handoff | `이 Figma frame을 그대로 구현해줘` | fidelity workflow로 넘긴다. |
| review only | `현재 UI 문제를 review만 해줘` | 읽기 전용 review로 처리한다. |
| approval | `기존 UI를 바로 교체해줘` | 초기 요청을 최종 승인으로 간주하지 않는다. |
| rejection | 사용자가 두 후보를 모두 거절함 | 제품 동작을 바꾸지 않고 candidate-only code를 제거한다. |
| integration failure | 반영 뒤 주요 acceptance가 실패함 | `verified`를 쓰지 않고 복구 또는 recovery plan을 남긴다. |
| sensitive artifact | 실제 사용자 데이터가 화면에 있음 | fixture, masking 또는 redaction 뒤에만 artifact를 남긴다. |
