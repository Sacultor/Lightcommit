import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContributionService } from './contribution.service';
import { QueryContributionDto } from './dto/query-contribution.dto';

@Controller('contributions')
export class ContributionController {
  constructor(private contributionService: ContributionService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: QueryContributionDto) {
    return this.contributionService.findAll(query);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Query('userId') userId?: string) {
    return this.contributionService.getStats(userId);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyContributions(@Req() req) {
    return this.contributionService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return this.contributionService.findOne(id);
  }
}

