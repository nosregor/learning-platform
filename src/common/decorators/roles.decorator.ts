import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

/**
 * Roles decorator to restrict access to endpoints based on user roles.
 * Uses Reflector.createDecorator for type-safe metadata management.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @Get('users')
 * findAll() { ... }
 *
 * @example
 * @Roles(Role.TEACHER, Role.ADMIN)
 * @Post('lessons')
 * createLesson() { ... }
 */
export const Roles = Reflector.createDecorator<Role[]>();
