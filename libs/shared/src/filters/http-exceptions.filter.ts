import {
  ExceptionFilter,
  HttpException,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationException } from '../exceptions/validation-exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error:
        exception instanceof ValidationException
          ? exception.messages
          : exception.message,
    });
  }
}
