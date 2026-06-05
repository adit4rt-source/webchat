import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function GET() {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  try {
    const data = await botApi(`/api/admin/catalog`, { userId: (session.user as any).id });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
