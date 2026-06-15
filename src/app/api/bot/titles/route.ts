import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const path = userId ? `/api/titles/${userId}` : `/api/titles`;
  try {
    const data = await botApi(path, { userId: (session.user as any).id });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
