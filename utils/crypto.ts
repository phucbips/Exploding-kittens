/**
 * Generates a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * This is a drop-in replacement for Math.random() where security is needed.
 */
export const secureRandom = (): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Divide by the maximum 32-bit unsigned integer + 1
    return array[0] / 4294967296;
};

/**
 * Generates a cryptographically secure random alphanumeric string of a given length.
 */
export const secureRandomString = (length: number = 6): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }

    return result;
};
