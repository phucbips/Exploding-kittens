export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  if (typeof window === 'undefined' || !window.crypto) {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
        const randomBuffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(randomBuffer);
        return randomBuffer[0] % max;
    }
    return Math.floor(Math.random() * max);
  }
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

export function getSecureRandomString(): string {
  if (typeof window === 'undefined' || !window.crypto) {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.randomUUID) {
      return globalThis.crypto.randomUUID().split('-')[0];
    }
    return Math.random().toString(36).substring(2, 9);
  }
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID().split('-')[0];
  }
  return Math.random().toString(36).substring(2, 9);
}
