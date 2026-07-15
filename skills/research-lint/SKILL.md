---
name: research-lint
description: 저장소의 knowledge base에 구조 lint, page-quality manifest와 routing audit을 실행하고 결과를 severity와 수정 책임에 따라 분류한다. Canonical page는 직접 수정하지 않으며 실제 수정은 research-workflow, 질문·검색은 research-query로 넘긴다.
---

# Research Lint

## 역할

`scripts/wiki-lint.py` 결과를 `knowledge/SCHEMA.md`에 따라 해석하고, 기계적으로 확정할 수 있는 결함과 의미 검토가 필요한 후보를 분리한다.

## 먼저 읽기

1. 가장 가까운 `AGENTS.md`
2. `knowledge/SCHEMA.md`의 Lint 계약
3. `scripts/wiki-lint.py`
4. Skill을 수정하거나 검증할 때만 `references/test-cases.md`

## 워크플로

### 1. 실행

```bash
python scripts/wiki-lint.py knowledge/
python scripts/wiki-lint.py knowledge/ --audit-manifest
python scripts/wiki-lint.py knowledge/ --routing-audit
```

단일 topic 요청이면 세 명령 모두 `knowledge/<topic>/` 범위로 실행한다. 재현 가능한 sample이 필요하면 `--audit-manifest --seed YYYY-MM-DD`를 사용한다.

### 2. 분류

| 분류 | 예시 | 처리 |
| --- | --- | --- |
| 기계적 결함 | frontmatter 누락, 깨진 link, index 미등록 | error/warning 그대로 보고한다. |
| 사용자 결정 필요 | page 분할, lifecycle 변경, 상충 claim 해소 | 선택지와 영향을 제시한다. |
| 의미 검토 필요 | confidence와 근거 불일치, synthesis가 단순 요약인지 여부 | 본문과 source를 읽은 뒤에만 판정한다. |

Audit manifest와 routing audit의 후보는 결함 확정이 아니다. 후보 수와 선정 이유를 먼저 보고하고 요청된 범위만 의미 검토한다.

### 3. 보고

- 검증 범위와 page 수
- error / warning / info 수
- 분류별 대표 finding
- priority / synthesis / random sample 후보
- routing과 관계 후보
- 실행하지 못한 검사와 이유

## 경계

- Canonical page를 직접 수정하지 않는다.
- 모든 warning을 error처럼 보고하지 않는다.
- Validator와 Schema를 사용자 요청 없이 함께 변경하지 않는다.
- Audit 후보만 보고 의미 결함으로 단정하지 않는다.
- 실제 수정은 사용자 확인 뒤 research-workflow로 넘긴다.

## 검증

- 세 명령의 exit code와 scope를 확인한다.
- 인용한 finding과 실제 파일 위치를 대조한다.
- 기존 dirty file을 lint가 만든 변경으로 단정하지 않는다.
- 한글 파일을 읽었다면 U+FFFD 부재를 확인한다.
