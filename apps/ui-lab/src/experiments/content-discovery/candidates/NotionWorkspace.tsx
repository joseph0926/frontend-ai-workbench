import { useState } from "react";
import type { CandidateProps } from "../../types.ts";
import { contentItems, contentTopics } from "../fixtures.ts";
import { filterItems, resultLabel } from "../shared.ts";

export default function NotionWorkspace({ state }: CandidateProps) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("전체");
  const [selectedId, setSelectedId] = useState(contentItems[0].id);
  const [recovered, setRecovered] = useState(false);
  const isLoading = state === "loading";
  const isError = state === "error" && !recovered;
  const items = state === "empty" ? [] : filterItems(query, topic);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <main className="lang-notion min-h-screen bg-[var(--notion-canvas)] text-[var(--notion-ink)] antialiased">
      <div className="min-h-screen md:grid md:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--notion-line)] bg-[var(--notion-sidebar)] px-3 py-3 md:min-h-screen md:border-b-0 md:border-r">
          <div className="flex min-h-11 items-center justify-between rounded-md px-2 text-sm font-semibold">
            <span className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded bg-stone-900 text-xs text-white">W</span> Workbench</span>
            <span className="text-[var(--notion-mute)]">⌄</span>
          </div>
          <nav aria-label="워크스페이스" className="mt-2 hidden space-y-0.5 text-sm md:block">
            {["빠른 검색", "전체 자료", "최근 검증"].map((label, index) => (
              <button key={label} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left ${index === 1 ? "bg-[var(--notion-selected)] font-medium" : "text-[var(--notion-soft)] hover:bg-[var(--notion-hover)]"}`}>
                <span className="w-4 text-center text-[var(--notion-mute)]">{index === 0 ? "⌕" : index === 1 ? "▤" : "◷"}</span>{label}
              </button>
            ))}
            <p className="px-2 pb-1 pt-5 text-xs font-medium text-[var(--notion-mute)]">컬렉션</p>
            {contentTopics.slice(1).map((label) => (
              <button key={label} onClick={() => setTopic(label)} aria-pressed={topic === label} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left ${topic === label ? "bg-[var(--notion-selected)] font-medium" : "text-[var(--notion-soft)] hover:bg-[var(--notion-hover)]"}`}>
                <span className="w-4 text-center text-[var(--notion-mute)]">›</span>{label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-4 pb-12 pt-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1120px]">
            <div className="flex items-center gap-2 text-xs text-[var(--notion-mute)]"><span>Workbench</span><span>/</span><span>라이브러리</span></div>
            <header className="mt-7 flex flex-col gap-4 border-b border-[var(--notion-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-4xl">▦</p>
                <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">지식 라이브러리</h1>
                <p className="mt-2 text-sm leading-6 text-[var(--notion-soft)]">문제에 맞는 사례와 실행 계약을 구조 안에서 찾습니다.</p>
              </div>
              <label className="flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--notion-line-strong)] bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--notion-focus)] focus-within:ring-offset-2 lg:w-72" data-primary-control>
                <span className="text-[var(--notion-mute)]">⌕</span>
                <span className="sr-only">자료 검색</span>
                <input autoFocus={state === "focus"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목, 주제, 경로 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--notion-mute)]" />
              </label>
            </header>

            <div className="mt-4 flex gap-1 overflow-x-auto pb-1" aria-label="보기 선택">
              {contentTopics.map((label) => (
                <button key={label} onClick={() => setTopic(label)} aria-pressed={topic === label} className={`min-h-10 shrink-0 rounded-md px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--notion-focus)] ${topic === label ? "bg-[var(--notion-selected)] font-semibold" : "text-[var(--notion-soft)] hover:bg-[var(--notion-hover)]"}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
              <section className="min-w-0 overflow-hidden rounded-md border border-[var(--notion-line)] bg-white" aria-busy={isLoading}>
                <div className="grid grid-cols-[minmax(0,1fr)_84px] border-b border-[var(--notion-line)] bg-[var(--notion-subtle)] px-3 py-2 text-xs text-[var(--notion-mute)] sm:grid-cols-[minmax(0,1fr)_100px_120px]">
                  <span>이름</span><span>종류</span><span className="hidden sm:block">근거 상태</span>
                </div>
                {isLoading ? (
                  <div className="divide-y divide-[var(--notion-line)]">
                    {Array.from({ length: 6 }, (_, index) => <div key={index} className="grid min-h-16 animate-pulse grid-cols-[minmax(0,1fr)_84px] items-center gap-3 px-3 sm:grid-cols-[minmax(0,1fr)_100px_120px]"><span className="h-4 rounded bg-stone-200"/><span className="h-4 rounded bg-stone-100"/><span className="hidden h-4 rounded bg-stone-100 sm:block"/></div>)}
                  </div>
                ) : isError ? (
                  <div role="alert" className="m-3 rounded-md border border-rose-200 bg-rose-50 p-5">
                    <p className="font-semibold text-rose-950">자료를 불러오지 못했습니다</p>
                    <p className="mt-1 text-sm leading-6 text-rose-800">현재 보기와 검색어는 유지됩니다. 다시 시도해 주세요.</p>
                    <button onClick={() => setRecovered(true)} className="mt-4 min-h-10 rounded-md bg-rose-900 px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-rose-500">다시 시도</button>
                  </div>
                ) : items.length === 0 ? (
                  <div data-state="empty" className="grid min-h-64 place-items-center px-6 text-center">
                    <div><p className="text-2xl">⌕</p><p className="mt-3 font-semibold">조건에 맞는 자료가 없습니다</p><p className="mt-1 text-sm text-[var(--notion-soft)]">검색어를 지우거나 전체 보기를 선택해 보세요.</p><button onClick={() => { setQuery(""); setTopic("전체"); }} className="mt-4 min-h-10 rounded-md border border-[var(--notion-line-strong)] px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--notion-focus)]">필터 초기화</button></div>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--notion-line)]">
                    {items.map((item) => (
                      <button key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id} className={`grid min-h-16 w-full grid-cols-[minmax(0,1fr)_84px] items-center gap-3 px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--notion-focus)] sm:grid-cols-[minmax(0,1fr)_100px_120px] ${selected?.id === item.id ? "bg-[var(--notion-selected)]" : "hover:bg-[var(--notion-hover)]"}`}>
                        <span className="min-w-0"><span className="block truncate text-sm font-medium">{item.title}</span><span className="mt-1 block truncate text-xs text-[var(--notion-mute)]">{item.repositoryPath}</span></span>
                        <span className="text-xs text-[var(--notion-soft)]">{item.kind}</span>
                        <span className="hidden text-xs text-[var(--notion-soft)] sm:block">{item.evidenceStatus}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p aria-live="polite" className="border-t border-[var(--notion-line)] px-3 py-2 text-xs text-[var(--notion-mute)]">{isLoading ? "자료를 불러오는 중" : resultLabel(items.length)}</p>
              </section>

              <aside className="rounded-md border border-[var(--notion-line)] bg-white p-5 xl:sticky xl:top-5 xl:self-start">
                {selected ? <><p className="text-xs font-medium text-[var(--notion-mute)]">선택한 자료</p><h2 className="mt-4 text-xl font-bold leading-7 tracking-[-0.025em]">{selected.title}</h2><p className="mt-3 text-sm leading-6 text-[var(--notion-soft)]">{selected.summary}</p><div className="mt-5 flex flex-wrap gap-1.5">{selected.topics.map((item) => <span key={item} className="rounded bg-[var(--notion-selected)] px-2 py-1 text-xs">{item}</span>)}</div><dl className="mt-6 space-y-3 border-t border-[var(--notion-line)] pt-4 text-xs"><div className="flex justify-between gap-4"><dt className="text-[var(--notion-mute)]">종류</dt><dd>{selected.kind}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--notion-mute)]">업데이트</dt><dd>{selected.updatedAt}</dd></div></dl><button className="mt-6 min-h-10 w-full rounded-md bg-stone-900 px-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--notion-focus)]">자료 열기</button></> : <p className="text-sm text-[var(--notion-mute)]">목록에서 자료를 선택하세요.</p>}
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
