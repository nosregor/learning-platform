import { Global, Module } from '@nestjs/common';

/**
 * CommonModule provides globally available decorators, guards, filters, and utilities.
 * Marked as @Global to avoid importing in every module that needs these resources.
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class CommonModule {}
