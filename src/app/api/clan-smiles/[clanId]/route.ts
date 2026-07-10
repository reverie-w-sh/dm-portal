import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    clanId: string;
  }>;
};

function getAttribute(tag: string, attribute: string): string | null {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i")
  );

  return match?.[1] ?? null;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { clanId } = await context.params;

  if (!/^\d+$/.test(clanId)) {
    return NextResponse.json(
      {
        error: "Некорректный номер клана",
        smiles: [],
      },
      { status: 400 }
    );
  }

  const pageUrl = `https://dm-game.com/xmir/b/smiles_old.php?c=${clanId}`;

  try {
    const response = await fetch(pageUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`DM вернул статус ${response.status}`);
    }

    const html = await response.text();
    const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];

    const smiles: Array<{
      src: string;
      code: string;
    }> = [];

    for (const tag of imageTags) {
      const src = getAttribute(tag, "src");
      const alt = getAttribute(tag, "alt") ?? "";

      if (!src) continue;

      // Прибираємо подвійні слеші в шляху,
      // але не чіпаємо https://
      const normalizedSrc = src.replace(/([^:]\/)\/+/g, "$1");

      let absoluteSrc: string;

      try {
        absoluteSrc = new URL(
          normalizedSrc,
          "https://dm-game.com"
        ).href;
      } catch {
        continue;
      }

      const pathname = new URL(absoluteSrc).pathname.toLowerCase();
      const filename = pathname.split("/").pop() ?? "";

      // aa.gif — перший загальний смайлик.
      // На ньому зупиняємося.
      if (filename === "aa.gif") {
        break;
      }

      // Беремо тільки смайлики конкретного клану.
      const clanFolder = `/smiles/clan${clanId}/`;

      if (!pathname.includes(clanFolder.toLowerCase())) {
        continue;
      }

      smiles.push({
        src: absoluteSrc,
        code: alt.replace(/^:+/, ""),
      });
    }

    const uniqueSmiles = Array.from(
      new Map(
        smiles.map((smile) => [smile.src, smile])
      ).values()
    );

    return NextResponse.json({
      clanId,
      smiles: uniqueSmiles,
    });
  } catch (error) {
    console.error(
      `Не удалось загрузить смайлики клана ${clanId}:`,
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось загрузить смайлики",
        smiles: [],
      },
      { status: 502 }
    );
  }
}
