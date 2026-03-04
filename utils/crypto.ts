/**
 * Generates a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * Replaces Math.random() to prevent predictability vulnerabilities.
 */
export const secureRandom = (): number => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }

  // Fallback to Math.random() only if crypto is completely unavailable
  console.warn('Crypto API not available, falling back to Math.random()');
  return Math.random();
};
