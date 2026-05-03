/**
 * Returns a secure random integer between 0 (inclusive) and max (exclusive).
 * @param {number} max
 * @returns {number}
 */
export const getSecureRandomInt = (max) => {
  if (max <= 0) return 0;
  // A simple modulo approach. For critical crypto this might have a slight modulo bias,
  // but for game logic like shuffling and array index picking it is secure enough
  // and much better than Math.random().
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  return array[0] % max;
};

/**
 * Generates a secure short ID.
 * @param {number} length
 * @returns {string}
 */
export const generateSecureId = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[array[i] % chars.length];
  }
  return id;
};

/**
 * Generates a standard UUID using the Web Crypto API.
 * @returns {string}
 */
export const generateUUID = () => {
  if (globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback just in case randomUUID is missing (e.g., non-secure context without polyfill)
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10

  const hex = [...array].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`;
};
