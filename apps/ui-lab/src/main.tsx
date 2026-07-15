import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { experiments } from "./experiments/registry.ts";
import Gallery from "./routes/gallery.tsx";
import View from "./routes/view.tsx";

declare global {
  interface Window {
    __LAB__: { slug: string; states: string[]; candidates: string[] }[];
  }
}

window.__LAB__ = experiments.map((e) => ({
  slug: e.slug,
  states: e.states,
  candidates: e.candidates.map((c) => c.id),
}));

const router = createBrowserRouter([
  { path: "/", element: <Gallery /> },
  { path: "/view/:slug/:cand/:state", element: <View /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
