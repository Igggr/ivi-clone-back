import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../entities';

export class TokenProfileResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtuZXNwQHlhbmRleC5ydSIsImlkIjoxLCJpYXQiOjE2ODY0MDA1MDYsImV4cCI6MTY4NjQ4NjkwNn0.SSaS8mR0MCCOaj9JTmCysvRIeJYFdTfMqlENrPYKfPk',
    description: 'Токен',
  })
  token: string;

  @ApiProperty({
    example: Profile,
    description: 'Профиль пользователя',
  })
  profileInfo: Profile;
}
