import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface TwoFACodeData {
  code: string;
  attempts: number;
}

/**
 * RedisService handles Redis operations for 2FA codes and password change verification.
 * Uses ioredis for Redis connection and manages TTL automatically.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private readonly TWO_FA_TTL = 300; // 5 minutes in seconds
  private readonly PASSWORD_CHANGE_TTL = 300; // 5 minutes in seconds
  private readonly MAX_ATTEMPTS = 3;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Redis connection on module init
   */
  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redis.on('connect', () => {
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    });

    this.redis.on('error', error => {
      this.logger.error('Redis connection error', error);
    });
  }

  /**
   * Close Redis connection on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Disconnected from Redis');
    }
  }

  /**
   * Store a 2FA code for a user with TTL and attempt tracking
   *
   * @param userId - User ID
   * @param code - 6-digit verification code
   * @returns Promise that resolves when code is stored
   */
  async store2FACode(userId: string, code: string): Promise<void> {
    const key = `2fa:${userId}`;
    const data: TwoFACodeData = {
      code,
      attempts: 0,
    };

    await this.redis.setex(key, this.TWO_FA_TTL, JSON.stringify(data));
    this.logger.debug(`Stored 2FA code for user ${userId}`);
  }

  /**
   * Verify and retrieve a 2FA code, incrementing attempt count
   *
   * @param userId - User ID
   * @param code - Verification code to check
   * @returns True if code is valid and within attempt limit, false otherwise
   */
  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const key = `2fa:${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return false;
    }

    const codeData = JSON.parse(data) as TwoFACodeData;

    // Check if code matches
    if (codeData.code !== code) {
      // Increment attempts
      codeData.attempts += 1;

      // If max attempts exceeded, delete the code
      if (codeData.attempts >= this.MAX_ATTEMPTS) {
        await this.redis.del(key);
        this.logger.warn(`2FA code for user ${userId} exceeded max attempts`);
        return false;
      }

      // Update attempts count
      const remainingTTL = await this.redis.ttl(key);
      if (remainingTTL > 0) {
        await this.redis.setex(key, remainingTTL, JSON.stringify(codeData));
      }

      return false;
    }

    // Code is valid, delete it
    await this.redis.del(key);
    this.logger.debug(`2FA code verified for user ${userId}`);
    return true;
  }

  /**
   * Get remaining attempts for a 2FA code
   *
   * @param userId - User ID
   * @returns Number of remaining attempts, or 0 if code doesn't exist
   */
  async get2FARemainingAttempts(userId: string): Promise<number> {
    const key = `2fa:${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return 0;
    }

    const codeData = JSON.parse(data) as TwoFACodeData;
    return this.MAX_ATTEMPTS - codeData.attempts;
  }

  /**
   * Store a password change verification code
   *
   * @param userId - User ID
   * @param code - 6-digit verification code
   * @returns Promise that resolves when code is stored
   */
  async storePasswordChangeCode(userId: string, code: string): Promise<void> {
    const key = `pwd-change:${userId}`;
    await this.redis.setex(key, this.PASSWORD_CHANGE_TTL, code);
    this.logger.debug(`Stored password change code for user ${userId}`);
  }

  /**
   * Verify a password change code
   *
   * @param userId - User ID
   * @param code - Verification code to check
   * @returns True if code is valid, false otherwise
   */
  async verifyPasswordChangeCode(userId: string, code: string): Promise<boolean> {
    const key = `pwd-change:${userId}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode || storedCode !== code) {
      return false;
    }

    // Code is valid, delete it
    await this.redis.del(key);
    this.logger.debug(`Password change code verified for user ${userId}`);
    return true;
  }

  /**
   * Delete a 2FA code (useful for cleanup or manual invalidation)
   *
   * @param userId - User ID
   */
  async delete2FACode(userId: string): Promise<void> {
    const key = `2fa:${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Deleted 2FA code for user ${userId}`);
  }

  /**
   * Delete a password change code (useful for cleanup)
   *
   * @param userId - User ID
   */
  async deletePasswordChangeCode(userId: string): Promise<void> {
    const key = `pwd-change:${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Deleted password change code for user ${userId}`);
  }
}
