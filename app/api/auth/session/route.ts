import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(session);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role } = body;
    
    if (!id || !name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    await createSession({ id, name, email, role });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
