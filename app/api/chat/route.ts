import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encrypt";
import { mockChatMessages } from "@/lib/mockData";

// In-memory fallback for local mock mode when DB is not reachable
const inMemoryMessages = [...mockChatMessages];

// Helper to ensure user exists in the database
async function ensureUserExists(id: string) {
  try {
    const existing = await db.user.findUnique({
      where: { id }
    });

    if (existing) return existing;

    // Create the user with default demo properties if missing
    const defaultUsers: Record<string, { name: string; email: string; role: "PATIENT" | "DOCTOR" | "ADMIN" }> = {
      "pat-1": { name: "Alex Rivera", email: "alex@example.com", role: "PATIENT" },
      "pat-2": { name: "James Thompson", email: "james@example.com", role: "PATIENT" },
      "doc-1": { name: "Dr. Sarah Jenkins", email: "sarah@chalocare.com", role: "DOCTOR" },
      "doc-2": { name: "Dr. Marcus Vance", email: "marcus@chalocare.com", role: "DOCTOR" },
      "doc-3": { name: "Dr. Elena Rostova", email: "elena@chalocare.com", role: "DOCTOR" },
      "doc-4": { name: "Dr. Kenneth Cole", email: "kenneth@chalocare.com", role: "DOCTOR" },
      "doc-5": { name: "Dr. Priya Patel", email: "priya@chalocare.com", role: "DOCTOR" },
      "admin-1": { name: "Administrator", email: "admin@chalocare.com", role: "ADMIN" }
    };

    const details = defaultUsers[id] || {
      name: `User ${id.substring(0, 5)}`,
      email: `${id}@example.com`,
      role: id.startsWith("doc") ? ("DOCTOR" as const) : ("PATIENT" as const)
    };

    return await db.user.create({
      data: {
        id,
        name: details.name,
        email: details.email,
        role: details.role,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop`
      }
    });
  } catch (error) {
    console.warn(`Could not ensure user ${id} exists in database:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get("senderId");
    const receiverId = searchParams.get("receiverId");

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing senderId or receiverId" }, { status: 400 });
    }

    try {
      // 1. Try to fetch from DB
      const messages = await db.chatMessage.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      // Decrypt contents
      const decryptedMessages = messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: decrypt(m.content),
        createdAt: m.createdAt.toISOString()
      }));

      return NextResponse.json(decryptedMessages);

    } catch (dbError) {
      console.warn("Database chat query failed, using in-memory mock messages:", dbError);
      
      // 2. Fallback to in-memory messages
      const filtered = inMemoryMessages.filter(
        m => (m.senderId === senderId && m.receiverId === receiverId) ||
             (m.senderId === receiverId && m.receiverId === senderId)
      );

      return NextResponse.json(filtered);
    }
  } catch (error) {
    console.error("GET chat handler failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, content } = await request.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      // 1. Try to persist in DB
      // First ensure sender and receiver exist in User table (avoids foreign key violations)
      await ensureUserExists(senderId);
      await ensureUserExists(receiverId);

      const encryptedContent = encrypt(content);
      const message = await db.chatMessage.create({
        data: {
          senderId,
          receiverId,
          content: encryptedContent
        }
      });

      return NextResponse.json({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: content,
        createdAt: message.createdAt.toISOString()
      });

    } catch (dbError) {
      console.warn("Database chat save failed, using in-memory store fallback:", dbError);

      // 2. Fallback to in-memory array
      const mockMsg = {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        content,
        createdAt: new Date().toISOString()
      };
      
      inMemoryMessages.push(mockMsg);
      return NextResponse.json(mockMsg);
    }
  } catch (error) {
    console.error("POST chat handler failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
