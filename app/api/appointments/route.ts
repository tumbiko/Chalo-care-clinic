import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockAppointments } from "@/lib/mockData";
import { encrypt, decrypt } from "@/lib/encrypt";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type AppointmentType = "VIRTUAL" | "IN_PERSON";

interface AppointmentRequestBody {
  patientId?: string;
  doctorId?: string;
  dateTime?: string;
  type?: AppointmentType;
  symptoms?: string;
  id?: string;
  status?: AppointmentStatus;
  diagnosis?: string;
  prescription?: string;
}

export async function GET() {
  try {
    const appointments = await db.appointment.findMany({
      include: {
        patient: true,
        doctor: {
          include: {
            doctorProfile: true,
          },
        },
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    const mappedAppointments = appointments.map((apt) => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient.name || "Unknown Patient",
      patientAvatar: apt.patient.avatar || undefined,
      doctorId: apt.doctorId,
      doctorName: apt.doctor.name || "Unknown Doctor",
      doctorSpecialization: apt.doctor.doctorProfile?.specialization || "General Practitioner",
      doctorAvatar: apt.doctor.avatar || undefined,
      dateTime: apt.dateTime.toISOString(),
      status: apt.status as AppointmentStatus,
      type: apt.type as AppointmentType,
      symptoms: apt.symptoms || "",
      diagnosis: apt.diagnosis ? decrypt(apt.diagnosis) : undefined,
      prescription: apt.prescription ? decrypt(apt.prescription) : undefined,
    }));

    return NextResponse.json(mappedAppointments);
  } catch (error) {
    console.warn("Database appointments query failed, using mockAppointments fallback:", error);
    return NextResponse.json(mockAppointments);
  }
}

export async function POST(request: Request) {
  let body: AppointmentRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { patientId, doctorId, dateTime, type, symptoms } = body;

  try {
    if (!patientId || !doctorId || !dateTime) {
      throw new Error("Missing required fields");
    }

    const newApt = await db.appointment.create({
      data: {
        patientId,
        doctorId,
        dateTime: new Date(dateTime),
        type: type || "VIRTUAL",
        symptoms: symptoms || "",
        status: "CONFIRMED",
      },
      include: {
        patient: true,
        doctor: {
          include: {
            doctorProfile: true,
          },
        },
      },
    });

    const mappedApt = {
      id: newApt.id,
      patientId: newApt.patientId,
      patientName: newApt.patient.name || "Unknown Patient",
      patientAvatar: newApt.patient.avatar || undefined,
      doctorId: newApt.doctorId,
      doctorName: newApt.doctor.name || "Unknown Doctor",
      doctorSpecialization: newApt.doctor.doctorProfile?.specialization || "General Practitioner",
      doctorAvatar: newApt.doctor.avatar || undefined,
      dateTime: newApt.dateTime.toISOString(),
      status: newApt.status as AppointmentStatus,
      type: newApt.type as AppointmentType,
      symptoms: newApt.symptoms || "",
    };

    return NextResponse.json(mappedApt);
  } catch (error) {
    console.warn("Database booking failed, returning mock fallback:", error);
    return NextResponse.json({
      id: `apt-${Date.now()}`,
      patientId: patientId || "pat-1",
      patientName: "Alex Rivera",
      doctorId: doctorId || "doc-1",
      doctorName: "Dr. Sarah Jenkins",
      doctorSpecialization: "Cardiologist",
      dateTime: dateTime || new Date().toISOString(),
      status: "CONFIRMED" as AppointmentStatus,
      type: type || ("VIRTUAL" as AppointmentType),
      symptoms: symptoms || "",
      isMock: true,
    });
  }
}

export async function PATCH(request: Request) {
  let body: AppointmentRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { id, status, diagnosis, prescription } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
  }

  try {
    const updateData: { status?: AppointmentStatus; diagnosis?: string | null; prescription?: string | null } = {};
    if (status) updateData.status = status;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis ? encrypt(diagnosis) : null;
    if (prescription !== undefined) updateData.prescription = prescription ? encrypt(prescription) : null;

    const updatedApt = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        doctor: {
          include: {
            doctorProfile: true,
          },
        },
      },
    });

    const mappedApt = {
      id: updatedApt.id,
      patientId: updatedApt.patientId,
      patientName: updatedApt.patient.name || "Unknown Patient",
      patientAvatar: updatedApt.patient.avatar || undefined,
      doctorId: updatedApt.doctorId,
      doctorName: updatedApt.doctor.name || "Unknown Doctor",
      doctorSpecialization: updatedApt.doctor.doctorProfile?.specialization || "General Practitioner",
      doctorAvatar: updatedApt.doctor.avatar || undefined,
      dateTime: updatedApt.dateTime.toISOString(),
      status: updatedApt.status as AppointmentStatus,
      type: updatedApt.type as AppointmentType,
      symptoms: updatedApt.symptoms || "",
      diagnosis: updatedApt.diagnosis ? decrypt(updatedApt.diagnosis) : undefined,
      prescription: updatedApt.prescription ? decrypt(updatedApt.prescription) : undefined,
    };

    return NextResponse.json(mappedApt);
  } catch (error) {
    console.warn("Database appointment update failed, returning mock fallback:", error);
    return NextResponse.json({
      id,
      status,
      diagnosis,
      prescription,
      isMock: true,
    });
  }
}
