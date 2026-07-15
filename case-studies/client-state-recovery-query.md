# 공개 근거로 클라이언트 상태 복구 전략 조회하기

## 질문

CSR 애플리케이션에서 재방문 화면을 빠르게 보여주고, cached data를 즉시 사용하며, optimistic update까지 적용하려면 하나의 cache 전략으로 묶어야 하는가?

## 입력

FirstTx 공개 저장소의 세 package 문서와 unit test, Playground의 Playwright scenario를 source로 사용했다. 긴 원문을 복사하지 않고 다음 네 page로 claim과 한계를 분리했다.

- [Prepaint visual replay](../knowledge/client-state-recovery/sources/firsttx-prepaint.md)
- [Local-First staleness](../knowledge/client-state-recovery/sources/firsttx-local-first.md)
- [Tx compensating rollback](../knowledge/client-state-recovery/sources/firsttx-tx.md)
- [Recoverable client state synthesis](../knowledge/client-state-recovery/synthesis/recoverable-client-state.md)

## 근거 기반 답변

하나의 cache 전략으로 묶지 않는다. 사용자가 기다리는 구간과 실패 시 되돌릴 대상이 서로 다르기 때문이다.

| Facet | 선택 | 이유 |
| --- | --- | --- |
| React bundle 전 재방문 화면 | visual snapshot overlay | 이전 DOM은 현재 UI가 아니므로 비상호작용 상태로 격리하고 실제 commit 뒤 제거해야 함 |
| React가 사용할 재방문 데이터 | persistent model cache | cache availability와 freshness를 분리하고 stale data는 server로 재검증해야 함 |
| optimistic multi-step 변경 | compensating transaction | 완료된 side effect만 역순 보상하고 retry·timeout·reconciliation을 별도 처리해야 함 |

세 레이어를 함께 쓰더라도 `visual handoff → cached render → server revalidation 또는 mutation` 순서로 책임을 넘긴다. visual replay 성공을 데이터 최신성이나 transaction 성공으로 해석하지 않는다.

## 근거와 주장 강도

- 공개 package 문서와 unit/E2E test가 함께 확인하는 동작만 현재 claim으로 채택했다.
- `prepaint-heavy` metrics의 96ms FCP 차이는 특정 Chromium scenario 기록으로만 남겼다. 전체 준비 시간 단축이나 보편적인 사용자 성능 향상으로 표현하지 않았다.
- Local-First는 concurrent write conflict를 해결하지 않고, Tx는 server와 browser storage의 원자적 commit을 제공하지 않는다는 제한을 결론에 포함했다.

## Evidence gap

- 여러 실제 기기와 네트워크에서 반복한 visual replay 분포
- storage eviction과 장기 cache hit rate
- multi-device conflict resolution과 server reconciliation 비용
- compensation 자체가 실패했을 때의 운영 절차

이 항목은 현재 공개 source가 답하지 않으므로 구현 완료 주장이나 성능 수치로 승격하지 않는다.

## Quality gate

| 검사 | 결과 |
| --- | --- |
| Topic lint | 4 pages, error 0, warning 0, info 0 |
| Full Knowledge lint | 4 pages, error 0, warning 0, info 0 |
| Audit manifest | priority 0, synthesis pool 1, deterministic random sample 1 |
| Routing audit | warning 0, info 0 |
| Public source check | package README 3개와 대표 metrics JSON의 commit permalink가 HTTP 200 |

결과는 Knowledge graph와 함께 갱신하며 raw terminal log는 별도 산출물로 보관하지 않는다.

## 결과

Research Workflow는 공개 source를 네 개의 연결된 page로 정규화하고, Research Query는 질문의 facet마다 source와 evidence gap을 분리한다. Research Lint는 page schema, 관계, index routing과 freshness를 같은 graph에서 검사한다. 세 Skill이 하나의 사례를 공유하므로 기능별로 고립된 예제 문서를 만들지 않아도 실행 관계가 드러난다.
