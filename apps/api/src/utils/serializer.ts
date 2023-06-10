/* eslint-disable @typescript-eslint/ban-types */
import { AUTH, GET_USER_BY_EMAIL } from '@app/rabbit';
import { User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportSerializer } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

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
    console.log(payload);
    console.log('deserealize');
    const user = await firstValueFrom(
      this.client.send(
        {
          cmd: GET_USER_BY_EMAIL,
        },
        payload.email,
      ),
    );
    console.log('Deserealize user');
    console.log(user);
    return user ? done(null, user) : done(null, null);
  }
}
