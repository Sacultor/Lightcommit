import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../contribution/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateGithubUser(profile: any): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { githubId: profile.githubId },
    });

    if (!user) {
      user = this.userRepository.create({
        githubId: profile.githubId,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        accessToken: profile.accessToken,
      });
      await this.userRepository.save(user);
    } else {
      user.accessToken = profile.accessToken;
      user.email = profile.email || user.email;
      user.avatarUrl = profile.avatarUrl || user.avatarUrl;
      await this.userRepository.save(user);
    }

    return user;
  }

  generateJwt(user: User): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload);
  }

  async login(user: User) {
    const token = this.generateJwt(user);
    return {
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        walletAddress: user.walletAddress,
      },
    };
  }
}

