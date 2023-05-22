/* eslint-disable @typescript-eslint/ban-types */
import { AUTH, FIND_GOOGLE_USER } from '@app/rabbit';
import { User } from '@app/shared';
import { FIND_USER_BY_ID } from '@app/shared/events';
import { Controller, Inject, Injectable } from '@nestjs/common';
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
    const user = await firstValueFrom(
      this.client.send(
        {
          cmd: FIND_USER_BY_ID,
        },
        payload.id,
      ),
    );
    console.log('Deserealize user');
    console.log(user);
    return user ? done(null, user) : done(null, null);
  }
}
