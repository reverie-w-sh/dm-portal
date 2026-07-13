import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PublishPayload = {
  version: number;
  updatedAt: string;
  changes: string[];
  route: string[];
  dangerCells: string[];
  customMarkers: Array<{ coord: string; label: string }>;
  battleMarkers: Array<{ coord: string; label: string }>;
  bosses: Array<{
    coord: string;
    kind: "adjutant" | "king";
    label: string;
  }>;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}`);
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const expectedKey = requiredEnv("GARDEN_EDITOR_PUBLISH_KEY");
    const receivedKey = request.headers.get("x-garden-publish-key");

    if (!receivedKey || receivedKey !== expectedKey) {
      return NextResponse.json(
        { ok: false, error: "Неверный ключ публикации" },
        { status: 401 }
      );
    }

    const token = requiredEnv("GITHUB_TOKEN");
    const owner = requiredEnv("GITHUB_REPO_OWNER");
    const repo = requiredEnv("GITHUB_REPO_NAME");
    const branch = process.env.GITHUB_BRANCH || "main";
    const filePath =
      process.env.GARDEN_LAYERS_PATH || "data/garden-layers.json";

    const payload = (await request.json()) as PublishPayload;

    if (!Array.isArray(payload.route)) {
      return NextResponse.json(
        { ok: false, error: "Некорректный маршрут" },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    const currentResponse = await fetch(
      `${apiUrl}?ref=${encodeURIComponent(branch)}`,
      {
        headers,
        cache: "no-store",
      }
    );

    let sha: string | undefined;

    if (currentResponse.ok) {
      const current = (await currentResponse.json()) as { sha?: string };
      sha = current.sha;
    } else if (currentResponse.status !== 404) {
      const detail = await currentResponse.text();
      throw new Error(`GitHub не прочитал текущий файл: ${detail}`);
    }

    const content = Buffer.from(
      JSON.stringify(payload, null, 2) + "\n",
      "utf8"
    ).toString("base64");

    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Обновление маршрута Сада кошмаров v${payload.version}`,
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!updateResponse.ok) {
      const detail = await updateResponse.text();
      throw new Error(`GitHub не сохранил файл: ${detail}`);
    }

    const result = (await updateResponse.json()) as {
      commit?: { html_url?: string };
    };

    return NextResponse.json({
      ok: true,
      version: payload.version,
      commitUrl: result.commit?.html_url ?? null,
      message:
        "Файл опубликован. Vercel автоматически начнёт новую сборку.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
