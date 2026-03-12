/**
 * Security Utility Functions for Cryptographically Secure RNG
 *
 * Replacing predictable Math.random() with Web Crypto API.
 */

/**
 * Returns a cryptographically secure random integer between 0 and max - 1.
 * @param max The upper bound (exclusive).
 * @returns A secure random integer.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;

  // Create an array to hold the random value
  const randomBuffer = new Uint32Array(1);

  // Use crypto.getRandomValues to populate the array
  crypto.getRandomValues(randomBuffer);

  // Modulo the maximum safe value by the requested max to avoid modulo bias
  // Note: For typical small array sizes, simple modulo is generally okay,
  // but to be perfectly uniform we reject values that cause bias.
  const limit = Math.floor(4294967296 / max) * max;

  let value = randomBuffer[0];
  while (value >= limit) {
      crypto.getRandomValues(randomBuffer);
      value = randomBuffer[0];
  }

  return value % max;
}

/**
 * Generates a cryptographically secure 6-character uppercase alphanumeric room ID.
 * @returns A secure room ID.
 */
export function generateSecureRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBuffer = new Uint8Array(6);

  crypto.getRandomValues(randomBuffer);

  for (let i = 0; i < 6; i++) {
    result += chars[randomBuffer[i] % chars.length];
  }

  return result;
}
