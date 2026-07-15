import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.LAB_URL || "http://localhost:3001";
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outputRoot = process.env.LAB_ARTIFACT_DIR ? resolve(process.env.LAB_ARTIFACT_DIR) : resolve(appRoot, "../../artifacts/ui-lab");
const viewports = [["desktop", 1280, 800], ["mobile", 375, 812]];
const chromeExecutablePath = process.env.CHROME_EXECUTABLE_PATH;
const browser = await chromium.launch(chromeExecutablePath ? { executablePath: chromeExecutablePath } : {});

mkdirSync(outputRoot, { recursive: true });

const probe = await browser.newPage();
const probeResponse = await probe.goto(BASE, { waitUntil: "networkidle" });
if (!probeResponse?.ok()) throw new Error(`gallery route failed: ${probeResponse?.status() ?? "no response"}`);
const lab = await probe.evaluate(() => window.__LAB__ || []);
await probe.close();

if (lab.length === 0) {
  console.log("등록된 실험 없음 — 캡처할 것이 없습니다. (registry가 비어 있음)");
  await browser.close();
  process.exit(0);
}

for (const [viewportName, width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  const response = await page.goto(BASE, { waitUntil: "networkidle" });
  if (!response?.ok()) throw new Error(`gallery route failed: ${response?.status() ?? "no response"}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) throw new Error(`gallery has root overflow at ${width}x${height}`);
  const file = join(outputRoot, `gallery-${viewportName}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  console.log(`verified gallery -> ${file}`);
}

for (const experiment of lab) {
  const finalDir = join(outputRoot, experiment.slug, "final");
  mkdirSync(finalDir, { recursive: true });

  for (const candidate of experiment.candidates) {
    for (const state of experiment.states) {
      for (const [viewportName, width, height] of viewports) {
        const page = await browser.newPage({ viewport: { width, height } });
        await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
        const route = `/view/${experiment.slug}/${candidate}/${state}`;
        const response = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        if (!response?.ok()) throw new Error(`${route} failed: ${response?.status() ?? "no response"}`);
        await page.waitForTimeout(150);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        if (overflow) throw new Error(`${route} has root overflow at ${width}x${height}`);
        if (state === "loading" && await page.locator('[aria-busy="true"]').count() === 0) throw new Error(`${route} is missing aria-busy loading state`);
        if (state === "empty" && await page.locator('[data-state="empty"]').count() === 0) throw new Error(`${route} is missing explicit empty state`);
        if (state === "error" && await page.getByRole("alert").count() === 0) throw new Error(`${route} is missing alert recovery state`);

        if (state === "focus") {
          const active = await page.evaluate(() => ({ tag: document.activeElement?.tagName, name: document.activeElement?.getAttribute("aria-label") || (document.activeElement instanceof HTMLInputElement ? Array.from(document.activeElement.labels ?? []).map((label) => label.textContent?.trim() ?? "").filter(Boolean).join(" ") : "") || document.activeElement?.textContent?.trim() || "" }));
          if (active.tag !== "INPUT" || !active.name) throw new Error(`${route} does not expose an intentional named input focus target`);
        }

        if (state === "ready") {
          const primary = page.locator("[data-primary-control]").first();
          const box = await primary.boundingBox();
          if (!box || box.height < 40) throw new Error(`${route} primary touch target is smaller than 40px`);
        }

        const file = join(finalDir, `${candidate}-${state}-${viewportName}-${width}x${height}-light-ko.png`);
        await page.screenshot({ path: file, fullPage: true });

        if (experiment.slug === "content-discovery" && state === "ready" && viewportName === "desktop") {
          if (candidate === "notion") {
            await page.getByRole("textbox", { name: "자료 검색" }).fill("검증");
            if (!((await page.locator('[aria-live="polite"]').textContent()) ?? "").includes("개 자료")) throw new Error("notion search did not update result announcement");
          }
          if (candidate === "vercel") {
            await page.getByRole("textbox", { name: "Artifact 검색" }).fill("계약");
            if (await page.getByRole("button", { name: /Production UI 의사결정 계약/ }).count() === 0) throw new Error("vercel search returned no known fixture");
          }
          if (candidate === "pinterest") {
            await page.getByRole("button", { name: "검증", exact: true }).click();
            const savedBefore = await page.locator('button[aria-pressed="true"][aria-label*="저장"]').count();
            await page.locator('button[aria-pressed="false"][aria-label*="저장"]').first().click();
            const savedAfter = await page.locator('button[aria-pressed="true"][aria-label*="저장"]').count();
            if (savedAfter !== savedBefore + 1) throw new Error("pinterest save interaction did not update semantic state");
          }
        }

        if (state === "ready" && viewportName === "mobile") {
          await page.evaluate(() => { document.documentElement.style.fontSize = "125%"; });
          await page.waitForTimeout(100);
          const scaledOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
          if (scaledOverflow) throw new Error(`${route} has root overflow at 125% text scaling`);
        }

        await page.close();
        console.log(`verified ${route} -> ${file}`);
      }
    }
  }
}

await browser.close();
