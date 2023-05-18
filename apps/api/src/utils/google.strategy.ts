import { AUTH, ENSURE_GOOGLE_USER } from '@app/rabbit';
import { Controller, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { firstValueFrom } from 'rxjs';

@Controller()
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH) private client: ClientProxy) {
    super({
      clientID:
        '400170446302-o1sbhhvbe9utelobo8bvrp7teal2udgv.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/redirect',
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
          cmd: ENSURE_GOOGLE_USER,
        },
        {
          email: profile.emails[0].value,
          displayName: profile.displayName,
        },
      ),
    );
    console.log('Validate');
    console.log(user);

    return user || null;
  }
}
