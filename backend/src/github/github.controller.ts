import { Controller, Post, Headers, Body, BadRequestException } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    const isValid = this.githubService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    await this.githubService.handleWebhook(event, payload);

    return { success: true };
  }
}

