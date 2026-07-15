import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Simple encrypt helper (mirrors lib/encrypt.ts)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest()
  : crypto.createHash("sha256").update("chalo-care-clinic-secret-key-default").digest();

function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch {
    return text;
  }
}

async function main() {
  console.log("🌱 Seeding Chalo Care Clinic database...\n");

  // Hash the default passwords once
  const defaultDoctorPassword = await bcrypt.hash("doctor123", 12);
  const defaultAdminPassword = await bcrypt.hash("admin123", 12);
  const defaultPatientPassword = await bcrypt.hash("patient123", 12);

  // ─── 1. USERS ──────────────────────────────────────────────────────────────
  console.log("👤 Creating users...");

  const admin = await prisma.user.upsert({
    where: { id: "admin-1" },
    update: { password: defaultAdminPassword },
    create: {
      id: "admin-1",
      email: "admin@chalocare.com",
      name: "Administrator",
      role: "ADMIN",
      password: defaultAdminPassword,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop",
    },
  });

  const docSarah = await prisma.user.upsert({
    where: { id: "doc-1" },
    update: { password: defaultDoctorPassword },
    create: {
      id: "doc-1",
      email: "sarah.jenkins@chalocare.com",
      name: "Dr. Sarah Jenkins",
      role: "DOCTOR",
      password: defaultDoctorPassword,
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
    },
  });

  const docMarcus = await prisma.user.upsert({
    where: { id: "doc-2" },
    update: { password: defaultDoctorPassword },
    create: {
      id: "doc-2",
      email: "marcus.vance@chalocare.com",
      name: "Dr. Marcus Vance",
      role: "DOCTOR",
      password: defaultDoctorPassword,
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&fit=crop",
    },
  });

  const docElena = await prisma.user.upsert({
    where: { id: "doc-3" },
    update: { password: defaultDoctorPassword, avatar: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=200&h=200&fit=crop" },
    create: {
      id: "doc-3",
      email: "elena.rostova@chalocare.com",
      name: "Dr. Elena Rostova",
      role: "DOCTOR",
      password: defaultDoctorPassword,
      avatar: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=200&h=200&fit=crop",
    },
  });

  const docKenneth = await prisma.user.upsert({
    where: { id: "doc-4" },
    update: { password: defaultDoctorPassword },
    create: {
      id: "doc-4",
      email: "kenneth.cole@chalocare.com",
      name: "Dr. Kenneth Cole",
      role: "DOCTOR",
      password: defaultDoctorPassword,
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&fit=crop",
    },
  });

  const docPriya = await prisma.user.upsert({
    where: { id: "doc-5" },
    update: { password: defaultDoctorPassword },
    create: {
      id: "doc-5",
      email: "priya.patel@chalocare.com",
      name: "Dr. Priya Patel",
      role: "DOCTOR",
      password: defaultDoctorPassword,
      avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200&h=200&fit=crop",
    },
  });

  const patAlex = await prisma.user.upsert({
    where: { id: "pat-1" },
    update: { password: defaultPatientPassword },
    create: {
      id: "pat-1",
      email: "alex@example.com",
      name: "Alex Rivera",
      role: "PATIENT",
      password: defaultPatientPassword,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop",
    },
  });

  const patJames = await prisma.user.upsert({
    where: { id: "pat-2" },
    update: { password: defaultPatientPassword },
    create: {
      id: "pat-2",
      email: "james@example.com",
      name: "James Thompson",
      role: "PATIENT",
      password: defaultPatientPassword,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop",
    },
  });

  console.log(`  ✅ Created ${8} users\n`);

  // ─── 2. DOCTOR PROFILES ────────────────────────────────────────────────────
  console.log("🩺 Creating doctor profiles...");

  await prisma.doctorProfile.upsert({
    where: { userId: docSarah.id },
    update: {},
    create: {
      userId: docSarah.id,
      specialization: "Cardiologist",
      bio: "Dr. Jenkins is a board-certified cardiologist with over 12 years of experience in managing complex cardiovascular conditions and preventive medicine.",
      fee: 150,
      rating: 4.9,
      experience: 12,
      isAvailable: true,
      slots: "09:00 AM,10:30 AM,11:00 AM,02:00 PM,03:30 PM",
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: docMarcus.id },
    update: {},
    create: {
      userId: docMarcus.id,
      specialization: "Neurologist",
      bio: "Specializing in neuropathic pain disorders, epilepsy management, and cognitive wellness therapy, Dr. Vance brings 8+ years of dedicated clinical experience.",
      fee: 140,
      rating: 4.8,
      experience: 8,
      isAvailable: true,
      slots: "09:30 AM,11:30 AM,01:30 PM,04:00 PM",
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: docElena.id },
    update: {},
    create: {
      userId: docElena.id,
      specialization: "Pediatrician",
      bio: "Dedicated to providing compassionate healthcare for infants, kids, and teens. Dr. Rostova is known for her warm, welcoming clinic environment.",
      fee: 90,
      rating: 5.0,
      experience: 15,
      isAvailable: true,
      slots: "08:00 AM,10:00 AM,12:00 PM,03:00 PM,04:30 PM",
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: docKenneth.id },
    update: {},
    create: {
      userId: docKenneth.id,
      specialization: "Dermatologist",
      bio: "Dr. Cole is an expert in skin disease treatments, laser procedures, and advanced skin cancer screening techniques, utilizing top modern technologies.",
      fee: 110,
      rating: 4.7,
      experience: 10,
      isAvailable: false,
      slots: "09:00 AM,10:00 AM,02:30 PM",
    },
  });

  await prisma.doctorProfile.upsert({
    where: { userId: docPriya.id },
    update: {},
    create: {
      userId: docPriya.id,
      specialization: "General Practitioner",
      bio: "Passionate about holistic healthcare and preventative clinic consulting. Dr. Patel is your primary contact for general checkups and health maintenance.",
      fee: 75,
      rating: 4.9,
      experience: 6,
      isAvailable: true,
      slots: "09:00 AM,10:00 AM,11:00 AM,01:00 PM,02:00 PM,03:00 PM,04:00 PM",
    },
  });

  console.log("  ✅ Created 5 doctor profiles\n");

  // ─── 3. PATIENT PROFILES ───────────────────────────────────────────────────
  console.log("🏥 Creating patient profiles...");

  await prisma.patientProfile.upsert({
    where: { userId: patAlex.id },
    update: {},
    create: {
      userId: patAlex.id,
      gender: "Non-binary",
      bloodGroup: "O-Positive",
      dateOfBirth: new Date("1994-08-14"),
      emergencyContact: "+1 (555) 234-5678 (Maria Rivera)",
      medicalHistory: "Asthma diagnosed in childhood, well controlled. Regular pollen allergies during spring. Penicillin allergy.",
    },
  });

  await prisma.patientProfile.upsert({
    where: { userId: patJames.id },
    update: {},
    create: {
      userId: patJames.id,
      gender: "Male",
      bloodGroup: "A-Positive",
      dateOfBirth: new Date("1982-11-03"),
      emergencyContact: "+1 (555) 987-6543 (Linda Thompson)",
      medicalHistory: "Hypertension managed with Lisinopril 10mg daily. Mild spinal disc bulge (L4-L5). No known drug allergies.",
    },
  });

  console.log("  ✅ Created 2 patient profiles\n");

  // ─── 4. APPOINTMENTS ───────────────────────────────────────────────────────
  console.log("📅 Creating appointments...");

  await prisma.appointment.upsert({
    where: { id: "apt-1" },
    update: {},
    create: {
      id: "apt-1",
      patientId: patAlex.id,
      doctorId: docSarah.id,
      dateTime: new Date("2026-06-07T10:30:00.000Z"),
      status: "CONFIRMED",
      type: "VIRTUAL",
      symptoms: "Mild chest tightness and occasional rapid heartbeats after running.",
    },
  });

  await prisma.appointment.upsert({
    where: { id: "apt-2" },
    update: {},
    create: {
      id: "apt-2",
      patientId: patAlex.id,
      doctorId: docPriya.id,
      dateTime: new Date("2026-06-03T14:00:00.000Z"),
      status: "COMPLETED",
      type: "IN_PERSON",
      symptoms: "Routine annual checkup and refill of seasonal allergy medication.",
      diagnosis: encrypt("General health checkup normal. Blood pressure 120/80 mmHg. Refilled seasonal anti-histamines."),
      prescription: encrypt("Claritin (Loratadine) 10mg - Take 1 tablet daily orally as needed."),
    },
  });

  await prisma.appointment.upsert({
    where: { id: "apt-3" },
    update: {},
    create: {
      id: "apt-3",
      patientId: patJames.id,
      doctorId: docMarcus.id,
      dateTime: new Date("2026-06-08T09:30:00.000Z"),
      status: "CONFIRMED",
      type: "VIRTUAL",
      symptoms: "Recurring tension headaches radiating from neck to forehead, increased frequency.",
    },
  });

  console.log("  ✅ Created 3 appointments\n");

  // ─── 5. QUEUE ENTRIES ──────────────────────────────────────────────────────
  console.log("🚶 Creating queue entries...");

  await prisma.queueEntry.upsert({
    where: { id: "que-1" },
    update: {},
    create: {
      id: "que-1",
      patientId: patJames.id,
      doctorId: docMarcus.id,
      number: 1,
      status: "ACTIVE",
      estimatedWaitMinutes: 0,
      checkInTime: new Date("2026-06-06T13:45:00.000Z"),
    },
  });

  await prisma.queueEntry.upsert({
    where: { id: "que-2" },
    update: {},
    create: {
      id: "que-2",
      patientId: patAlex.id,
      doctorId: docSarah.id,
      number: 2,
      status: "WAITING",
      estimatedWaitMinutes: 15,
      checkInTime: new Date("2026-06-06T13:58:00.000Z"),
    },
  });

  console.log("  ✅ Created 2 queue entries\n");

  // ─── 6. SEED CHAT MESSAGES ─────────────────────────────────────────────────
  console.log("💬 Creating sample chat messages...");

  await prisma.chatMessage.upsert({
    where: { id: "msg-1" },
    update: {},
    create: {
      id: "msg-1",
      senderId: docPriya.id,
      receiverId: patAlex.id,
      content: encrypt("Hi Alex, please make sure you don't drink coffee before your blood test tomorrow morning."),
    },
  });

  await prisma.chatMessage.upsert({
    where: { id: "msg-2" },
    update: {},
    create: {
      id: "msg-2",
      senderId: patAlex.id,
      receiverId: docPriya.id,
      content: encrypt("Understood, Dr. Patel! I will fast after 10:00 PM tonight. See you tomorrow."),
    },
  });

  console.log("  ✅ Created 2 sample messages\n");

  // ─── 7. MEDICAL RECORDS ────────────────────────────────────────────────────
  console.log("📋 Creating medical records...");

  await prisma.medicalRecord.upsert({
    where: { id: "rec-1" },
    update: {},
    create: {
      id: "rec-1",
      patientId: patAlex.id,
      doctorId: docSarah.id,
      title: "Cardiology Diagnostic Report",
      encryptedData: encrypt(JSON.stringify({
        diagnosis: "ECG shows normal sinus rhythm. Slight tachycardia observed under stress. Advised low sodium diet.",
        notes: "Follow-up in 6 weeks. Consider stress test if symptoms persist.",
      })),
      attachmentName: "Cardiology Diagnostic Report.pdf",
    },
  });

  await prisma.medicalRecord.upsert({
    where: { id: "rec-2" },
    update: {},
    create: {
      id: "rec-2",
      patientId: patAlex.id,
      doctorId: docPriya.id,
      title: "Allergy Blood Panel",
      encryptedData: encrypt(JSON.stringify({
        diagnosis: "High reaction detected for Oak and Birch pollen. IgE levels elevated at 142 kU/L.",
        prescription: "Claritin (Loratadine) 10mg - Take 1 tablet daily as needed.",
      })),
      attachmentName: "Allergy Blood Panel.pdf",
    },
  });

  console.log("  ✅ Created 2 medical records\n");

  console.log("✨ Database seeded successfully!");
  console.log(`   Users: 8 | Doctors: 5 | Patients: 2 | Appointments: 3 | Queue: 2 | Messages: 2 | Records: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
