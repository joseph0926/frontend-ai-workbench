---
workflow_version: 2
status: draft
target: ""
mode: redesign
anchor: ""
baseline: ""
acceptance_source: ""
candidate_ids: []
implemented_candidate_ids: []
final_decision_mode: ""
approved_direction: ""
capture_manifest: ""
---

# Production UI Decision Packet

## Target와 사용자 Job

- Target route/component:
- 사용자 job:
- 현재 구조:

## Invariant와 Non-goal

- Existing content/function invariant:
- Existing data/handler/routing/i18n/a11y/state invariant:
- Approved additive contract for new page/section:
- Non-goal:

## Acceptance와 Evidence Trace

- Acceptance source:
- Edge cases:
- TBD와 owner/decision trigger:

| ID | Actor/trigger/state | Expected outcome | Planned/actual evidence | Status |
| --- | --- | --- | --- | --- |
| AC1 | | | | pending |

## Anchor Decision

- Decision: company / non-company / none
- Evidence/source:
- Local signal mapping: color, typography, spacing/density, composition, interaction/motion

## Baseline

- Type: current-screen / adjacent-surface / shared-shell
- Route/params와 data state/source:
- Exact desktop/mobile viewport:
- Theme/locale axes:
- Environment/source revision:
- Sensitive-data handling:
- Capture gap:

## Capture Manifest

| Artifact path | Role | Candidate | Viewport | Route/state/theme/locale | Environment/source | Selection | Evidence class | Sensitive-data handling |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | baseline / candidate / final / state | | | | | selected / rejected / N/A | direction / production-correctness | |

## Four Directions

| ID | IA/layout/component composition | Strength | Risk | Preliminary score | Implement? |
| --- | --- | --- | --- | --- | --- |
| A | | | | | |
| B | | | | | |
| C | | | | | |
| D | | | | | |

## Implemented Candidates

- Candidate:
  - Preview surface:
  - State coverage:
  - Screenshot paths:
  - Artifact roles:
  - Score:
  - Selection/rejection reason:
- Candidate:
  - Preview surface:
  - State coverage:
  - Screenshot paths:
  - Artifact roles:
  - Score:
  - Selection/rejection reason:

## Final Synthesis와 승인

- Decision mode: select-one / synthesize
- Selected base candidate:
- 가져올 요소:
- 제외할 요소:
- 영향 파일:
- 남은 위험:
- 승인 evidence/date:

## Terminal State와 Recovery

- Terminal state: approved / rejected / cancelled / integration-failed / verified
- Reason/evidence:
- Candidate-only cleanup:
- Previous production behavior recovery 또는 blocker/recovery plan:

## Production Integration과 Cleanup

- Integrated files:
- Removed preview code:
- Preserved evidence:

## Verification

- Commands/results:
- Acceptance→evidence coverage:
- Browser/keyboard/a11y evidence:
- Accessible name/state announcement, target size, zoom/reflow/text spacing evidence:
- Assistive-technology/service-flow evidence 또는 risk-based N/A 이유:
- Regression evidence:
- Gaps:
