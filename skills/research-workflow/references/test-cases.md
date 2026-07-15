# Research Workflow Smoke Matrix

| Case | 요청 | 기대 동작 |
| --- | --- | --- |
| bootstrap | `새 topic index를 만들어줘` | root index에서 중복을 확인하고 topic index부터 만든다. |
| ingest | `이 공식 문서를 첫 page로 정리해줘` | URL·접근일·claim을 연결하고 적합한 page type으로 작성한다. |
| synthesis | `세 자료를 비교해 공통 판단을 만들어줘` | 단순 요약이 아닌 새로운 연결이 있을 때만 synthesis를 만든다. |
| deprecate | `이 page를 새 page로 대체해줘` | successor를 확인하고 tombstone과 index 변경을 함께 수행한다. |
| query/lint | `wiki에서 답을 찾아줘` 또는 `검사만 해줘` | research-query 또는 research-lint로 넘긴다. |
| raw protection | 외부 원문 전체를 저장해 달라는 요청 | URL과 필요한 해석만 남기고 원문 snapshot은 복제하지 않는다. |
