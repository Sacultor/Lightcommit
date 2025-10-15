import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('nodeEnv'),
    };
  }

  @Get('version')
  version() {
    return {
      version: '1.0.0',
      name: 'LightCommit Backend',
    };
  }
}

