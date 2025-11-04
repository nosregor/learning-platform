import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter provides consistent error response format across the application.
 * Catches all HTTP exceptions and formats them with timestamp and path information.
 *
 * Response format:
 * {
 *   statusCode: number,
 *   message: string | string[],
 *   error: string,
 *   timestamp: string,
 *   path: string
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message || 'An error occurred',
      error:
        typeof exceptionResponse === 'string'
          ? HttpStatus[status]
          : (exceptionResponse as Record<string, unknown>).error || HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
