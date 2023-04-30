import { GET_USER_BY_EMAIL } from '@app/shared';
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
      const user = this.jwtService.verify(token);
      const response = await firstValueFrom(
        this.authService.send(
          {
            cmd: GET_USER_BY_EMAIL,
          },
          user.email,
        ),
      );
      req.user = response;
      next();
    }
  }
}
