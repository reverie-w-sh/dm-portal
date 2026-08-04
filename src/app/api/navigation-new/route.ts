import { NextResponse } from "next/server";
import { getNavigationNewState } from "@/lib/navigation-new";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getNavigationNewState();

    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Не удалось загрузить статусы New в навигаторе:", error);

    return NextResponse.json(
      { configured: true, items: {} },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
