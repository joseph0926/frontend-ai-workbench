import { useState } from "react";
import type { CandidateProps } from "../../types.ts";
import { contentItems, type ContentKind } from "../fixtures.ts";
import { filterItems, resultLabel } from "../shared.ts";

const kinds: Array<"All" | ContentKind> = ["All", "Case study", "Skill", "Schema", "Guide"];

export default function VercelIndex({ state }: CandidateProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof kinds)[number]>("All");
  const [selectedId, setSelectedId] = useState(contentItems[0].id);
  const [recovered, setRecovered] = useState(false);
  const isLoading = state === "loading";
  const isError = state === "error" && !recovered;
  const baseItems = state === "empty" ? [] : filterItems(query, "전체");
  const items = kind === "All" ? baseItems : baseItems.filter((item) => item.kind === kind);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <main className="lang-vercel min-h-screen bg-white text-black antialiased">
      <header className="border-b border-[var(--vercel-line)]">
        <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-black text-xs font-bold text-white">FW</span><span className="font-semibold tracking-[-0.02em]">Workbench Index</span></div>
          <div className="flex items-center gap-2 text-xs text-[var(--vercel-mute)]"><span className="hidden sm:inline">Repository</span><span className="rounded-full border border-[var(--vercel-line)] px-2 py-1 font-mono">main</span></div>
        </div>
      </header>

      <div className="vercel-grid min-h-[calc(100vh-65px)]">
        <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12">
          <header className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--vercel-mute)]">Artifacts / verified knowledge</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Find the evidence.<br/><span className="text-[var(--vercel-mute)]">Inspect the decision.</span></h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--vercel-soft)]">사례, 실행 계약, 스키마를 하나의 index에서 검색하고 근거 상태까지 확인합니다.</p>
          </header>

          <label className="mt-8 flex min-h-12 items-center border border-black bg-white shadow-[4px_4px_0_#000] focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-4" data-primary-control>
            <span className="grid size-12 place-items-center border-r border-black font-mono text-xs">⌘K</span><span className="sr-only">Artifact 검색</span>
            <input autoFocus={state === "focus"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, topic, or path" className="min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-[var(--vercel-mute)]" />
            <span className="hidden border-l border-[var(--vercel-line)] px-4 font-mono text-xs text-[var(--vercel-mute)] sm:block">{resultLabel(items.length)}</span>
          </label>

          <div className="mt-8 grid gap-px border border-[var(--vercel-line)] bg-[var(--vercel-line)] sm:grid-cols-3">
            {[ ["ARTIFACTS", contentItems.length], ["VERIFIED", contentItems.filter((item) => item.evidenceStatus === "검증됨").length], ["TOPICS", new Set(contentItems.flatMap((item) => item.topics)).size] ].map(([label, value]) => <div key={String(label)} className="bg-white p-4"><p className="font-mono text-[10px] tracking-[0.15em] text-[var(--vercel-mute)]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p></div>)}
          </div>

          <div className="mt-8 flex gap-1 overflow-x-auto border-b border-[var(--vercel-line)] pb-3" aria-label="자료 종류">
            {kinds.map((label) => <button key={label} onClick={() => setKind(label)} aria-pressed={kind === label} className={`min-h-10 shrink-0 rounded-md px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${kind === label ? "bg-black text-white" : "hover:bg-[var(--vercel-subtle)]"}`}>{label}</button>)}
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <section className="min-w-0 border border-[var(--vercel-line)] bg-white" aria-busy={isLoading}>
              <div className="grid grid-cols-[minmax(0,1fr)_90px] border-b border-[var(--vercel-line)] bg-[var(--vercel-subtle)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--vercel-mute)] sm:grid-cols-[minmax(0,1fr)_110px_100px]"><span>Entity</span><span>Type</span><span className="hidden sm:block">Status</span></div>
              {isLoading ? <div className="divide-y divide-[var(--vercel-line)]">{Array.from({length:6},(_,index)=><div key={index} className="grid min-h-[72px] animate-pulse grid-cols-[minmax(0,1fr)_90px] items-center gap-3 px-3 sm:grid-cols-[minmax(0,1fr)_110px_100px]"><span className="h-4 bg-neutral-200"/><span className="h-4 bg-neutral-100"/><span className="hidden h-4 bg-neutral-100 sm:block"/></div>)}</div> : isError ? <div role="alert" className="m-3 border border-black bg-[var(--vercel-subtle)] p-5"><p className="font-semibold">Index request failed</p><p className="mt-2 text-sm leading-6 text-[var(--vercel-soft)]">검색 조건은 그대로 유지했습니다. 연결을 확인하고 다시 요청하세요.</p><button onClick={() => setRecovered(true)} className="mt-4 min-h-10 bg-black px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">Retry request</button></div> : items.length === 0 ? <div data-state="empty" className="grid min-h-64 place-items-center px-6 text-center"><div><p className="font-mono text-xs text-[var(--vercel-mute)]">0 RESULTS</p><p className="mt-3 text-lg font-semibold">No matching artifact</p><p className="mt-1 text-sm text-[var(--vercel-soft)]">검색어 또는 자료 종류를 바꿔보세요.</p><button onClick={() => {setQuery("");setKind("All");}} className="mt-4 min-h-10 border border-black px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">Clear filters</button></div></div> : <div className="divide-y divide-[var(--vercel-line)]">{items.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id} className={`grid min-h-[72px] w-full grid-cols-[minmax(0,1fr)_90px] items-center gap-3 px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black sm:grid-cols-[minmax(0,1fr)_110px_100px] ${selected?.id === item.id ? "bg-black text-white" : "hover:bg-[var(--vercel-subtle)]"}`}><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.title}</span><span className={`mt-1 block truncate font-mono text-[10px] ${selected?.id === item.id ? "text-neutral-400" : "text-[var(--vercel-mute)]"}`}>{item.repositoryPath}</span></span><span className="font-mono text-[10px]">{item.kind}</span><span className="hidden items-center gap-2 text-xs sm:flex"><span className={`size-2 rounded-full ${item.evidenceStatus === "검증됨" ? "bg-emerald-500" : item.evidenceStatus === "검토 필요" ? "bg-amber-400" : "bg-sky-500"}`}/>{item.evidenceStatus}</span></button>)}</div>}
              <p aria-live="polite" className="border-t border-[var(--vercel-line)] px-3 py-2 font-mono text-[10px] text-[var(--vercel-mute)]">{isLoading ? "INDEXING…" : `${items.length} ENTITIES`}</p>
            </section>

            <aside className="border border-black bg-black p-5 text-white lg:sticky lg:top-5 lg:self-start">
              {selected ? <><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] tracking-[0.15em] text-neutral-400">INSPECTOR</p><span className="size-2 rounded-full bg-emerald-400"/></div><h2 className="mt-6 text-2xl font-semibold leading-8 tracking-[-0.04em]">{selected.title}</h2><p className="mt-4 text-sm leading-6 text-neutral-400">{selected.summary}</p><p className="mt-6 break-all border-y border-neutral-800 py-4 font-mono text-[10px] leading-5 text-neutral-400">{selected.repositoryPath}</p><dl className="mt-5 space-y-3 font-mono text-[10px]"><div className="flex justify-between"><dt className="text-neutral-500">STATUS</dt><dd>{selected.evidenceStatus}</dd></div><div className="flex justify-between"><dt className="text-neutral-500">UPDATED</dt><dd>{selected.updatedAt}</dd></div></dl><button className="mt-6 min-h-10 w-full bg-white px-3 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">Open artifact ↗</button></> : <p className="text-sm text-neutral-400">Select an entity to inspect.</p>}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
