import { NextResponse } from "next/server";
import { mockQueueEntries } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(mockQueueEntries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, queueEntry: body });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
