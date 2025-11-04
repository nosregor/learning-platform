import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { RequestWithUser } from '../decorators/current-user.decorator';

/**
 * RolesGuard checks if the authenticated user has the required role(s) to access a route.
 * Must be used after JwtAuthGuard to ensure user is authenticated.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @Get('users')
 * findAllUsers() { ... }
 *
 * @example
 * @Roles(Role.TEACHER, Role.ADMIN)
 * @Post('lessons')
 * createLesson() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // User should exist if JwtAuthGuard ran first
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has at least one of the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
