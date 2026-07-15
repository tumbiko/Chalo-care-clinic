import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockQueueEntries } from "@/lib/mockData";

type QueueStatus = "WAITING" | "ACTIVE" | "SKIPPED" | "COMPLETED";

interface QueueRequestBody {
  patientId?: string;
  doctorId?: string;
  id?: string;
  status?: QueueStatus;
  action?: string;
}

export async function GET() {
  try {
    const queueEntries = await db.queueEntry.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        checkInTime: "asc",
      },
    });

    const mappedEntries = queueEntries.map((entry) => ({
      id: entry.id,
      patientId: entry.patientId,
      patientName: entry.patient.name || "Unknown Patient",
      patientAvatar: entry.patient.avatar || undefined,
      doctorId: entry.doctorId,
      doctorName: entry.doctor.name || "Unknown Doctor",
      number: entry.number,
      status: entry.status as QueueStatus,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      checkInTime: entry.checkInTime.toISOString(),
    }));

    return NextResponse.json(mappedEntries);
  } catch (error) {
    console.warn("Database queue query failed, using mockQueueEntries fallback:", error);
    return NextResponse.json(mockQueueEntries);
  }
}

export async function POST(request: Request) {
  let body: QueueRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { patientId, doctorId } = body;

  if (!patientId || !doctorId) {
    return NextResponse.json({ error: "Missing required fields: patientId, doctorId" }, { status: 400 });
  }

  try {
    const activeEntriesCount = await db.queueEntry.count({
      where: {
        doctorId,
        status: { in: ["WAITING", "ACTIVE"] },
      },
    });
    const nextNumber = activeEntriesCount + 1;
    const estimatedWaitMinutes = nextNumber * 15;

    const newEntry = await db.queueEntry.create({
      data: {
        patientId,
        doctorId,
        number: nextNumber,
        estimatedWaitMinutes,
        status: "WAITING",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    const mappedEntry = {
      id: newEntry.id,
      patientId: newEntry.patientId,
      patientName: newEntry.patient.name || "Unknown Patient",
      patientAvatar: newEntry.patient.avatar || undefined,
      doctorId: newEntry.doctorId,
      doctorName: newEntry.doctor.name || "Unknown Doctor",
      number: newEntry.number,
      status: newEntry.status as QueueStatus,
      estimatedWaitMinutes: newEntry.estimatedWaitMinutes,
      checkInTime: newEntry.checkInTime.toISOString(),
    };

    return NextResponse.json(mappedEntry);
  } catch (error) {
    console.warn("Database queue checkin failed, returning mock fallback:", error);
    return NextResponse.json({
      id: `que-${Date.now()}`,
      patientId,
      patientName: "Alex Rivera",
      doctorId,
      doctorName: "Dr. Sarah Jenkins",
      number: 1,
      status: "WAITING" as QueueStatus,
      estimatedWaitMinutes: 15,
      checkInTime: new Date().toISOString(),
      isMock: true,
    });
  }
}

export async function PATCH(request: Request) {
  let body: QueueRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { id, status, doctorId, action } = body;

  try {
    if (doctorId && action === "advance") {
      // Find active and next waiting entries for this doctor
      const activeEntry = await db.queueEntry.findFirst({
        where: {
          doctorId,
          status: "ACTIVE",
        },
        orderBy: { checkInTime: "asc" },
      });

      const nextWaitingEntry = await db.queueEntry.findFirst({
        where: {
          doctorId,
          status: "WAITING",
        },
        orderBy: { checkInTime: "asc" },
      });

      if (activeEntry) {
        await db.queueEntry.update({
          where: { id: activeEntry.id },
          data: { status: "COMPLETED" },
        });
      }

      if (nextWaitingEntry) {
        await db.queueEntry.update({
          where: { id: nextWaitingEntry.id },
          data: { status: "ACTIVE", estimatedWaitMinutes: 0 },
        });
      }

      // Fetch all queue entries to return updated list
      const allQueue = await db.queueEntry.findMany({
        include: { patient: true, doctor: true },
        orderBy: { checkInTime: "asc" },
      });

      const mapped = allQueue.map((entry) => ({
        id: entry.id,
        patientId: entry.patientId,
        patientName: entry.patient.name || "Unknown Patient",
        patientAvatar: entry.patient.avatar || undefined,
        doctorId: entry.doctorId,
        doctorName: entry.doctor.name || "Unknown Doctor",
        number: entry.number,
        status: entry.status as QueueStatus,
        estimatedWaitMinutes: entry.estimatedWaitMinutes,
        checkInTime: entry.checkInTime.toISOString(),
      }));

      return NextResponse.json({ success: true, queue: mapped });
    }

    if (id) {
      const updated = await db.queueEntry.update({
        where: { id },
        data: {
          status: status,
          estimatedWaitMinutes: status === "ACTIVE" ? 0 : undefined,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });

      const mappedEntry = {
        id: updated.id,
        patientId: updated.patientId,
        patientName: updated.patient.name || "Unknown Patient",
        patientAvatar: updated.patient.avatar || undefined,
        doctorId: updated.doctorId,
        doctorName: updated.doctor.name || "Unknown Doctor",
        number: updated.number,
        status: updated.status as QueueStatus,
        estimatedWaitMinutes: updated.estimatedWaitMinutes,
        checkInTime: updated.checkInTime.toISOString(),
      };

      return NextResponse.json(mappedEntry);
    }

    return NextResponse.json({ error: "Missing parameters: id or doctorId with action=advance" }, { status: 400 });
  } catch (error) {
    console.warn("Database queue update failed, returning mock fallback:", error);
    return NextResponse.json({
      id,
      status,
      doctorId,
      isMock: true,
    });
  }
}
