import { VALIDATE_GOOGLE_USER } from '@app/shared';
import { CreateGoogleUserDetailsDto } from '@app/shared/dto/create-google-user-details.dto';
import { Controller, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Controller()
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('AUTH') private authService: ClientProxy) {
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
    const details = new CreateGoogleUserDetailsDto(
      profile.emails[0].value,
      profile.displayName,
    );
    console.log(details);
    const user = await this.authService.send(
      {
        cmd: VALIDATE_GOOGLE_USER,
      },
      details,
    );
    return user || null;
  }
}
