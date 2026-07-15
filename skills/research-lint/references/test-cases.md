# Research Lint Smoke Matrix

| Case | 요청 | 기대 동작 |
| --- | --- | --- |
| full | `knowledge base 전체를 검사해줘` | structure, manifest, routing을 모두 실행하고 범위를 보고한다. |
| scoped | `uiux topic만 검사해줘` | 세 명령을 같은 topic 범위로 실행하고 전체 결과로 과장하지 않는다. |
| candidate | manifest/routing 후보가 나옴 | 결함으로 단정하지 않고 필요한 경우에만 본문을 읽는다. |
| fix | `고칠 수 있는 것도 수정해줘` | finding을 분류하고 확인 뒤 research-workflow로 넘긴다. |
| dirty file | 실행 전 변경이 존재함 | 기존 변경을 보존하고 lint side effect로 단정하지 않는다. |
