import { Reflector } from '@nestjs/core';

/**
 * Public decorator to mark routes as publicly accessible (skip JWT authentication).
 * Uses Reflector.createDecorator for type-safe metadata management.
 *
 * @example
 * @Public()
 * @Post('register')
 * register(@Body() dto: RegisterDto) { ... }
 *
 * @example
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 */
export const Public = Reflector.createDecorator<boolean>();
