import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * LoginDto defines the request body structure for user login.
 * Validates email and password fields.
 *
 * @example
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass123"
 * }
 */
export class LoginDto {
  /**
   * User's email address
   * Must be a valid email format
   */
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's password
   * Must not be empty
   */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
