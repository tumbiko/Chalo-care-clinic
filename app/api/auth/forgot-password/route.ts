import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (db.user as any).findUnique({ where: { email } }) as {
      id: string; email: string; password: string | null;
      passwordResetToken: string | null; passwordResetExpiry: Date | null;
    } | null;

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure 32-byte hex token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: expiry,
      },
    });

    // In production this would send an email. For now, return the token
    // so the admin/developer can see it during testing.
    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      // Only expose token in development — never in production
      ...(isDev && { devToken: token, devMessage: "In production, this token would be emailed." }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
