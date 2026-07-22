# Research Query Smoke Matrix

| Case | 요청 | 기대 동작 |
| --- | --- | --- |
| explicit | `knowledge base에서 UI 후보 평가 기준을 찾아줘` | root index부터 active page까지 라우팅하고 claim별 출처를 연결한다. |
| general question | `좋은 UI란 뭐야?` | knowledge base 사용이 명시되지 않았으므로 Skill을 사용하지 않는다. |
| comparison | `두 topic의 접근성 판단을 비교해줘` | 공통 facet을 정하고 page별 근거를 분리한다. |
| freshness | `wiki 결론을 최신 공식 문서와 검산해줘` | wiki를 먼저 읽고 공식 source로 live check한다. |
| live conflict | wiki와 공식 source가 다름 | 두 근거와 충돌 상태를 함께 드러낸다. |
| partial gap | 복합 질문의 일부만 근거가 있음 | 지원되는 facet은 답하고 빠진 facet만 gap으로 분리한다. |
| pre-existing canonical dirty | 조회할 index/page가 시작 전부터 수정됨 | 최초 snapshot과 종료 내용을 비교해 새 drift가 없으면 사용자 변경을 보존하고 `Canonical knowledge: pre-existing-dirty-preserved`로 닫는다. |
| unexpected canonical mutation | query source set이 최초 snapshot 뒤 달라짐 | 변경을 되돌리거나 원인을 추정하지 않고 `Canonical knowledge: drift-blocked`와 변경 경로를 보고한다. |
| write request | 새 page 작성 또는 lint 요청 | research-workflow 또는 research-lint로 넘긴다. |
