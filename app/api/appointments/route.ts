import { NextResponse } from "next/server";
import { mockAppointments } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(mockAppointments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, appointment: body });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
