import { AUTH, ENSURE_OAUTH_USER } from '@app/rabbit';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '@app/shared/constants/keys';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { firstValueFrom } from 'rxjs';
import * as uuid from 'uuid';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH) private client: ClientProxy,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>(GOOGLE_CLIENT_ID),
      clientSecret: configService.get<string>(GOOGLE_CLIENT_SECRET),
      callbackURL: configService.get<string>(GOOGLE_REDIRECT_URI),
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    const user = await firstValueFrom(
      this.client.send(
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

    return user || null;
  }
}
