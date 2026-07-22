# Provenance

이 저장소는 개인 개발 환경에서 운영한 workflow와 공개 source를 독립적으로 읽고 실행할 수 있는 public edition으로 재구성합니다. 원본 전체의 mirror가 아니며, 공개 사례에 필요한 최소 계약과 검증 근거만 유지합니다.

## Artifact provenance

| Artifact | Origin category | Public edition 변경 | Revision 또는 마지막 대조일 |
| --- | --- | --- | --- |
| `content-discovery` UI Lab | 개인 UI Lab에서 운영한 후보 비교 workflow | repository-owned fixture와 세 탐색 모델로 재구성하고 개인 dependency 제거 | public baseline `145e32d`; workflow 대조 2026-07-19 |
| `build-production-ui` | 개인 UI Lab에서 운영한 production UI workflow | repo-local packet과 references만 유지하고 중앙 Knowledge·배포 계약 제거 | 마지막 대조 2026-07-19 |
| Research Skills와 wiki linter | 개인 Knowledge system에서 운영한 research workflow | 4-page 공개 graph와 그 graph를 검증하는 최소 계약으로 축약하고 query source-set drift와 새 U+FFFD를 차단 | 마지막 대조 2026-07-22 |
| Client State Recovery | FirstTx 공개 문서, test와 metric artifact | 긴 원문 대신 source page 3개와 synthesis 1개로 정규화 | [`df1e923`](https://github.com/joseph0926/firsttx/tree/df1e923d531a06ff5ee8687ae2e5a9369e212186), accessed 2026-07-19 |

## 공개용 변경 원칙

- 개인 절대 경로, 중앙 telemetry, 운영 log와 대규모 Knowledge corpus는 포함하지 않습니다.
- 원본 파일을 통째로 복제하지 않고 이 저장소의 schema, fixture와 실행 명령에 맞게 축약합니다.
- 완료 claim은 public edition 안에서 다시 실행할 수 있는 검사나 immutable public source로 확인되는 범위에 한정합니다.
- browser artifact는 상태와 viewport를 대표하는 선별본만 추적하고, 매 실행의 전체 생성물은 임시 CI artifact로 다룹니다.

## Freshness policy

| 대상 | 다시 대조하는 조건 | 갱신 결과 |
| --- | --- | --- |
| Knowledge source | 인용한 upstream 문서·test의 의미 변경 또는 90일 경과 | source revision, accessed date, claim과 synthesis를 함께 갱신 |
| Agent Skill | trigger, approval, terminal state, evidence 계약의 의미 변경 | public packet·references·smoke matrix를 같은 변경으로 갱신 |
| UI evidence | component, fixture, viewport, browser harness 또는 주요 dependency 변경 | desktop/mobile matrix를 다시 실행하고 선별 artifact 교체 |
| README claim | 새 evidence 추가, 기존 evidence 폐기 또는 verification failure | 1분 검토 경로와 현재 범위를 즉시 정렬 |

Public edition과 원본의 차이는 자동으로 drift로 보지 않습니다. 현재 공개 claim에 영향을 주는 누락만 freshness 결함으로 분류합니다.
