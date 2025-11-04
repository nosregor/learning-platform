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
    expect(service.$connect).toBeDefined();
    expect(service.$disconnect).toBeDefined();
    expect(service.$queryRaw).toBeDefined();
    expect(service.$executeRawUnsafe).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should have onModuleInit method', () => {
      expect(service.onModuleInit).toBeDefined();
      expect(typeof service.onModuleInit).toBe('function');
    });
  });

  describe('onModuleDestroy', () => {
    it('should have onModuleDestroy method', () => {
      expect(service.onModuleDestroy).toBeDefined();
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
      expect(service.cleanDatabase).toBeDefined();
      expect(typeof service.cleanDatabase).toBe('function');
    });
  });
});
