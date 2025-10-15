import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('github.clientId'),
      clientSecret: configService.get('github.clientSecret'),
      callbackURL: configService.get('github.callbackUrl'),
      scope: ['user:email', 'repo'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value,
      avatarUrl: profile.photos?.[0]?.value,
      accessToken,
    };
  }
}

