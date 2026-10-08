import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { demoSnapshots } from "@/db/schema";
import { createInitialDemoState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const DEMO_ID = "kenya-foreign-affairs-demo-v1";

// This endpoint is a fictional, shared sandbox—not an authentication system.
// Do not use it for real citizen or consular records.
export async function GET() {
  try {
    const existing = await db.select().from(demoSnapshots).where(eq(demoSnapshots.id, DEMO_ID)).limit(1);
    if (existing[0]) return NextResponse.json({ state: existing[0].state, storage: "postgres" });

    const seed = createInitialDemoState();
    await db.insert(demoSnapshots).values({ id: DEMO_ID, state: seed as unknown as Record<string, unknown> }).onConflictDoNothing();
    const created = await db.select().from(demoSnapshots).where(eq(demoSnapshots.id, DEMO_ID)).limit(1);
    return NextResponse.json({ state: created[0]?.state ?? seed, storage: "postgres" });
  } catch (error) {
    console.error("Demo state could not be loaded from PostgreSQL", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Demo database is unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) return NextResponse.json({ error: "Demo state is too large." }, { status: 413 });

  try {
    const body = (await request.json()) as { state?: unknown };
    if (!body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
      return NextResponse.json({ error: "A valid demo state is required." }, { status: 400 });
    }

    const state = body.state as Record<string, unknown>;
    const serialized = JSON.stringify(state);
    if (serialized.length > 1_000_000) return NextResponse.json({ error: "Demo state is too large." }, { status: 413 });
    if (!Array.isArray(state.trips) || !Array.isArray(state.alerts) || !Array.isArray(state.cases)) {
      return NextResponse.json({ error: "Demo state is missing required collections." }, { status: 400 });
    }

    await db.insert(demoSnapshots)
      .values({ id: DEMO_ID, state, updatedAt: new Date() })
      .onConflictDoUpdate({ target: demoSnapshots.id, set: { state, updatedAt: new Date() } });
    return NextResponse.json({ ok: true, storage: "postgres" });
  } catch (error) {
    console.error("Demo state could not be saved to PostgreSQL", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Demo database is unavailable." }, { status: 503 });
  }
}
