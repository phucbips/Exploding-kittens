// Utility functions for cryptographically secure random generation using Web Crypto API

/**
 * Returns a cryptographically secure integer between 0 and max - 1
 * @param {number} max The upper bound (exclusive)
 * @returns {number}
 */
export const getSecureRandomInt = (max) => {
  if (max <= 0) return 0;

  // Use a 32-bit unsigned integer to get a random value
  const randomArray = new Uint32Array(1);
  globalThis.crypto.getRandomValues(randomArray);

  // Modulo bias is acceptable here for small max values in game logic,
  // but for perfect uniformity we'd reject values >= (2^32 - (2^32 % max))
  return randomArray[0] % max;
};

/**
 * Generates a cryptographically secure random string of specified length
 * @param {number} length The length of the string to generate
 * @returns {string}
 */
export const generateSecureId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomArray = new Uint8Array(length);
  globalThis.crypto.getRandomValues(randomArray);

  let result = '';
  for (let i = 0; i < length; i++) {
    // Map the random byte to our character set
    result += chars[randomArray[i] % chars.length];
  }

  return result;
};

/**
 * Wrapper for Web Crypto API randomUUID
 * @returns {string} A standard UUIDv4
 */
export const generateUUID = () => {
  return globalThis.crypto.randomUUID();
};
