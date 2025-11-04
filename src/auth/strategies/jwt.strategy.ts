import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';

/**
 * JWT payload structure expected in access tokens
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * JWT Strategy for Passport to validate JWT tokens and attach user to request.
 * Extracts token from Authorization header (Bearer token) and validates it.
 * Fetches user from database and attaches to request object.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Validate JWT payload and return user object to attach to request
   *
   * @param payload - Decoded JWT payload
   * @returns User object (will be attached to request.user)
   * @throws UnauthorizedException if user not found or invalid
   */
  async validate(payload: JwtPayload): Promise<User> {
    const userId = payload.sub;

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash from returned user
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user without passwordHash (already excluded via select)
    return user as User;
  }
}
