import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

/**
 * SmsService handles sending SMS messages via Twilio for 2FA and password change verification.
 * Uses Twilio SDK to send SMS messages to user mobile numbers.
 */
@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio | null = null;
  private readonly fromPhoneNumber: string;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.fromPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');
    this.isEnabled = this.configService.get<string>('TWILIO_ACCOUNT_SID') !== undefined;
  }

  /**
   * Initialize Twilio client on module init
   */
  onModuleInit(): void {
    if (!this.isEnabled) {
      this.logger.warn('Twilio SMS service is disabled (TWILIO_ACCOUNT_SID not set)');
      return;
    }

    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured. SMS service will be disabled.');
      return;
    }

    try {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio SMS service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client', error);
    }
  }

  /**
   * Send a verification code via SMS
   *
   * @param mobileNumber - Recipient mobile number in E.164 format (e.g., +15555551234)
   * @param code - 6-digit verification code to send
   * @returns Promise that resolves when SMS is sent
   * @throws Error if SMS fails to send
   *
   * @example
   * await smsService.sendVerificationCode('+15555551234', '123456');
   */
  async sendVerificationCode(mobileNumber: string, code: string): Promise<void> {
    if (!this.isEnabled || !this.twilioClient) {
      this.logger.warn(`SMS service disabled. Would send code ${code} to ${mobileNumber}`);
      return;
    }

    if (!this.fromPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured');
    }

    const message = `Your MusicMaster verification code is: ${code}. This code expires in 5 minutes.`;

    try {
      const messageResponse = await this.twilioClient.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: mobileNumber,
      });

      this.logger.log(`SMS sent to ${mobileNumber}. Message SID: ${messageResponse.sid}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${mobileNumber}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error(
        `Failed to send verification code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send a password change verification code via SMS
   *
   * @param mobileNumber - Recipient mobile number in E.164 format
   * @param code - 6-digit verification code to send
   * @returns Promise that resolves when SMS is sent
   * @throws Error if SMS fails to send
   *
   * @example
   * await smsService.sendPasswordChangeCode('+15555551234', '654321');
   */
  async sendPasswordChangeCode(mobileNumber: string, code: string): Promise<void> {
    if (!this.isEnabled || !this.twilioClient) {
      this.logger.warn(
        `SMS service disabled. Would send password change code ${code} to ${mobileNumber}`,
      );
      return;
    }

    if (!this.fromPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not configured');
    }

    const message = `Your MusicMaster password change code is: ${code}. This code expires in 5 minutes.`;

    try {
      const messageResponse = await this.twilioClient.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: mobileNumber,
      });

      this.logger.log(
        `Password change SMS sent to ${mobileNumber}. Message SID: ${messageResponse.sid}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password change SMS to ${mobileNumber}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error(
        `Failed to send password change code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
