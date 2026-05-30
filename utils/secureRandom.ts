/**
 * Cryptographically secure random number generation utilities.
 * Avoids Math.random() and Date.now() which are predictable.
 */

/**
 * Generates a cryptographically secure UUID.
 * @returns {string} A valid UUIDv4.
 */
export const generateUUID = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for environments where randomUUID might not be available
  // e.g., extremely old environments, though Next.js 16 should have it.
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);

  // Set version to 4
  array[6] = (array[6] & 0x0f) | 0x40;
  // Set variant to 10
  array[8] = (array[8] & 0x3f) | 0x80;

  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * Returns a cryptographically secure random integer between 0 (inclusive) and max (exclusive).
 * @param {number} max The exclusive upper bound.
 * @returns {number} Random integer.
 */
export const getSecureRandomInt = (max: number): number => {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  const maxUint32 = 0xFFFFFFFF;
  let randomValue;
  // Ensure we don't have modulo bias
  const limit = maxUint32 - (maxUint32 % max);
  do {
    globalThis.crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue >= limit);
  return randomValue % max;
};

/**
 * Generates a cryptographically secure random string of a specific length using valid characters.
 * Useful for room IDs or short identifiers.
 * @param {number} length The length of the generated string.
 * @returns {string} The secure random string.
 */
export const generateSecureId = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const array = new Uint32Array(length);
  globalThis.crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += characters[array[i] % characters.length];
  }

  return result;
};
