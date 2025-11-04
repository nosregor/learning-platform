import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/**
 * ChangePasswordDto defines the request body structure for password change.
 * Validates the password change token, verification code, and new password.
 *
 * @example
 * {
 *   "passwordChangeToken": "abc123def456...",
 *   "code": "654321",
 *   "newPassword": "NewSecurePass123"
 * }
 */
export class ChangePasswordDto {
  /**
   * Password change token received from the request-password-change endpoint
   * This token is used to identify the pending password change session
   */
  @IsString()
  @IsNotEmpty({ message: 'Password change token is required' })
  passwordChangeToken: string;

  /**
   * 6-digit verification code sent via SMS
   * Must be exactly 6 digits
   */
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  code: string;

  /**
   * New password
   * Must be at least 8 characters long
   * Must contain at least one uppercase letter, one lowercase letter, and one number
   */
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}
