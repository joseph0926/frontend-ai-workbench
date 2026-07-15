---
name: research-workflow
description: 저장소의 `knowledge/SCHEMA.md`를 기준으로 topic을 만들고, 출처를 지식 문서로 ingest·normalize하며, 대체되거나 오래된 문서를 deprecate한다. 지식 문서 작성과 lifecycle 변경에 사용하고, 질문·검색은 research-query, 검출·분류만 하는 검사는 research-lint로 넘긴다.
---

# Research Workflow

## 역할

repo-local knowledge base의 쓰기 workflow를 담당한다. Page type, frontmatter, 관계와 품질 계약은 `knowledge/SCHEMA.md`가 소유하고 이 Skill은 실행 순서와 검증만 담당한다.

## 먼저 읽기

1. 가장 가까운 `AGENTS.md`
2. `knowledge/SCHEMA.md`
3. `knowledge/index.md`
4. 대상 topic의 `index.md`
5. Skill을 수정하거나 검증할 때만 `references/test-cases.md`

필수 파일을 찾을 수 없으면 임의 schema를 만들지 말고 중단한다.

## 워크플로

1. 요청을 `bootstrap`, `ingest`, `normalize`, `deprecate` 중 하나 이상으로 분류하고 topic, source, 기대 출력과 제외 범위를 고정한다.
2. Root index에서 기존 topic 경계와 중복을 확인한다.
3. 새 topic이면 콘텐츠보다 `knowledge/<topic>/index.md`를 먼저 만든다.
4. 출처의 핵심 사실과 판단만 흡수하고 긴 원문은 복제하지 않는다. URL, 접근일과 claim을 연결한다.
5. `source`, `entity`, `concept`, `synthesis` 중 역할에 맞는 page type을 선택한다. 여러 출처를 결합해 새로운 결론을 만들 때만 `synthesis`를 쓴다.
6. Frontmatter와 관계를 작성하고 topic index에 page를 등록한다.
7. 기존 page를 갱신하면 실제로 다시 확인한 source와 claim만 수정한다.
8. 대체되는 page는 삭제하지 않고 successor를 가리키는 deprecated tombstone으로 남긴다.
9. 질문 중 발견한 cross-topic 결론이나 아직 위치가 정해지지 않은 gap은 canonical page에 바로 넣지 않고 `knowledge/write-back-inbox.md`에 후보로 둔다.
10. 대상 topic lint를 실행하고 수정한 page와 index를 다시 읽는다.

## 완료 gate

```bash
python scripts/wiki-lint.py knowledge/<topic>/
```

- error 0이 필수다.
- topic 경계나 page lifecycle을 바꿨으면 전체 `knowledge/`도 검사한다.
- 외부 URL과 접근일, 관계 대상과 index 등록을 직접 확인한다.
- 새로 작성한 한글 문서에 U+FFFD가 없는지 확인한다.

## 경계

- `knowledge/SCHEMA.md`와 validator를 요청 없이 수정하지 않는다.
- 외부 원문 snapshot, private log 또는 개인정보를 지식 문서에 복제하지 않는다.
- source가 없는 placeholder page를 만들지 않는다.
- 질문·검색이나 lint-only 요청을 이 Skill로 처리하지 않는다.
- 한 작업에서 관련 없는 여러 topic을 함께 정규화하지 않는다.
