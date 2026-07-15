import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockDoctors } from "@/lib/mockData";

const DEFAULT_DOCTOR_PASSWORD = "doctor123";

export async function GET() {
  try {
    const doctors = await db.user.findMany({
      where: { role: "DOCTOR" },
      include: { doctorProfile: true },
    });

    const mappedDoctors = doctors.map((doc) => {
      const profile = doc.doctorProfile;
      return {
        id: doc.id,
        name: doc.name || "",
        email: doc.email,
        specialization: profile?.specialization || "General Practitioner",
        bio: profile?.bio || "",
        fee: profile?.fee || 50,
        rating: profile?.rating || 5.0,
        experience: profile?.experience || 3,
        avatar: doc.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
        isAvailable: profile?.isAvailable ?? true,
        slots: profile?.slots ? profile.slots.split(",").map((s) => s.trim()) : ["09:00 AM", "10:30 AM", "02:00 PM"],
      };
    });

    return NextResponse.json(mappedDoctors);
  } catch (error) {
    console.warn("Database doctor query failed, using mockDoctors fallback:", error);
    return NextResponse.json(mockDoctors);
  }
}


export async function POST(request: Request) {
  try {
    const { name, email, specialization, fee } = await request.json();

    if (!name || !email || !specialization) {
      return NextResponse.json(
        { error: "Name, email, and specialization are required." },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_DOCTOR_PASSWORD, 12);

    // Create the User record
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
      },
    });

    // Create the DoctorProfile record
    await db.doctorProfile.create({
      data: {
        userId: user.id,
        specialization,
        bio: `Dr. ${name} is a board-certified ${specialization} committed to patient care.`,
        fee: parseFloat(fee) || 100,
        rating: 5.0,
        experience: 5,
        isAvailable: true,
        slots: "09:00 AM,10:30 AM,02:00 PM",
      },
    });

    return NextResponse.json({
      success: true,
      doctor: {
        id: user.id,
        name: user.name,
        email: user.email,
        specialization,
        fee: parseFloat(fee) || 100,
        rating: 5.0,
        experience: 5,
        avatar: user.avatar,
        isAvailable: true,
        slots: ["09:00 AM", "10:30 AM", "02:00 PM"],
        defaultPassword: DEFAULT_DOCTOR_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Failed to create doctor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
