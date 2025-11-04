import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/**
 * RegisterDto defines the request body structure for user registration.
 * All fields are validated using class-validator decorators.
 *
 * @example
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "mobileNumber": "+15555551234",
 *   "password": "SecurePass123"
 * }
 */
export class RegisterDto {
  /**
   * User's full name
   * Must be between 2 and 100 characters
   */
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  /**
   * User's email address
   * Must be a valid email format
   */
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's mobile number in E.164 format
   * Must start with + followed by country code and number
   * Example: +15555551234
   */
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number must be in E.164 format (e.g., +15555551234)',
  })
  mobileNumber: string;

  /**
   * User's password
   * Must be at least 8 characters long
   * Must contain at least one uppercase letter, one lowercase letter, and one number
   */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}
