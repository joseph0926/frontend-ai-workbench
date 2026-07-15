# Knowledge Schema

## 목적

Knowledge base는 원본 출처, 확인된 사실, 재사용할 판단과 여러 자료에서 도출한 결론을 구분한다. 문서의 양보다 claim의 출처, 관계, 최신성과 폐기 가능성을 유지하는 것을 우선한다.

## 구조

```text
knowledge/
├── SCHEMA.md
├── index.md
├── write-back-inbox.md
└── <topic>/
    ├── index.md
    ├── sources/
    ├── entities/
    ├── concepts/
    └── synthesis/
```

외부 원문 snapshot은 저장하지 않는다. Page에는 공개 URL, 접근일과 해당 출처가 뒷받침하는 claim 범위만 남긴다.

## Page types

| Type | 역할 |
| --- | --- |
| `source` | 반복해서 인용할 외부 자료의 범위와 핵심 claim을 정리한다. |
| `entity` | 특정 제품, API, 도구 또는 구현체의 현재 동작을 기록한다. |
| `concept` | 여러 구현에 적용할 판단 기준과 원리를 정리한다. |
| `synthesis` | 세 개 이상의 page를 연결해 단일 출처에 없는 결론을 도출한다. |

## Frontmatter

```yaml
---
schema_version: 1
type: concept
tags: [uiux]
sources:
  - "https://example.com — accessed 2026-07-15"
relations:
  depends_on: []
  contrasts_with: []
  expands_on: []
  applies_to: []
  contradicts: []
  supersedes: []
confidence: 0.8
status: current
updated: 2026-07-15
---
```

필수 필드는 `schema_version`, `type`, `tags`, `sources`, `relations`, `confidence`, `status`, `updated`다.

Status는 `current`, `outdated`, `conflict`, `review-needed`, `deprecated` 중 하나다. Confidence는 0과 1 사이 값이며 0.5 이하면 본문에 근거 강도와 확인되지 않은 부분을 분리한다.

## Relations

| Relation | 의미 |
| --- | --- |
| `depends_on` | 이해나 결론에 선행 지식이 필요하다. |
| `contrasts_with` | 같은 문제를 다른 관점에서 다룬다. |
| `expands_on` | 기존 page의 범위를 확장한다. |
| `applies_to` | 판단을 적용할 대상이다. |
| `contradicts` | 해결되지 않은 상충 claim이 있다. |
| `supersedes` | 더 이상 active하지 않은 판단을 대체한다. |

관계 값은 `[[topic/page]]` 형식을 사용한다. `contrasts_with`와 `contradicts`는 반대쪽 page도 관계를 명시한다.

## 작성 규칙

- Topic의 모든 active page는 해당 topic `index.md`에 등록한다.
- Content page는 두 개 이상의 outbound wikilink를 가진다.
- 모든 page는 `## Sources` 또는 claim 가까이 출처를 가진다.
- Synthesis는 세 개 이상의 page를 사용하고 단락별로 provenance를 표시한다.
- 외부 source를 사용하면 URL과 `accessed YYYY-MM-DD`를 함께 남긴다.
- 400줄을 넘으면 분할 후보, 800줄을 넘으면 error로 본다.
- 90일 이상 갱신되지 않은 page는 warning과 최신성 검토 후보로 본다.
- 상충 claim은 양쪽을 `status: conflict`로 바꾸고 해결 전까지 하나로 합치지 않는다.

## Ingest

1. Root index에서 topic 경계와 중복을 확인한다.
2. URL, 접근일, source 권위와 핵심 claim을 고정한다.
3. Page type을 선택하고 긴 원문 대신 필요한 사실과 판단만 작성한다.
4. Frontmatter와 관계를 작성한다.
5. Topic index에 page를 등록한다.
6. Topic lint를 실행한다.

## Query

1. Root index에서 1차 topic을 고른다.
2. Topic index와 active page를 읽는다.
3. 질문의 facet별로 claim과 page를 연결한다.
4. 최신성에 민감하면 공식 source로 live check한다.
5. Wiki와 live source가 다르면 두 근거를 분리한다.
6. 근거가 없는 facet만 evidence gap으로 분리한다.
7. 반복될 가치가 있는 gap은 `write-back-inbox.md`에 후보로 남긴다.

## Lint

구현은 `scripts/wiki-lint.py`가 소유한다.

`SCHEMA.md`, `index.md`, `write-back-inbox.md`만 non-content file로 제외한다. 그 밖의 Markdown은 모두 page 계약을 검사한다.

### Structure checks

| 검사 | Severity |
| --- | --- |
| Frontmatter 필수 필드, schema version, type/status enum | error |
| Tags list·taxonomy, relations 6개 키와 관계 대상 | error |
| 깨진 wikilink와 topic index 미등록 | error |
| Topic index 부재 | error |
| Outbound wikilink 2개 미만 | error |
| Synthesis 참조 3개 미만 | error |
| Sources 섹션 또는 인라인 출처 부재 | error |
| Confidence 0.5 이하인데 근거 강도 메모 부재 | error |
| Page 800줄 초과 | error |
| Deprecated successor 대상 부재 | error |
| 90일 이상 미갱신, tag 5개 초과 | warning |
| Page 400줄 초과 | warning |
| URL 출처에 `accessed YYYY-MM-DD` 부재 | warning |
| Content graph inbound가 없는 page | warning |
| Contradicts 비대칭 또는 양쪽 conflict status 누락 | warning |
| Root index에 topic route 미등록 | warning |
| Contrasts_with 비대칭 | routing audit info |

### Audit manifest

- 낮은 confidence, 오래된 page와 review status는 priority 후보로 분류한다.
- Synthesis는 별도 후보 pool로 둔다.
- 전체 page의 3%를 재현 가능한 seed로 sampling한다.

### Routing audit

- 상호 관계의 비대칭
- 깨진 index route
- Topic boundary와 root index 등록을 확인한다.

Audit 후보는 결함 확정이 아니다. 의미 판정은 page 본문과 source를 읽은 뒤 수행한다.

## Lifecycle

Page가 대체되면 삭제하지 않고 `status: deprecated`, `superseded_by`, 날짜를 남긴다. Deprecated page는 active index에서 분리하고 successor의 실존을 검사한다. 원문 보관이 불필요하다면 tombstone 본문에는 대체 이유와 successor만 남긴다.
