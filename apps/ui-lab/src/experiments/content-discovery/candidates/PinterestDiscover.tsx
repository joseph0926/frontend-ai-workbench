import { useState, type CSSProperties } from "react";
import type { CandidateProps } from "../../types.ts";
import { contentItems, contentTopics, type ContentItem } from "../fixtures.ts";
import { filterItems, resultLabel } from "../shared.ts";

const coverStyles: Record<ContentItem["coverVariant"], CSSProperties> = {
  grid: { background: "linear-gradient(135deg,#e7e0ff 0 38%,transparent 38%),linear-gradient(45deg,#1d1b2b 0 42%,#8275ff 42% 62%,#f6b0ce 62%)" },
  layers: { background: "radial-gradient(circle at 70% 26%,#f8f2d4 0 13%,transparent 14%),linear-gradient(145deg,#202124 0 42%,#8cbeb2 42% 68%,#f4d06f 68%)" },
  route: { background: "radial-gradient(circle at 22% 72%,#fff 0 5%,transparent 6%),radial-gradient(circle at 78% 27%,#fff 0 5%,transparent 6%),linear-gradient(35deg,#e65f5c,#8536a7 52%,#3627a5)" },
  cards: { background: "linear-gradient(90deg,transparent 46%,rgba(255,255,255,.72) 47% 53%,transparent 54%),linear-gradient(#ffb59f 0 33%,#f8e49a 33% 66%,#8dc4bd 66%)" },
  links: { background: "radial-gradient(ellipse at 30% 48%,transparent 0 18%,#f9faf2 19% 23%,transparent 24%),radial-gradient(ellipse at 70% 52%,transparent 0 18%,#f9faf2 19% 23%,transparent 24%),#314c44" },
  spectrum: { background: "conic-gradient(from 210deg at 64% 40%,#f9d56e,#ef7770,#7565e5,#6fc6b1,#f9d56e)" },
  steps: { background: "linear-gradient(155deg,transparent 0 30%,rgba(255,255,255,.8) 31% 38%,transparent 39% 54%,rgba(255,255,255,.65) 55% 62%,transparent 63%),#4470a8" },
  focus: { background: "radial-gradient(circle at center,#fff 0 12%,transparent 13% 27%,rgba(255,255,255,.8) 28% 31%,transparent 32%),linear-gradient(135deg,#ff8d8d,#8147c7)" },
};

const coverHeights: Record<ContentItem["coverVariant"], string> = {
  grid: "h-56 sm:h-64", layers: "h-72 sm:h-80", route: "h-64 sm:h-72", cards: "h-52 sm:h-60", links: "h-72 sm:h-80", spectrum: "h-60 sm:h-72", steps: "h-52 sm:h-64", focus: "h-64 sm:h-72",
};

export default function PinterestDiscover({ state }: CandidateProps) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("전체");
  const [saved, setSaved] = useState<string[]>([contentItems[0].id]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recovered, setRecovered] = useState(false);
  const isLoading = state === "loading";
  const isError = state === "error" && !recovered;
  const items = state === "empty" ? [] : filterItems(query, topic);

  function toggleSaved(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="lang-pinterest min-h-screen bg-[var(--pin-canvas)] text-[var(--pin-ink)] antialiased">
      <header className="sticky top-0 z-20 border-b border-[var(--pin-line)] bg-[color:rgba(255,253,248,.94)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-3 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--pin-ink)] text-xs font-bold text-white">FW</span>
          <nav className="hidden items-center gap-1 md:flex" aria-label="주요 탐색"><button className="min-h-11 rounded-full bg-[var(--pin-ink)] px-4 text-sm font-semibold text-white">발견</button><button className="min-h-11 rounded-full px-4 text-sm font-semibold hover:bg-[var(--pin-hover)]">저장함</button></nav>
          <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-[var(--pin-search)] px-4 focus-within:ring-2 focus-within:ring-[var(--pin-focus)]" data-primary-control>
            <span className="text-[var(--pin-mute)]">⌕</span><span className="sr-only">아이디어 검색</span><input autoFocus={state === "focus"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="어떤 근거가 필요하신가요?" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--pin-mute)]" />
          </label>
          <span className="hidden min-h-10 items-center rounded-full bg-[var(--pin-hover)] px-3 text-xs font-semibold sm:flex">{saved.length} 저장</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-3 pb-16 pt-5 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-[var(--pin-accent)]">EXPLORE THE WORKBENCH</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">오늘 필요한 근거를<br/>시각적으로 발견하세요</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--pin-soft)]">관심 주제를 고르고, 사례를 훑고, 다시 볼 자료를 저장합니다.</p>
        </header>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="주제 선택">
          {contentTopics.map((label) => <button key={label} onClick={() => setTopic(label)} aria-pressed={topic === label} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--pin-focus)] focus-visible:ring-offset-2 ${topic === label ? "bg-[var(--pin-ink)] text-white" : "bg-[var(--pin-chip)] hover:bg-[var(--pin-hover)]"}`}>{label}</button>)}
        </div>
        <p aria-live="polite" className="mb-4 mt-2 text-center text-xs text-[var(--pin-mute)]">{isLoading ? "아이디어를 불러오는 중" : resultLabel(items.length)}</p>

        {isLoading ? <section aria-busy="true" className="columns-2 gap-3 md:columns-3 lg:columns-4"><span className="sr-only">아이디어를 불러오는 중</span>{Array.from({length:8},(_,index)=><div key={index} className={`mb-3 break-inside-avoid animate-pulse rounded-[22px] bg-[var(--pin-search)] ${index % 3 === 0 ? "h-72" : index % 2 === 0 ? "h-56" : "h-64"}`}/>)}</section> : isError ? <section role="alert" className="mx-auto max-w-xl rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center"><p className="text-3xl">↻</p><h2 className="mt-3 text-xl font-bold">아이디어를 불러오지 못했어요</h2><p className="mt-2 text-sm leading-6 text-rose-900">선택한 주제는 유지됩니다. 잠시 후 다시 둘러보세요.</p><button onClick={() => setRecovered(true)} className="mt-5 min-h-11 rounded-full bg-[var(--pin-ink)] px-5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--pin-focus)] focus-visible:ring-offset-2">다시 불러오기</button></section> : items.length === 0 ? <section data-state="empty" className="mx-auto max-w-xl rounded-[28px] bg-[var(--pin-chip)] p-8 text-center"><p className="text-3xl">◇</p><h2 className="mt-3 text-xl font-bold">아직 모아둔 아이디어가 없어요</h2><p className="mt-2 text-sm leading-6 text-[var(--pin-soft)]">전체 주제로 돌아가 첫 자료를 발견해 보세요.</p><button onClick={() => {setQuery("");setTopic("전체");}} className="mt-5 min-h-11 rounded-full bg-[var(--pin-ink)] px-5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--pin-focus)] focus-visible:ring-offset-2">전체 아이디어 보기</button></section> : <section className="columns-2 gap-3 md:columns-3 lg:columns-4" aria-label="콘텐츠 아이디어">{items.map((item) => {
          const isSaved = saved.includes(item.id);
          const isSelected = selectedId === item.id;
          return <article key={item.id} className="mb-5 break-inside-avoid"><div className={`group relative overflow-hidden rounded-[22px] ${coverHeights[item.coverVariant]}`} style={coverStyles[item.coverVariant]}><div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/5"/><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold backdrop-blur">{item.kind}</span><button onClick={() => toggleSaved(item.id)} aria-pressed={isSaved} aria-label={`${item.title} ${isSaved ? "저장 취소" : "저장"}`} className={`absolute right-3 top-3 min-h-10 rounded-full px-3 text-xs font-bold text-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-white ${isSaved ? "bg-[var(--pin-ink)]" : "bg-[var(--pin-accent)]"}`}>{isSaved ? "저장됨" : "저장"}</button><button onClick={() => setSelectedId(isSelected ? null : item.id)} aria-expanded={isSelected} className="absolute inset-x-0 bottom-0 min-h-12 px-4 pb-4 pt-8 text-left text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white">자세히 보기</button></div><button onClick={() => setSelectedId(isSelected ? null : item.id)} aria-expanded={isSelected} className="mt-2 w-full rounded-lg px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--pin-focus)]"><h2 className="text-sm font-bold leading-5 sm:text-base">{item.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--pin-soft)]">{item.summary}</p></button>{isSelected && <div className="mt-2 rounded-2xl bg-[var(--pin-chip)] p-3 text-xs leading-5 text-[var(--pin-soft)]"><p className="font-semibold text-[var(--pin-ink)]">관련 경로</p><p className="mt-1 break-all font-mono text-[10px]">{item.repositoryPath}</p></div>}</article>;
        })}</section>}
      </div>
    </main>
  );
}
