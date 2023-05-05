import { VERIFY_TOKEN } from '@app/shared';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    @Inject('AUTH') private authService: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async use(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
      next();
      return;
    }

    const [bearer, token] = auth.split(' ');
    if (bearer === 'Bearer' && token) {
      const response = await firstValueFrom(
        this.authService.send(
          {
            cmd: VERIFY_TOKEN,
          },
          token,
        ),
      );
      if (response.status != 'error') {
        req.user = response;
      }
      next();
    }
  }
}
