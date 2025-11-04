import { randomBytes, randomInt } from 'crypto';

/**
 * Generate a random 6-digit numeric code for 2FA.
 *
 * @returns 6-digit string (e.g., "123456")
 *
 * @example
 * const code = generate2FACode();
 * // Returns: "842753"
 */
export function generate2FACode(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Generate a cryptographically secure random token.
 *
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex string token
 *
 * @example
 * const token = generateSecureToken();
 * // Returns: "a3f2c8d9e1b4..."
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a random alphanumeric string.
 *
 * @param length - Length of the string (default: 16)
 * @returns Random alphanumeric string
 *
 * @example
 * const id = generateRandomString(10);
 * // Returns: "aB3xZ9kL2p"
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomInt(0, chars.length));
  }

  return result;
}
