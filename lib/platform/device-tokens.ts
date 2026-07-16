import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { ApiAuthError } from "./api-auth";

function key(): Buffer {
  const secret = process.env.BEGINLY_DEVICE_TOKEN_ENCRYPTION_KEY?.trim();
  if (!secret || secret.length < 24) throw new ApiAuthError(503, "push_registration_not_configured", "Push registration encryption is not configured.");
  return createHash("sha256").update(secret).digest();
}

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function encryptDeviceToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptDeviceToken(value: string): string {
  const [version, ivValue, tagValue, cipherValue] = value.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !cipherValue) throw new Error("Unsupported encrypted device token.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(cipherValue, "base64url")), decipher.final()]).toString("utf8");
}
