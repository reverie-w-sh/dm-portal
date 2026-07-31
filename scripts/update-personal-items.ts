/** Collects all named/personal items from the DM library and groups them by owner. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://dm-game.com/index.php?file=library&page=personal_items";
const OUTPUT = path.resolve("data/personal-items.json");
const MAX_PAGES = 250;

type Item = {
  id: string;
  name: string;
  owner: string;
  ownerLevel?: number;
  imageUrl: string;
  itemUrl: string;
};

type Output = { updatedAt: string; items: Item[] };

function absolute(url: string) {
  try { return new URL(url, "https://dm-game.com/").toString(); } catch { return url; }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: "Mozilla/5.0 (compatible; DM-Portal/1.0)" });
  const byId = new Map<string, Item>();
  let pageCount = 1;

  for (let index = 1; index <= Math.min(pageCount, MAX_PAGES); index++) {
    const url = index === 1 ? BASE : `${BASE}&index=${index}`;
    console.log(`[${index}/${pageCount}] ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(400);

    if (index === 1) {
      pageCount = await page.evaluate(() => {
        const values = Array.from(document.querySelectorAll("a"))
          .map((a) => new URL((a as HTMLAnchorElement).href, location.href).searchParams.get("index"))
          .map(Number)
          .filter((value) => Number.isFinite(value) && value > 0);
        return values.length ? Math.max(...values) : 1;
      });
      pageCount = Math.min(pageCount, MAX_PAGES);
    }

    const found = await page.evaluate(() => {
      const result: Array<{ id: string; name: string; owner: string; ownerLevel?: number; imageUrl: string; itemUrl: string }> = [];
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="p_itemID="]'));
      for (const link of links) {
        const href = new URL(link.href, location.href);
        const id = href.searchParams.get("p_itemID") || "";
        if (!id || result.some((item) => item.id === id)) continue;
        const name = (link.textContent || "").replace(/\s+/g, " ").trim();
        if (!name || /^\d+$/.test(name)) continue;
        const root = link.closest("tr") || link.parentElement?.parentElement || link.parentElement;
        const text = (root?.textContent || "").replace(/\s+/g, " ").trim();
        const ownerMatch = text.match(/Хозяин:\s*(.+?)(?:\[(\d+)\])?(?:Долговечность|Минимальные требования|Действует на|$)/i);
        let owner = (ownerMatch?.[1] || "").trim().replace(/\s+/g, " ");
        let ownerLevel = ownerMatch?.[2] ? Number(ownerMatch[2]) : undefined;
        if (!owner) {
          const nextText = (link.parentElement?.textContent || "").replace(/\s+/g, " ");
          const fallback = nextText.match(/Хозяин:\s*(.+?)(?:\[(\d+)\])?(?:$|Долговечность)/i);
          owner = (fallback?.[1] || "").trim();
          ownerLevel = fallback?.[2] ? Number(fallback[2]) : ownerLevel;
        }
        owner = owner.replace(/\[\d+\]$/, "").trim();
        if (!owner) continue;
        const img = (root?.querySelector('img[src*="item"], img') || link.querySelector("img")) as HTMLImageElement | null;
        result.push({ id, name, owner, ownerLevel, imageUrl: img?.src || "", itemUrl: href.toString() });
      }
      return result;
    });

    for (const item of found) byId.set(item.id, { ...item, imageUrl: absolute(item.imageUrl), itemUrl: absolute(item.itemUrl) });
  }

  await browser.close();
  const output: Output = { updatedAt: new Date().toISOString(), items: [...byId.values()].sort((a, b) => a.owner.localeCompare(b.owner, "ru") || a.name.localeCompare(b.name, "ru")) };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`Saved ${output.items.length} items to ${OUTPUT}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
