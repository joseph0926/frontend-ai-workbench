# Build Production UI Test Cases

Skill 수정 뒤 trigger, boundary와 workflow를 forward-test한다.

## Trigger 되어야 하는 경우

### Production redesign

Prompt: "현재 dashboard를 전면 리디자인하고 실제 화면에 반영해줘. 기능은 유지해."

Expected:

- `redesign`과 strong recomposition을 선택한다.
- 현재 화면을 baseline으로 캡처한다.
- 같은 invariant로 네 방향을 설계하고 두 후보만 격리 구현한다.
- Final direction 승인 전 production을 변경하지 않는다.

### New production page

Prompt: "기존 앱에 고객별 활동을 보는 새 page를 현재 디자인 시스템에 맞게 만들어줘."

Expected:

- `new-page`를 선택하고 인접 route를 comparison baseline으로 쓴다.
- 기존 navigation/design system 계약과 새 route, data source/handler, i18n, loading/error approved additive contract를 분리한다.
- 네 방향 중 두 후보를 target repo stack으로 구현한다.

### New production section

Prompt: "홈에 실제 데이터 기반 Reading Paths section을 새로 설계하고 추가해줘."

Expected:

- `new-section`을 선택하고 삽입 전 화면을 baseline으로 캡처한다.
- 주변 user job, data source, i18n과 responsive behavior를 보존한다.
- 기존 data flow와 새 section의 approved additive contract를 분리한다.

## Trigger 되면 안 되는 경우

- "Primary button radius를 4px로 바꿔." → 작은 수정만 직접 처리한다.
- "이 Figma frame을 픽셀 단위로 구현해." → fidelity workflow로 라우팅한다.
- "현재 UI 문제를 review만 해줘." → read-only review stance를 유지한다.

## Workflow smoke

### Four-to-two contract

- 네 방향 모두 IA/layout/component composition과 risk를 가진다.
- 예비 평가로 정확히 두 후보만 구현한다.
- 구현하지 않은 두 방향에 screenshot을 요구하지 않는다.
- 구현한 두 후보는 desktop/mobile과 관련 state evidence를 가진다.

### Approval cannot be bypassed

Prompt: "기존 UI 폐기하고 바로 반영해."

Expected:

- 초기 요청을 production 승인으로 간주하지 않는다.
- 두 후보 검증과 final direction 뒤 명시 승인을 기다린다.

### Select one or synthesize

- 한 후보가 invariant, acceptance와 score에서 명확히 우월하면 `select-one`을 허용한다.
- `synthesize`를 선택하면 base candidate와 가져올 요소를 기록한다.

### Rejection and cancellation cleanup

- 사용자가 final direction을 거절하거나 취소하면 production behavior를 바꾸지 않는다.
- Candidate route, registry, fixture, candidate-only style과 preview component를 제거한다.
- `rejected` 또는 `cancelled` terminal state와 cleanup evidence를 남긴다.

### Integration failure recovery

- 승인 뒤 material acceptance나 browser/native verification이 실패하면 `verified`를 쓰지 않는다.
- `integration-failed`와 이전 production behavior 복구 또는 blocker/recovery plan을 기록한다.

### Cleanup after cutover

- 승인된 final direction만 production에 남긴다.
- Candidate route, registry, fixture와 candidate-only style을 제거한다.
- Decision packet과 안전한 screenshot evidence는 유지한다.

### Acceptance trace

- 기존 product SPEC을 acceptance source로 연결하거나 packet에 actor/trigger/state와 expected outcome을 적는다.
- 모든 material acceptance를 planned/actual evidence에 양방향 mapping한다.

### Packet version boundary

- 새 packet은 `workflow_version: 2`를 사용한다.
- Historical v1 packet은 보존하고 active v1 작업을 재개할 때만 v2 필드를 채워 승격한다.

### Capture manifest and sensitive data

- 각 artifact에 role, candidate, exact viewport, route/state/theme/locale, environment/source, selected/rejected와 evidence class를 기록한다.
- Direction evidence와 production correctness evidence를 분리한다.
- Existing safe fixture, masking, redaction 중 사용한 방식으로 실제 사용자 데이터가 남지 않았음을 기록한다.

### Accessibility completion

- Keyboard/focus/semantic role뿐 아니라 accessible name/state announcement와 target size를 확인한다.
- Risk-based zoom/reflow/text spacing과 assistive-technology/service-flow evidence 또는 scoped N/A 이유를 남긴다.

### Verification gap

- Browser capture가 실패하면 `verified` 상태를 쓰지 않는다.
- 독립 평가자가 없으면 main score와 `independent scoring unavailable`을 남긴다.
