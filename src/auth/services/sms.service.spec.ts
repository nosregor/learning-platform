import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import twilio from 'twilio';

// Mock Twilio module
const mockTwilioClient = {
  messages: {
    create: jest.fn().mockResolvedValue({
      sid: 'SM1234567890abcdef',
      status: 'queued',
    }),
  },
};

const mockTwilio = jest.fn().mockReturnValue(mockTwilioClient);

jest.mock('twilio', () => ({
  __esModule: true,
  default: mockTwilio,
}));

describe('SmsService', () => {
  let service: SmsService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Reset mock before each test
    jest.clearAllMocks();
    mockTwilio.mockReturnValue(mockTwilioClient);

    // Create mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          TWILIO_ACCOUNT_SID: 'AC1234567890abcdef',
          TWILIO_AUTH_TOKEN: 'test_auth_token',
          TWILIO_PHONE_NUMBER: '+1234567890',
        };
        return config[key] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Twilio client when credentials are provided', () => {
      const getSpy = jest.spyOn(mockConfigService, 'get');
      service.onModuleInit();

      expect(getSpy).toHaveBeenCalledWith('TWILIO_ACCOUNT_SID');
      expect(getSpy).toHaveBeenCalledWith('TWILIO_AUTH_TOKEN');
      expect(mockTwilio).toHaveBeenCalledWith('AC1234567890abcdef', 'test_auth_token');
      expect(service['twilioClient']).toBe(mockTwilioClient);
    });

    it('should not initialize when TWILIO_ACCOUNT_SID is not set', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_ACCOUNT_SID') {
          return undefined;
        }
        return 'test_value';
      });

      // Create a new service instance with updated config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const newService = module.get<SmsService>(SmsService);
      newService.onModuleInit();

      expect(mockTwilio).not.toHaveBeenCalled();
      expect(newService['twilioClient']).toBeNull();
    });

    it('should not initialize when credentials are missing', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'TWILIO_ACCOUNT_SID') {
          return 'AC1234567890abcdef';
        }
        if (key === 'TWILIO_AUTH_TOKEN') {
          return undefined;
        }
        return 'test_value';
      });

      // Create a new service instance with updated config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const newService = module.get<SmsService>(SmsService);
      newService.onModuleInit();

      expect(mockTwilio).not.toHaveBeenCalled();
      expect(newService['twilioClient']).toBeNull();
    });

    it('should handle errors during Twilio client initialization', () => {
      const error = new Error('Twilio initialization failed');
      mockTwilio.mockImplementation(() => {
        throw error;
      });

      // Should not throw
      expect(() => service.onModuleInit()).not.toThrow();
    });
  });

  describe('sendVerificationCode', () => {
    beforeEach(() => {
      // Reset mock to default success behavior
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM1234567890abcdef',
        status: 'queued',
      });
      // Inject mock Twilio client for testing
      service['twilioClient'] = mockTwilioClient as unknown as twilio.Twilio;
    });

    it('should send verification code successfully', async () => {
      const mobileNumber = '+15555551234';
      const code = '123456';

      await service.sendVerificationCode(mobileNumber, code);

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        body: 'Your MusicMaster verification code is: 123456. This code expires in 5 minutes.',
        from: '+1234567890',
        to: mobileNumber,
      });
    });

    it('should log message SID when SMS is sent successfully', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      const mobileNumber = '+15555551234';
      const code = '123456';

      await service.sendVerificationCode(mobileNumber, code);

      expect(loggerSpy).toHaveBeenCalledWith(
        `SMS sent to ${mobileNumber}. Message SID: SM1234567890abcdef`,
      );
    });

    it('should return early when service is disabled', async () => {
      // Create a disabled service instance
      const disabledConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'TWILIO_ACCOUNT_SID') {
            return undefined; // This makes isEnabled = false
          }
          return 'test_value';
        }),
      } as unknown as jest.Mocked<ConfigService>;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: disabledConfigService,
          },
        ],
      }).compile();

      const disabledService = module.get<SmsService>(SmsService);
      const loggerSpy = jest.spyOn(disabledService['logger'], 'warn');
      const mobileNumber = '+15555551234';
      const code = '123456';

      await disabledService.sendVerificationCode(mobileNumber, code);

      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `SMS service disabled. Would send code ${code} to ${mobileNumber}`,
      );
    });

    it('should throw error when TWILIO_PHONE_NUMBER is not configured', async () => {
      // Create a service instance without phone number
      const noPhoneConfigService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'TWILIO_PHONE_NUMBER') {
            return defaultValue ?? '';
          }
          const config: Record<string, unknown> = {
            TWILIO_ACCOUNT_SID: 'AC1234567890abcdef',
            TWILIO_AUTH_TOKEN: 'test_auth_token',
          };
          return config[key] ?? defaultValue;
        }),
      } as unknown as jest.Mocked<ConfigService>;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: noPhoneConfigService,
          },
        ],
      }).compile();

      const noPhoneService = module.get<SmsService>(SmsService);
      noPhoneService['twilioClient'] = mockTwilioClient as unknown as twilio.Twilio;

      await expect(noPhoneService.sendVerificationCode('+15555551234', '123456')).rejects.toThrow(
        'TWILIO_PHONE_NUMBER is not configured',
      );
    });

    it('should throw error when Twilio API call fails', async () => {
      const error = new Error('Twilio API error');
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(service.sendVerificationCode('+15555551234', '123456')).rejects.toThrow(
        'Failed to send verification code: Twilio API error',
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      const error = 'String error';
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(service.sendVerificationCode('+15555551234', '123456')).rejects.toThrow(
        'Failed to send verification code: Unknown error',
      );
    });
  });

  describe('sendPasswordChangeCode', () => {
    beforeEach(() => {
      // Reset mock to default success behavior
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'SM1234567890abcdef',
        status: 'queued',
      });
      // Inject mock Twilio client for testing
      service['twilioClient'] = mockTwilioClient as unknown as twilio.Twilio;
    });

    it('should send password change code successfully', async () => {
      const mobileNumber = '+15555551234';
      const code = '654321';

      await service.sendPasswordChangeCode(mobileNumber, code);

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        body: 'Your MusicMaster password change code is: 654321. This code expires in 5 minutes.',
        from: '+1234567890',
        to: mobileNumber,
      });
    });

    it('should log message SID when password change SMS is sent successfully', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'log');
      const mobileNumber = '+15555551234';
      const code = '654321';

      await service.sendPasswordChangeCode(mobileNumber, code);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Password change SMS sent to ${mobileNumber}. Message SID: SM1234567890abcdef`,
      );
    });

    it('should return early when service is disabled', async () => {
      // Create a disabled service instance
      const disabledConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'TWILIO_ACCOUNT_SID') {
            return undefined; // This makes isEnabled = false
          }
          return 'test_value';
        }),
      } as unknown as jest.Mocked<ConfigService>;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: disabledConfigService,
          },
        ],
      }).compile();

      const disabledService = module.get<SmsService>(SmsService);
      const loggerSpy = jest.spyOn(disabledService['logger'], 'warn');
      const mobileNumber = '+15555551234';
      const code = '654321';

      await disabledService.sendPasswordChangeCode(mobileNumber, code);

      expect(mockTwilioClient.messages.create).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `SMS service disabled. Would send password change code ${code} to ${mobileNumber}`,
      );
    });

    it('should throw error when TWILIO_PHONE_NUMBER is not configured', async () => {
      // Create a service instance without phone number
      const noPhoneConfigService = {
        get: jest.fn((key: string, defaultValue?: unknown) => {
          if (key === 'TWILIO_PHONE_NUMBER') {
            return defaultValue ?? '';
          }
          const config: Record<string, unknown> = {
            TWILIO_ACCOUNT_SID: 'AC1234567890abcdef',
            TWILIO_AUTH_TOKEN: 'test_auth_token',
          };
          return config[key] ?? defaultValue;
        }),
      } as unknown as jest.Mocked<ConfigService>;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SmsService,
          {
            provide: ConfigService,
            useValue: noPhoneConfigService,
          },
        ],
      }).compile();

      const noPhoneService = module.get<SmsService>(SmsService);
      noPhoneService['twilioClient'] = mockTwilioClient as unknown as twilio.Twilio;

      await expect(noPhoneService.sendPasswordChangeCode('+15555551234', '654321')).rejects.toThrow(
        'TWILIO_PHONE_NUMBER is not configured',
      );
    });

    it('should throw error when Twilio API call fails', async () => {
      const error = new Error('Twilio API error');
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(service.sendPasswordChangeCode('+15555551234', '654321')).rejects.toThrow(
        'Failed to send password change code: Twilio API error',
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      const error = 'String error';
      mockTwilioClient.messages.create.mockRejectedValue(error);

      await expect(service.sendPasswordChangeCode('+15555551234', '654321')).rejects.toThrow(
        'Failed to send password change code: Unknown error',
      );
    });
  });
});
