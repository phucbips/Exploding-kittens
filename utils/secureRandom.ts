export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const maxSafeVal = Math.floor((0xffffffff / max)) * max;
  const array = new Uint32Array(1);
  let randomVal;
  do {
    crypto.getRandomValues(array);
    randomVal = array[0];
  } while (randomVal >= maxSafeVal);
  return randomVal % max;
}

export function generateSecureId(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  return result;
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
