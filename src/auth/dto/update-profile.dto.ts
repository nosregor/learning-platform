import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

/**
 * UpdateProfileDto defines the request body structure for updating user profile.
 * Both name and email are optional fields - at least one must be provided.
 *
 * @example
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com"
 * }
 *
 * @example
 * {
 *   "name": "John Doe"
 * }
 *
 * @example
 * {
 *   "email": "newemail@example.com"
 * }
 */
export class UpdateProfileDto {
  /**
   * User's full name
   * Optional - must be between 2 and 100 characters if provided
   */
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  /**
   * User's email address
   * Optional - must be a valid email format if provided
   */
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;
}
