export type ContentKind = "Case study" | "Skill" | "Schema" | "Guide";
export type EvidenceStatus = "검증됨" | "현재" | "검토 필요";

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  summary: string;
  topics: string[];
  evidenceStatus: EvidenceStatus;
  updatedAt: string;
  repositoryPath: string;
  coverVariant: "grid" | "layers" | "route" | "cards" | "links" | "spectrum" | "steps" | "focus";
}

export const contentItems: ContentItem[] = [
  {
    id: "candidate-evaluation",
    kind: "Case study",
    title: "UI 후보를 같은 상태에서 비교하고 결정하기",
    summary: "같은 fixture와 상태 조건에서 여러 UI 후보를 비교하고 브라우저 근거로 최종 방향을 선택한 기록입니다.",
    topics: ["UI", "검증"],
    evidenceStatus: "검증됨",
    updatedAt: "2026-07-15",
    repositoryPath: "case-studies/ui-candidate-evaluation.md",
    coverVariant: "grid",
  },
  {
    id: "content-discovery",
    kind: "Case study",
    title: "콘텐츠 탐색 UI 방향을 세 제품 언어로 비교하기",
    summary: "구조 탐색, 정밀 조회, 시각적 발견이라는 서로 다른 사용자 행동을 하나의 콘텐츠 집합으로 비교합니다.",
    topics: ["UI", "탐색"],
    evidenceStatus: "검토 필요",
    updatedAt: "2026-07-15",
    repositoryPath: "case-studies/content-discovery/decision-packet.md",
    coverVariant: "spectrum",
  },
  {
    id: "production-ui",
    kind: "Skill",
    title: "Production UI 의사결정 계약",
    summary: "제품 계약을 유지하면서 후보를 격리 구현하고 상태별 근거와 승인 gate를 거쳐 통합합니다.",
    topics: ["UI", "워크플로"],
    evidenceStatus: "현재",
    updatedAt: "2026-07-15",
    repositoryPath: "skills/build-production-ui/SKILL.md",
    coverVariant: "layers",
  },
  {
    id: "research-query",
    kind: "Skill",
    title: "근거가 있는 답변을 만드는 조회 절차",
    summary: "질문의 facet을 active page와 연결하고 최신성에 민감한 부분만 공식 출처로 다시 확인합니다.",
    topics: ["리서치", "근거"],
    evidenceStatus: "현재",
    updatedAt: "2026-07-15",
    repositoryPath: "skills/research-query/SKILL.md",
    coverVariant: "route",
  },
  {
    id: "research-workflow",
    kind: "Skill",
    title: "출처를 지식으로 정규화하기",
    summary: "긴 원문을 복제하지 않고 핵심 claim, 관계, 최신성 기준을 재사용 가능한 문서로 정리합니다.",
    topics: ["리서치", "워크플로"],
    evidenceStatus: "현재",
    updatedAt: "2026-07-15",
    repositoryPath: "skills/research-workflow/SKILL.md",
    coverVariant: "steps",
  },
  {
    id: "research-lint",
    kind: "Skill",
    title: "지식 구조 검사와 의미 검토 분리",
    summary: "기계적으로 확정할 수 있는 구조 결함과 사람이 근거를 읽어야 하는 검토 후보를 구분합니다.",
    topics: ["리서치", "검증"],
    evidenceStatus: "검증됨",
    updatedAt: "2026-07-15",
    repositoryPath: "skills/research-lint/SKILL.md",
    coverVariant: "focus",
  },
  {
    id: "knowledge-schema",
    kind: "Schema",
    title: "Knowledge Schema",
    summary: "출처, 문서 역할, 관계, 신뢰도와 lifecycle을 일관된 계약으로 관리합니다.",
    topics: ["리서치", "구조"],
    evidenceStatus: "현재",
    updatedAt: "2026-07-15",
    repositoryPath: "knowledge/SCHEMA.md",
    coverVariant: "links",
  },
  {
    id: "workbench-overview",
    kind: "Guide",
    title: "Workbench 전체 흐름",
    summary: "출처에서 시작해 지식, 제약, UI 후보, 브라우저 근거, 평가와 write-back으로 이어지는 전체 구조입니다.",
    topics: ["구조", "워크플로"],
    evidenceStatus: "현재",
    updatedAt: "2026-07-15",
    repositoryPath: "README.md",
    coverVariant: "cards",
  },
];

export const contentTopics = ["전체", "UI", "탐색", "검증", "리서치", "워크플로", "구조"];
