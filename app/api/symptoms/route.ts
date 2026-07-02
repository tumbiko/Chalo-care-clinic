import { NextResponse } from "next/server";
import { checkSymptoms } from "@/lib/mockData";

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();
    if (!symptoms) {
      return NextResponse.json({ error: "Symptom description is required" }, { status: 400 });
    }
    const report = checkSymptoms(symptoms);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
