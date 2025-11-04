import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../decorators/public.decorator';

/**
 * JwtAuthGuard extends Passport's AuthGuard to add support for @Public() decorator.
 * Routes marked with @Public() will skip JWT authentication.
 *
 * This guard is applied globally via APP_GUARD in the auth module.
 *
 * @example
 * // This route requires JWT authentication (default)
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) { ... }
 *
 * @example
 * // This route is public (skips JWT check)
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if the route is marked as public before applying JWT authentication
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
