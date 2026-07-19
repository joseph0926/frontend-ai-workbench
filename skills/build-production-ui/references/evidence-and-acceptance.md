# Evidence And Acceptance

## Decision packet

대상 repo의 기존 spec/design 문서 관례를 우선한다. 관례가 없으면 `assets/decision-packet.md`를 repo-local 문서로 복사한다.

필수 frontmatter:

- `workflow_version: 2`
- `status: draft | awaiting-approval | approved | rejected | cancelled | integration-failed | verified`
- `target`
- `mode: redesign | new-page | new-section`
- `anchor`
- `baseline`
- `acceptance_source`
- `candidate_ids`: 네 설계 방향
- `implemented_candidate_ids`: 구현한 두 후보
- `final_decision_mode: select-one | synthesize`
- `approved_direction`
- `capture_manifest`

상태 전이:

1. Repo ingest와 brief가 닫히면 `draft`.
2. 두 candidate evidence와 final synthesis가 준비되면 `awaiting-approval`.
3. 사용자가 final direction을 승인하면 `approved`.
4. 사용자가 거절하거나 취소하면 candidate-only code를 제거하고 `rejected` 또는 `cancelled`.
5. Production integration 뒤 material acceptance나 verification이 실패하면 `integration-failed`. 안전하면 이전 production behavior를 복구하고, 안전하지 않으면 blocker와 recovery plan을 남긴다.
6. Production integration, cleanup, acceptance mapping과 browser/native verification이 끝나면 `verified`.

Browser 검증을 수행하지 못하거나 material acceptance evidence가 비어 있거나 blocker가 남으면 `verified`를 쓰지 않는다. `rejected`, `cancelled`, `integration-failed`도 cleanup/recovery evidence 없이 terminal로 닫지 않는다.

Packet은 target repo의 product SPEC을 `acceptance_source`로 연결하거나 actor/trigger/state, expected outcome, edge/TBD와 planned/actual evidence를 직접 기록한다. 각 material acceptance는 verification evidence로 정방향·역방향 추적되어야 한다.

새 packet은 v2로 만든다. Historical v1 packet은 소급 migration하지 않지만 active v1 작업을 재개하면 acceptance trace, additive contract, final decision mode, capture manifest와 recovery 상태를 채운 뒤 v2로 올린다.

## Artifact contract

Repo artifact 규칙이 없으면 아래 구조를 사용한다.

```text
artifacts/uiux/<slug>/
  baseline/<surface>-<viewport-name>-<width>x<height>-<theme-or-locale>.png
  <candidate-id>/<state>-<viewport-name>-<width>x<height>-<theme-or-locale>.png
  final/<state>-<viewport-name>-<width>x<height>-<theme-or-locale>.png
```

- Candidate screenshot은 구현한 두 후보에만 필수다.
- Desktop과 mobile을 모두 남긴다.
- 제품에 light/dark 또는 locale 축이 있으면 regression 위험이 있는 대표 조합을 포함한다.
- Focus와 hover는 의도적으로 결합된 상태가 아니면 분리한다.
- Screenshot 경로와 실제 파일 존재를 대조한다.
- Capture manifest는 artifact role, candidate, exact viewport, route/params, data state/source, theme/locale, environment/source revision, selected/rejected 상태를 실제 파일과 대조한다.
- Baseline/candidate direction evidence와 final production correctness evidence를 같은 종류의 증거로 취급하지 않는다.
- 실제 사용자 데이터는 artifact에 남기지 않는다. Existing safe fixture, masking, redaction 중 사용한 방식과 확인 결과를 manifest에 남긴다.

## State matrix

각 상태를 `implemented`, `covered-by-existing`, `not-applicable`, `deferred` 중 하나로 닫고 근거를 남긴다.

| State | Evidence |
| --- | --- |
| loading / first-load | stable shell, skeleton, existing suspense evidence, or N/A reason |
| refresh / busy | pending signal, `aria-busy`, preserved stale content, or N/A reason |
| empty / no-results | state-specific copy and next action, or N/A reason |
| error / recovery | scoped error, retry/fix/navigation action, or N/A reason |
| focus / keyboard | visible focus, semantic role, keyboard path, screenshot/test |
| accessible name / state announcement | role, accessible name, expanded/selected/busy/error state announcement |
| hover / pointer | pointer affordance that does not replace focus/touch access |
| target size / touch | context-appropriate hit area and non-hover touch path |
| disabled / blocked | reason or prerequisite signal |
| selected / current | persistent state stronger than hover |
| reduced motion | static fallback or N/A reason |
| zoom / reflow / text spacing | no overlap, clipping, or lost function at required zoom/text settings |
| assistive technology / service flow | risk-based screen reader or equivalent task-flow evidence, or scoped N/A reason |

## Candidate scoring

네 설계 방향은 product fit, hierarchy, feasibility, mobile/state 확장성으로 예비 평가해 구현할 두 후보를 고른다. 구현한 두 후보는 아래 0-2 rubric 전체로 평가한다.

| Axis | 0 | 1 | 2 |
| --- | --- | --- | --- |
| First-glance comprehension | user job이 보이지 않음 | 약간의 마찰 | 즉시 파악 가능 |
| Information hierarchy | flat/noisy | 대체로 명확 | scan path와 priority가 강함 |
| Visual completion | generic/unfinished | 수용 가능 | 의도적이고 polished |
| Product fit | 제품 맥락과 충돌 | tradeoff 존재 | user job과 강하게 일치 |
| Implementation feasibility | 침투적/고위험 | 관리 가능 | local하고 유지보수 가능 |
| Mobile stability | 깨짐/과밀 | 사용 가능 | 의도적이고 안정적 |
| State extensibility | happy path 전용 | 일부 상태 계획 | 일관된 state system |
| Surface economy | 장식적 surface 중첩 | 일부 경계만 설명됨 | 모든 경계가 user job을 설명 |

점수가 높아도 invariant나 acceptance를 위반한 후보는 승인하지 않는다. Final direction은 가장 강한 후보를 그대로 선택하는 `select-one` 또는 검증된 요소를 결합하는 `synthesize` 중 하나로 닫고 base candidate와 선택·기각 근거를 기록한다.

## Production verification

작은 관련 check부터 실행하고 blast radius에 맞춰 넓힌다.

- Targeted typecheck, lint, unit/component test, build.
- Target route desktop/mobile browser capture.
- Acceptance→task/test/manual evidence 양방향 mapping.
- Keyboard path, focus-visible, semantic role/name/state announcement, contrast, target size.
- Risk-based zoom/reflow/text spacing과 assistive-technology/service-flow 확인.
- Loading/empty/error/recovery evidence for 바뀐 data surface.
- Theme/locale/regression route 확인.
- Capture manifest와 screenshot actual file, environment/source, sensitive-data handling 대조.
- Candidate preview code와 import/route/registry 잔여 확인.
- `git diff --check`와 사용자 변경 보존 확인.

실행하지 못한 check는 이유와 가장 가까운 대체 evidence를 기록한다.

## Final handoff

- Target와 mode.
- Existing content/function invariant와 approved additive contract.
- Acceptance source와 acceptance→evidence coverage.
- Anchor decision과 local signal mapping.
- 네 설계 방향과 구현한 두 후보.
- Baseline/candidate/final screenshot path.
- 두 후보 score와 `select-one | synthesize` final decision.
- 사용자 승인 evidence.
- Terminal state와 rejected/cancelled/integration-failed cleanup 또는 recovery evidence.
- Production 변경 파일과 제거한 preview code.
- Verification command/result와 remaining risk.
