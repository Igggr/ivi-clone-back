import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path } = request;
    this.logger.log(
      `${method} ${path} ${userAgent} ${ip}: ${context.getClass().name} ${
        context.getHandler().name
      } invoked...`,
    );
    this.logger.debug(request.user);

    const now = Date.now();
    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(
          `${method} ${path} ${response.statusCode} ${response.get(
            'content-length',
          )} - ${userAgent} ${ip}: ${Date.now() - now}ms`,
        );
        this.logger.debug(`Response: ${res}`);
      }),
    );
  }
}
