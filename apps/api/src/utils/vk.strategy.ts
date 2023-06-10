import { AUTH, ENSURE_OAUTH_USER } from '@app/rabbit';
import {
  VK_CLIENT_ID,
  VK_CLIENT_SECRET,
  VK_REDIRECT_URI,
} from '@app/shared/constants/keys';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallBack } from 'passport-vkontakte';
import { firstValueFrom } from 'rxjs';
import * as uuid from 'uuid';

@Injectable()
export class VKStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH) client: ClientProxy, configService: ConfigService) {
    super(
      {
        clientID: configService.get<string>(VK_CLIENT_ID),
        clientSecret: configService.get<string>(VK_CLIENT_SECRET),
        callbackURL: configService.get<string>(VK_REDIRECT_URI),
        scope: ['profile', 'email'],
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallBack,
      ) {
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile);

        const user = await firstValueFrom(
          client.send(
            {
              cmd: ENSURE_OAUTH_USER,
            },
            {
              email: profile.emails[0].value,
              password: uuid.v4(),
            },
          ),
        );
        console.log('Validate');
        console.log(user);

        return done(null, user);
      },
    );
  }
}
