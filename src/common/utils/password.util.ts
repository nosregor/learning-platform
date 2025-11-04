import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt with a cost factor of 10.
 *
 * @param password - Plain text password to hash
 * @returns Hashed password
 *
 * @example
 * const hashedPassword = await hashPassword('mySecurePassword123!');
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password.
 *
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 *
 * @example
 * const isValid = await comparePasswords('myPassword', user.passwordHash);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
