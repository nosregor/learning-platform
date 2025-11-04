import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * CommonModule provides globally available decorators, guards, filters, and utilities.
 * Marked as @Global to avoid importing in every module that needs these resources.
 *
 * Guards are exported to be used as APP_GUARD in auth module or manually in controllers.
 */
@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class CommonModule {}
