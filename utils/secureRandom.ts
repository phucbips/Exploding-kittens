/**
 * Cryptographically secure random utility functions using Web Crypto API.
 * Replaces predictable Math.random() for security-sensitive logic.
 */

export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const maxSafeInt = Math.floor(max);
  // 2^32 = 4294967296
  const limit = 4294967296 - (4294967296 % maxSafeInt);

  while (true) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    if (array[0] < limit) {
      return array[0] % maxSafeInt;
    }
  }
}

function generateSecureString(length: number, chars: string): string {
  const limit = 256 - (256 % chars.length);
  let result = '';
  while (result.length < length) {
    const array = new Uint8Array(length);
    globalThis.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      if (array[i] < limit) {
        result += chars[array[i] % chars.length];
        if (result.length === length) break;
      }
    }
  }
  return result;
}

export function generateSecureId(length: number = 9): string {
  return generateSecureString(length, 'abcdefghijklmnopqrstuvwxyz0123456789');
}

export function generateSecureRoomId(length: number = 6): string {
  return generateSecureString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

export function generateUUID(): string {
  return globalThis.crypto.randomUUID();
}
