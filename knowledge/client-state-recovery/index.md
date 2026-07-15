# Client State Recovery

CSR 애플리케이션에서 재방문 화면, 영속 데이터, 낙관적 변경을 빠르게 보여주면서도 실패 시 복구 가능한 경계를 다룹니다. FirstTx의 공개 패키지 문서, 테스트와 측정 시나리오를 source로 사용합니다.

## Sources

| Page | Type | 다루는 경계 |
| --- | --- | --- |
| [[client-state-recovery/firsttx-prepaint]] | source | React mount 전 재방문 visual replay와 handoff |
| [[client-state-recovery/firsttx-local-first]] | source | IndexedDB snapshot, staleness와 revalidation |
| [[client-state-recovery/firsttx-tx]] | source | optimistic step, retry와 compensating rollback |

## Synthesis

| Page | Type | 질문 |
| --- | --- | --- |
| [[client-state-recovery/recoverable-client-state]] | synthesis | 세 레이어를 언제 분리하고 어떻게 조합할 것인가? |
