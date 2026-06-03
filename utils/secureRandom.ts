export const getSecureRandomInt = (max: number): number => {
  if (max <= 0) return 0;

  // To avoid modulo bias, we use rejection sampling.
  // We want to find the largest multiple of 'max' that is <= 2^32.
  // The maximum value for Uint32 is 4294967295, so there are 4294967296 possible values.
  const maxValid = Math.floor(4294967296 / max) * max;
  const array = new Uint32Array(1);

  while (true) {
    globalThis.crypto.getRandomValues(array);
    if (array[0] < maxValid) {
      return array[0] % max;
    }
  }
};

export const generateSecureId = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[getSecureRandomInt(chars.length)];
  }
  return result;
};

export const generateUUID = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // Fallback if randomUUID is not available (though it should be in modern environments)
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => {
    const num = Number(c);
    return (num ^ (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16);
  });
};
