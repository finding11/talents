const PBKDF2_ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function pbkdf2Hash(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const saltBuffer = new Uint8Array(salt);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuffer, iterations, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

/** Edge-safe password hash (Web Crypto PBKDF2). Existing bcrypt hashes still verify. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("pbkdf2:")) {
    const [, iterStr, saltB64, hashB64] = stored.split(":");
    if (!iterStr || !saltB64 || !hashB64) return false;

    const iterations = parseInt(iterStr, 10);
    const salt = base64ToBytes(saltB64);
    const expected = base64ToBytes(hashB64);
    const actual = await pbkdf2Hash(password, salt, iterations);

    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
  }

  const { compare } = await import("bcryptjs");
  return compare(password, stored);
}
