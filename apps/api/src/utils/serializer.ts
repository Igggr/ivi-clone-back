/* eslint-disable @typescript-eslint/ban-types */
import { AUTH, FIND_GOOGLE_USER } from '@app/rabbit';
import { User } from '@app/shared';
import { Controller, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportSerializer } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller()
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(@Inject(AUTH) private client: ClientProxy) {
    super();
  }

  async serializeUser(user: User, done: Function) {
    console.log('Serialize');
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await firstValueFrom(
      this.client.send(
        {
          cmd: FIND_GOOGLE_USER,
        },
        payload.id,
      ),
    );
    console.log('Deserealize user');
    console.log(user);
    return user ? done(null, user) : done(null, null);
  }
}
