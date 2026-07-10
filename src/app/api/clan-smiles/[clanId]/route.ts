import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    clanId: string;
  }>;
};

type ClanSmile = {
  src: string;
  code: string;
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

    const smiles: ClanSmile[] = [];

    for (const tag of imageTags) {
      const src = getAttribute(tag, "src");
      const alt = getAttribute(tag, "alt") ?? "";

      if (!src) continue;

      // Виправляємо подвійні слеші в старих адресах DM.
      const normalizedSrc = src.replace(/([^:]\/)\/+/g, "$1");

      let imageUrl: URL;

      try {
        imageUrl = new URL(normalizedSrc, "https://dm-game.com");
      } catch {
        continue;
      }

      const pathname = imageUrl.pathname.toLowerCase();
      const filename = pathname.split("/").pop() ?? "";

      /*
       * aa.gif — перший загальний смайлик.
       * Усе, що було перед ним, належить конкретному клану.
       */
      if (filename === "aa.gif") {
        break;
      }

      // Беремо тільки GIF-смайлики.
      if (!filename.endsWith(".gif")) {
        continue;
      }

      const code = alt
        .replace(/^:+/, "")
        .replace(/:+$/, "")
        .trim();

      smiles.push({
        src: imageUrl.href,
        code,
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
