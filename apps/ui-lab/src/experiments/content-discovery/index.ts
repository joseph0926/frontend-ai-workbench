import type { Experiment } from "../types.ts";
import NotionWorkspace from "./candidates/NotionWorkspace.tsx";
import PinterestDiscover from "./candidates/PinterestDiscover.tsx";
import VercelIndex from "./candidates/VercelIndex.tsx";
import { previewStates } from "./shared.ts";
import "./styles.css";

export const contentDiscovery: Experiment = {
  slug: "content-discovery",
  title: "Content Discovery",
  anchor: "Notion / Vercel / Pinterest",
  states: previewStates,
  candidates: [
    { id: "notion", label: "Notion-like · Structured workspace", Component: NotionWorkspace },
    { id: "vercel", label: "Vercel-like · Precise index", Component: VercelIndex },
    { id: "pinterest", label: "Pinterest-like · Visual discovery", Component: PinterestDiscover },
  ],
};
