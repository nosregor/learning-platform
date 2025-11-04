import { Role } from '@prisma/client';

/**
 * User data response (excluding sensitive fields like passwordHash)
 */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response for successful registration
 */
export class RegisterResponseDto {
  message: string;
  user: UserResponseDto;
}

/**
 * Response for login endpoint (returns pending 2FA token)
 */
export class LoginResponseDto {
  message: string;
  pending2faToken: string;
}

/**
 * Response for 2FA verification (returns access token)
 * Note: Refresh token is sent as HTTP-only cookie, not in response body
 */
export class Verify2FAResponseDto {
  message: string;
  accessToken: string;
  user: UserResponseDto;
}

/**
 * Response for token refresh endpoint
 */
export class RefreshTokenResponseDto {
  message: string;
  accessToken: string;
}

/**
 * Response for profile endpoints
 */
export class ProfileResponseDto {
  user: UserResponseDto;
}

/**
 * Response for password change request endpoint
 */
export class RequestPasswordChangeResponseDto {
  message: string;
  passwordChangeToken: string;
}

/**
 * Generic success message response
 */
export class SuccessResponseDto {
  message: string;
}
