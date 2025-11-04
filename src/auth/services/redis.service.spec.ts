import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let mockRedis: {
    setex: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
    ttl: jest.Mock;
    on: jest.Mock;
    quit: jest.Mock;
  };
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock Redis instance
    mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      ttl: jest.fn().mockResolvedValue(300),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    };

    // Create mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          REDIS_HOST: 'localhost',
          REDIS_PORT: 6379,
          REDIS_PASSWORD: undefined,
        };
        return config[key] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    // Inject mock Redis instance for testing
    service['redis'] = mockRedis as unknown as Redis;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from Redis', async () => {
      await service.onModuleDestroy();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe('store2FACode', () => {
    it('should store 2FA code with correct key and TTL', async () => {
      const userId = 'user-123';
      const code = '123456';

      await service.store2FACode(userId, code);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        '2fa:user-123',
        300,
        JSON.stringify({ code: '123456', attempts: 0 }),
      );
    });
  });

  describe('verify2FACode', () => {
    it('should return true when code matches', async () => {
      const userId = 'user-123';
      const code = '123456';
      const storedData = JSON.stringify({ code: '123456', attempts: 0 });

      mockRedis.get.mockResolvedValue(storedData);

      const result = await service.verify2FACode(userId, code);

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('2fa:user-123');
    });

    it('should return false when code does not match', async () => {
      const userId = 'user-123';
      const wrongCode = '654321';
      const storedData = JSON.stringify({ code: '123456', attempts: 0 });

      mockRedis.get.mockResolvedValue(storedData);
      mockRedis.ttl.mockResolvedValue(250);

      const result = await service.verify2FACode(userId, wrongCode);

      expect(result).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalledWith(
        '2fa:user-123',
        250,
        JSON.stringify({ code: '123456', attempts: 1 }),
      );
    });

    it('should return false when code does not exist', async () => {
      const userId = 'user-123';
      const code = '123456';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.verify2FACode(userId, code);

      expect(result).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should delete code after max attempts exceeded', async () => {
      const userId = 'user-123';
      const code = 'wrong-code';
      const storedData = JSON.stringify({ code: '123456', attempts: 2 });

      mockRedis.get.mockResolvedValue(storedData);
      mockRedis.ttl.mockResolvedValue(200);

      const result = await service.verify2FACode(userId, code);

      expect(result).toBe(false);
      expect(mockRedis.del).toHaveBeenCalledWith('2fa:user-123');
    });
  });

  describe('get2FARemainingAttempts', () => {
    it('should return remaining attempts when code exists', async () => {
      const userId = 'user-123';
      const storedData = JSON.stringify({ code: '123456', attempts: 1 });

      mockRedis.get.mockResolvedValue(storedData);

      const result = await service.get2FARemainingAttempts(userId);

      expect(result).toBe(2); // 3 max attempts - 1 used = 2 remaining
    });

    it('should return 0 when code does not exist', async () => {
      const userId = 'user-123';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.get2FARemainingAttempts(userId);

      expect(result).toBe(0);
    });
  });

  describe('storePasswordChangeCode', () => {
    it('should store password change code with correct key and TTL', async () => {
      const userId = 'user-123';
      const code = '654321';

      await service.storePasswordChangeCode(userId, code);

      expect(mockRedis.setex).toHaveBeenCalledWith('pwd-change:user-123', 300, '654321');
    });
  });

  describe('verifyPasswordChangeCode', () => {
    it('should return true when code matches', async () => {
      const userId = 'user-123';
      const code = '654321';

      mockRedis.get.mockResolvedValue('654321');

      const result = await service.verifyPasswordChangeCode(userId, code);

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('pwd-change:user-123');
    });

    it('should return false when code does not match', async () => {
      const userId = 'user-123';
      const wrongCode = '123456';
      const storedCode = '654321';

      mockRedis.get.mockResolvedValue(storedCode);

      const result = await service.verifyPasswordChangeCode(userId, wrongCode);

      expect(result).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should return false when code does not exist', async () => {
      const userId = 'user-123';
      const code = '654321';

      mockRedis.get.mockResolvedValue(null);

      const result = await service.verifyPasswordChangeCode(userId, code);

      expect(result).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('delete2FACode', () => {
    it('should delete 2FA code', async () => {
      const userId = 'user-123';

      await service.delete2FACode(userId);

      expect(mockRedis.del).toHaveBeenCalledWith('2fa:user-123');
    });
  });

  describe('deletePasswordChangeCode', () => {
    it('should delete password change code', async () => {
      const userId = 'user-123';

      await service.deletePasswordChangeCode(userId);

      expect(mockRedis.del).toHaveBeenCalledWith('pwd-change:user-123');
    });
  });
});
