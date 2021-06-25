import { Query, Get, Param, Post, Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse, Deal } from '@nx-bridge/interfaces-and-types';
import { GetDealsService } from './getDeals.service';

@Controller('getDeals')
export class GetDealsController {
  constructor(private readonly getDealsService: GetDealsService) {}

  @Get()
  async getDeals(
    @Query('userId') userId: string,
  ): ControllerResponse<DealModel> {
    return await this.getDealsService.getDeals(userId);
  }

  @Get(':dealId')
  async getDeal(
    @Param('dealId') dealId: string,
  ): ControllerResponse<DealModel> {
    return await this.getDealsService.getDeal(dealId);
  }

  @Post()
  async getDealsInfo(
    @Body('deals') deals: string[],
  ) {
    console.log('deals =', deals);
  }
}
