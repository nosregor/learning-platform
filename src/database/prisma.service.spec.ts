import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$disconnect).toBe('function');
    expect(typeof service.$queryRaw).toBe('function');
    expect(typeof service.$executeRawUnsafe).toBe('function');
  });

  describe('onModuleInit', () => {
    it('should have onModuleInit method', () => {
      expect(typeof service.onModuleInit).toBe('function');
    });
  });

  describe('onModuleDestroy', () => {
    it('should have onModuleDestroy method', () => {
      expect(typeof service.onModuleDestroy).toBe('function');
    });
  });

  describe('cleanDatabase', () => {
    it('should throw error in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await expect(service.cleanDatabase()).rejects.toThrow(
        'Cannot clean database in production environment',
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should have cleanDatabase method', () => {
      expect(typeof service.cleanDatabase).toBe('function');
    });
  });
});
