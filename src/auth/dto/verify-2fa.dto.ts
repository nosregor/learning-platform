import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/**
 * Verify2FADto defines the request body structure for 2FA verification.
 * Validates the pending 2FA token and the 6-digit verification code.
 *
 * @example
 * {
 *   "pending2faToken": "abc123def456...",
 *   "code": "123456"
 * }
 */
export class Verify2FADto {
  /**
   * Pending 2FA token received from the login endpoint
   * This token is used to identify the pending authentication session
   */
  @IsString()
  @IsNotEmpty({ message: 'Pending 2FA token is required' })
  pending2faToken: string;

  /**
   * 6-digit verification code sent via SMS
   * Must be exactly 6 digits
   */
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  code: string;
}
