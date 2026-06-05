import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

// Generic admin proxy — POST requests to bot admin endpoints
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { endpoint, ...data } = body;

    if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

    const result = await botApi(`/api/admin/${endpoint}`, {
      method: "POST",
      body: data,
      userId: (session.user as any).id,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET admin settings
export async function GET() {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const result = await botApi("/api/admin/settings", {
      userId: (session.user as any).id,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
