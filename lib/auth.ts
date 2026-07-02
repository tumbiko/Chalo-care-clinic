import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.ENCRYPTION_KEY || "chalo-care-clinic-portal-secure-key-32-chars"
);

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export async function encryptSession(payload: UserSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function decryptSession(input: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(input, SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserSession;
  } catch (err) {
    return null;
  }
}

export async function createSession(user: UserSession) {
  const sessionToken = await encryptSession(user);
  const cookieStore = await cookies();
  cookieStore.set("chalo_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("chalo_session");
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("chalo_session")?.value;
  if (!sessionToken) return null;
  return await decryptSession(sessionToken);
}
