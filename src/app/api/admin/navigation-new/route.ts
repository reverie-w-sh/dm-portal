import { NextResponse } from "next/server";
import {
  getNavigationNewState,
  setNavigationNewItems,
} from "@/lib/navigation-new";
import { isNavHref, type NavHref } from "@/lib/navigation-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  try {
    return noStoreJson(await getNavigationNewState());
  } catch (error) {
    console.error("Не удалось загрузить управление New:", error);

    return noStoreJson(
      { configured: true, items: {}, message: "Не удалось загрузить настройки" },
      500,
    );
  }
}

export async function PUT(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return noStoreJson({ message: "Некорректные данные" }, 400);
  }

  if (!body || typeof body !== "object" || !("hrefs" in body)) {
    return noStoreJson({ message: "Не передан список ссылок" }, 400);
  }

  const hrefs = (body as { hrefs: unknown }).hrefs;

  if (
    !Array.isArray(hrefs) ||
    !hrefs.every(
      (href): href is NavHref =>
        typeof href === "string" && isNavHref(href),
    )
  ) {
    return noStoreJson({ message: "В списке есть неизвестная ссылка" }, 400);
  }

  try {
    const state = await setNavigationNewItems(hrefs);

    if (!state.configured) {
      return noStoreJson(
        {
          ...state,
          message: "Upstash Redis не подключён в Vercel",
        },
        503,
      );
    }

    return noStoreJson(state);
  } catch (error) {
    console.error("Не удалось сохранить статусы New:", error);

    return noStoreJson({ message: "Не удалось сохранить настройки" }, 500);
  }
}
