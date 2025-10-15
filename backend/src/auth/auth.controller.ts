import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const user = await this.authService.validateGithubUser(req.user);
    const loginData = await this.authService.login(user);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/callback?token=${loginData.accessToken}`);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    return req.user;
  }
}

