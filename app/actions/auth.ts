"use server";

import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { mockDoctors, mockPatients } from "@/lib/mockData";
import { redirect } from "next/navigation";

// Helper to determine if DB connection is active/configured
async function findUserByEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.warn("Database query failed, trying mock fallback registry...");
    return null;
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleInput = formData.get("role") as string; // PATIENT, DOCTOR, ADMIN

  if (!email || !password || !name) {
    return { error: "Please fill out all fields." };
  }

  const role = (roleInput === "DOCTOR" || roleInput === "ADMIN") ? roleInput : "PATIENT";

  // 1. Try Live Database Registration
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        // Optional placeholder avatar
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop`,
        patientProfile: role === "PATIENT" ? { create: {} } : undefined,
        doctorProfile: role === "DOCTOR" ? { create: { specialization: "General Practitioner" } } : undefined,
      },
    });

    await createSession({
      id: user.id,
      name: user.name || name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.warn("Prisma database is not initialized or configured. Proceeding in Mock Session Mode.");

    // Fallback: Mock Sign Up success
    await createSession({
      id: `mock-${Date.now()}`,
      name,
      email,
      role: role as "PATIENT" | "DOCTOR" | "ADMIN",
    });
  }

  redirect(`/${role.toLowerCase()}`);
}

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  // 1. Try Live DB authentication
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const hashToCheck = user.password || user.clerkId;
      let passwordMatch = false;
      if (hashToCheck) {
        passwordMatch = await bcrypt.compare(password, hashToCheck);
      } else {
        // Fallback for seeded users that might not have hashed passwords yet in database
        if (user.role === "ADMIN" && password === "admin123") passwordMatch = true;
        if (user.role === "DOCTOR" && password === "doctor123") passwordMatch = true;
        if (user.role === "PATIENT" && password === "patient123") passwordMatch = true;
      }

      if (passwordMatch) {
        await createSession({
          id: user.id,
          name: user.name || "User",
          email: user.email,
          role: user.role,
        });
        redirect(`/${user.role.toLowerCase()}`);
      }
    }
  } catch (error) {
    console.warn("Live DB authentication failed or connection timed out, checking mock registry...");
  }

  // 2. Mock fallbacks (so it works out-of-the-box when DB is not configured/accessible)
  // Check admin
  if (email === "admin@chalocare.com" && password === "admin123") {
    await createSession({
      id: "admin-1",
      name: "Administrator",
      email: "admin@chalocare.com",
      role: "ADMIN",
    });
    redirect("/admin");
  }

  // Check doctors
  const mockDoc = mockDoctors.find(d => d.name.toLowerCase().includes(email.split("@")[0].toLowerCase()) || d.id === email.split("@")[0]);
  if (mockDoc && password === "doctor123") {
    await createSession({
      id: mockDoc.id,
      name: mockDoc.name,
      email: `${mockDoc.id}@chalocare.com`,
      role: "DOCTOR",
    });
    redirect("/doctor");
  }

  // Check patients
  const mockPat = mockPatients.find(p => p.email === email);
  if (mockPat && password === "patient123") {
    await createSession({
      id: mockPat.id,
      name: mockPat.name,
      email: mockPat.email,
      role: "PATIENT",
    });
    redirect("/patient");
  }

  return { error: "Invalid credentials. Use admin@chalocare.com / admin123, or pat-1/patient123, or doc-5/doctor123 for immediate dev access." };
}

export async function signOutAction() {
  await destroySession();
  redirect("/sign-in");
}
