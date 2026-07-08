import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mockDoctors } from "@/lib/mockData";

const SYSTEM_PROMPT = `You are a medical triage AI assistant for Chalo Care Clinic. 
Your role is to analyze patient symptoms and recommend the most appropriate medical specialist and care actions.

The clinic has the following doctors available:
${mockDoctors.map(d => `- ${d.name} (${d.specialization}) — ${d.bio}`).join("\n")}

When a patient describes their symptoms, you MUST respond ONLY in valid JSON using this exact schema:
{
  "specialty": "the matched medical specialty (e.g. Cardiologist, Neurologist, Dermatologist, Pediatrician, General Practitioner)",
  "recommendedDoctor": "the EXACT full name of the most relevant doctor from the list above",
  "severity": "LOW" | "MEDIUM" | "HIGH",
  "urgency": "a short, direct sentence about how urgently the patient should seek care",
  "reasoning": "2-3 sentence explanation of why you made this assessment based on the symptoms",
  "advice": ["array", "of", "4 to 6", "specific", "self-care action items tailored to their symptoms"],
  "redFlags": ["array of any serious warning signs to watch for, or empty array if none"],
  "disclaimer": "Always include: 'This AI analysis is not a substitute for professional medical advice. Consult a licensed doctor for accurate diagnosis and treatment.'"
}

Rules:
- Base severity on symptom urgency: HIGH = emergency-level, MEDIUM = needs prompt care, LOW = routine
- Be specific to the actual symptoms described — do NOT give generic advice
- redFlags should list specific symptoms that would require emergency services
- Your entire response must be ONLY the JSON object — no markdown, no extra text`;

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a valid symptom description." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      // Graceful fallback: return a clear message
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
          fallback: true,
          message: "The AI symptom checker requires a Gemini API key. Please add your GEMINI_API_KEY to the .env.local file. Get a free key at https://aistudio.google.com/app/apikey"
        },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Patient symptoms: ${symptoms.trim()}` }
    ]);

    const rawText = result.response.text().trim();

    // Strip any markdown code fences if model adds them
    const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      console.error("Gemini returned non-JSON:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected response format. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...parsed, aiPowered: true });
  } catch (error: unknown) {
    console.error("Symptom API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to analyze symptoms: ${message}` },
      { status: 500 }
    );
  }
}
