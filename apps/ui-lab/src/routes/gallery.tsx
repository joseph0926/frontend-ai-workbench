import { Link } from "react-router-dom";
import { experiments } from "../experiments/registry.ts";
import type { CandidateMeta, Experiment } from "../experiments/types.ts";

const candidateNotes: Record<string, { number: string; title: string; description: string }> = {
  notion: {
    number: "01",
    title: "Structured knowledge",
    description: "Sidebar, database rows, side preview로 자료의 위치와 관계를 이해하며 찾습니다.",
  },
  vercel: {
    number: "02",
    title: "Precise developer index",
    description: "Command search, entity status, inspector로 원하는 근거를 빠르게 비교합니다.",
  },
  pinterest: {
    number: "03",
    title: "Visual discovery",
    description: "Topic, masonry feed, save 흐름으로 예상하지 못한 관련 자료를 발견합니다.",
  },
};

function experimentPath(experiment: Experiment, candidate: CandidateMeta, state: string) {
  return `/view/${experiment.slug}/${candidate.id}/${state}`;
}

export default function Gallery() {
  const experiment = experiments[0];

  if (!experiment) {
    return <main className="grid min-h-screen place-items-center bg-stone-50 px-6 text-center"><div><h1 className="text-2xl font-semibold">등록된 UI 실험이 없습니다</h1><p className="mt-2 text-sm text-stone-500">새 experiment를 registry에 연결해 주세요.</p></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#20201e] antialiased">
      <header className="border-b border-black/10 bg-[#f5f3ee] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#20201e] text-[10px] font-bold text-white">FW</span><span className="text-sm font-semibold">Frontend Workbench</span></div>
          <span className="rounded-full border border-black/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">3 directions · 5 states</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <header className="grid gap-7 border-b border-black/15 pb-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b655c]">One content set · three product languages</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">같은 콘텐츠를<br/>세 가지 방식으로 찾기</h1>
          </div>
          <div>
            <p className="text-base leading-7 text-[#5f5a52]">동일한 repository fixture를 구조 탐색, 정밀 조회, 시각적 발견이라는 서로 다른 사용자 행동으로 설계했습니다.</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#817a70]">Ready · Loading · Empty · Error · Focus</p>
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-3" aria-label="콘텐츠 탐색 UI 세 방향">
          {experiment.candidates.map((candidate) => {
            const note = candidateNotes[candidate.id];
            const Component = candidate.Component;
            return (
              <article key={candidate.id} className="overflow-hidden rounded-[24px] border border-black/15 bg-[#fffefa] shadow-[0_12px_40px_rgba(43,39,32,0.05)]">
                <div className="flex items-start justify-between gap-4 border-b border-black/10 p-5">
                  <div><p className="font-mono text-[10px] tracking-[0.18em] text-[#8b8378]">{note?.number ?? "--"}</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">{candidate.label.split(" · ")[0]}</h2><p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[#746d63]">{note?.title}</p></div>
                  <Link to={experimentPath(experiment, candidate, "ready")} className="inline-flex min-h-10 items-center rounded-full bg-[#20201e] px-4 text-xs font-semibold text-white outline-none transition hover:bg-black focus-visible:ring-2 focus-visible:ring-[#6250b5] focus-visible:ring-offset-2">Open ↗</Link>
                </div>

                <div className="relative h-[300px] overflow-hidden border-b border-black/10 bg-white" aria-hidden="true" inert>
                  <div className="pointer-events-none origin-top-left" style={{ width: "285.72%", transform: "scale(0.35)" }}><Component state="ready" /></div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="p-5">
                  <p className="min-h-14 text-sm leading-6 text-[#625d55]">{note?.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5" aria-label={`${candidate.label} 상태`}>
                    {experiment.states.map((state) => <Link key={state} to={experimentPath(experiment, candidate, state)} className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-3 font-mono text-[10px] uppercase tracking-[0.08em] outline-none transition hover:border-black hover:bg-black hover:text-white focus-visible:ring-2 focus-visible:ring-[#6250b5] focus-visible:ring-offset-2">{state}</Link>)}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-10 flex flex-col gap-3 border-t border-black/15 pt-6 text-xs text-[#777066] sm:flex-row sm:items-center sm:justify-between"><p>같은 입력과 상태에서 IA, layout, component composition만 다르게 비교합니다.</p><p className="font-mono uppercase tracking-[0.12em]">30 browser captures · repository-owned fixture</p></footer>
      </div>
    </main>
  );
}
