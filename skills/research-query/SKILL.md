---
name: research-query
description: 사용자가 이 저장소의 knowledge base, `knowledge/`, 또는 구체적인 topic/page에서 검색·비교·근거 확인을 요청할 때 사용한다. 일반 기술 질문이나 구현 전 코드 탐색에는 사용하지 않으며, 지식 문서 작성은 research-workflow, 품질 검사는 research-lint로 넘긴다.
---

# Research Query

## 역할

repo-local knowledge base의 active page를 읽어 claim과 출처를 연결해 답한다. Canonical page는 수정하지 않으며, 근거 공백만 write-back 후보로 남길 수 있다.

## Trigger

- 사용자가 `research-query`를 명시한다.
- 사용자가 knowledge base, `knowledge/`, 또는 특정 topic/page에서 찾아 달라고 요청한다.
- 사용자가 wiki 결론과 최신 공식 source를 비교해 달라고 요청한다.

일반 기술 질문, 의견 요청, 최신 웹 검색 또는 구현을 위한 저장소 탐색에는 사용하지 않는다.

## 먼저 읽기

1. 가장 가까운 `AGENTS.md`
2. `knowledge/SCHEMA.md`의 Query 계약
3. `knowledge/index.md`
4. topic이 정해진 뒤 해당 topic `index.md`
5. Skill을 수정하거나 검증할 때만 `references/test-cases.md`

## 실행 계약

1. 질문을 lookup, comparison, decision-support, gap-check 중 하나로 분류한다.
2. Root index에서 1차 topic을 고르고 필요한 경우에만 secondary topic을 추가한다.
3. Root/topic index는 각 파일을 처음 읽기 직전에 내용 snapshot과 기존 git dirty 여부를 기록한다.
4. Topic index에서 active page를 선택하고 각 page도 처음 읽기 직전에 같은 방식으로 고정한다. 이 파일들을 query source set으로 삼고 `knowledge/write-back-inbox.md`는 제외한다. 각 claim을 실제로 뒷받침하는지 본문과 source를 확인한다.
5. 비교 질문은 같은 facet 기준으로 페이지를 대조한다. 서로 다른 평가 기준의 값을 한 표에서 직접 비교하지 않는다.
6. 최신성에 민감하면 공식 source로 live check한다. 확인할 수 없으면 freshness gap을 분리한다.
7. Wiki와 최신 source가 충돌하면 한쪽을 조용히 덮어쓰지 않고 두 근거와 충돌 상태를 드러낸다.
8. 답변에는 claim 가까이에 `[[topic/page]]`와 외부 source를 연결한다.
9. 핵심 facet을 뒷받침할 page가 없으면 `Research evidence gap`으로 분리하고 필요한 경우 `knowledge/write-back-inbox.md`에 후보를 남긴다.

## 종료 상태

답변과 필요한 write-back을 마친 뒤 query source set을 최초 snapshot과 비교하고 다음 상태를 한 줄로 보고한다.

```text
Canonical knowledge: unchanged | pre-existing-dirty-preserved | drift-blocked
```

- `unchanged`: 시작 시 source set이 clean이었고 종료 시 내용이 같다.
- `pre-existing-dirty-preserved`: 시작 시 dirty였던 source가 있지만 query 중 새 내용 변경은 없다.
- `drift-blocked`: snapshot 뒤 source set 중 하나라도 달라졌다. 변경 주체를 추정하거나 되돌리지 않고 답변의 완료를 보류하며 변경 경로를 보고한다.

## 검증

- 인용한 page와 URL이 실제로 존재하는지 확인한다.
- 인용 page가 해당 claim을 직접 뒷받침하는지 다시 읽는다.
- 최신성 검사를 생략했다면 답변에 드러낸다.
- Write-back 후보에 질문 원문, 개인정보나 저장소의 민감정보를 남기지 않는다.
- 기존 dirty work는 사용자 변경으로 보존한다.
- Query source set이 최초 snapshot 뒤 변경되면 `Canonical knowledge: drift-blocked`로 종료한다.
