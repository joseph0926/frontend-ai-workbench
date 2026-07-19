import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/frontend-ai-workbench/" : "/",
  plugins: [react(), tailwindcss()],
  server: { port: 3001, strictPort: true },
  preview: { port: 3001, strictPort: true },
});
