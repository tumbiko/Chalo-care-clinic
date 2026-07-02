import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encrypt";

export async function GET() {
  // Return list of mocked encrypted records
  const records = [
    {
      id: "rec-1",
      name: "Cardiology Diagnostic Report.pdf",
      date: "2026-06-01",
      content: encrypt("ECG shows normal sinus rhythm. Slight tachycardia observed under stress. Advised low sodium diet.")
    },
    {
      id: "rec-2",
      name: "Allergy Blood Panel.pdf",
      date: "2026-05-15",
      content: encrypt("High reaction detected for Oak and Birch pollen. IgE levels elevated at 142 kU/L.")
    }
  ];
  return NextResponse.json(records);
}
