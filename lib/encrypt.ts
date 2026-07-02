import crypto from "crypto";

// 256-bit encryption key. We hash a secret or fallback for local evaluation.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest()
  : crypto.createHash("sha256").update("chalo-care-clinic-secret-key-default").digest();

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts cleartext using AES-256-GCM
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Package IV + Encrypted Text + Auth Tag
    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return plain text in case of catastrophic error during development
  }
}

/**
 * Decrypts encrypted text using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  try {
    if (!encryptedText || !encryptedText.includes(":")) {
      return encryptedText; // Probably not encrypted
    }
    
    const [ivHex, encryptedHex, authTagHex] = encryptedText.split(":");
    if (!ivHex || !encryptedHex || !authTagHex) {
      return encryptedText;
    }
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedText; // Fallback to raw string
  }
}

/**
 * Securely encrypts an object as a JSON string
 */
export function encryptJSON<T>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts an encrypted JSON string back to an object
 */
export function decryptJSON<T>(encryptedText: string): T | null {
  const decrypted = decrypt(encryptedText);
  try {
    return JSON.parse(decrypted) as T;
  } catch (e) {
    console.error("JSON parsing error on decrypted text:", e);
    return null;
  }
}
