# Agent Skills

이 디렉터리는 실제 workflow를 공개 저장소 안에서 읽고 재사용할 수 있게 축약한 public edition입니다. 각 Skill은 trigger, 입력, 작업 경계, 산출물, 종료 조건과 smoke case를 함께 가집니다.

## 제공하는 Skill

| Skill | 사용 시점 | 핵심 산출물 |
| --- | --- | --- |
| `build-production-ui` | 실제 제품의 redesign 또는 새 page/section 설계·통합 | workflow v2 decision packet, candidate evidence, approval과 integration 결과 |
| `research-workflow` | 공개 source를 repo-local Knowledge page로 정규화 | source/entity/concept/synthesis page와 관계 |
| `research-query` | Knowledge에서 근거가 연결된 답과 gap을 조회 | claim, source, confidence와 evidence gap |
| `research-lint` | Knowledge 구조 검사를 분류·보고 | severity별 finding과 수정 ownership |

## 사용 방법

1. 필요한 Skill 디렉터리를 agent runtime이 읽는 project-local 또는 user skill 디렉터리로 복사합니다.
2. `SKILL.md`와 함께 `assets/`, `references/` 구조를 그대로 유지합니다.
3. 대상 프로젝트의 가까운 지침과 source of truth가 Skill보다 우선하도록 둡니다.
4. 처음에는 smoke case로 trigger와 비-trigger 경계를 확인합니다.

예시:

```sh
cp -R skills/build-production-ui <agent-skill-directory>/build-production-ui
```

특정 runtime의 전역 경로나 배포 명령을 이 public edition이 가정하지는 않습니다.

## 검증

저장소 루트에서 다음 명령을 실행합니다.

```sh
python -m unittest discover -s tests
```

검사는 모든 Skill의 frontmatter name과 directory 일치, `build-production-ui` reference 존재, workflow v2 packet 필드와 terminal-state smoke matrix를 확인합니다.

## Public edition 경계

- 개인 Knowledge 경로, telemetry, 운영 log와 실행면별 배포 설정을 포함하지 않습니다.
- Skill이 실제 제품 delivery를 완료했다는 주장은 연결된 case study와 browser/native verification이 있을 때만 합니다.
- 원본과 public edition의 최신성 기준은 [`../PROVENANCE.md`](../PROVENANCE.md)를 따릅니다.
