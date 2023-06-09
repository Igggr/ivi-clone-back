import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallBack } from 'passport-vkontakte';
import * as uuid from 'uuid';

@Injectable()
export class VKStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(
      {
        clientID: process.env.VK_CLIENT_ID,
        clientSecret: process.env.VK_CLIENT_SECRET,
        callbackURL: process.env.VK_REDIRECT_URI,
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

        return done(null, {
          email: profile.emails[0].value,
          password: uuid.v4(),
        });
      },
    );
  }
}
