import { Query, Get, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetDealsService } from './getDeals.service';

@Controller('getDeals')
export class GetDealsController {
  constructor(private readonly getDealsService: GetDealsService) {}

  @Get()
  async getDeals(
    @Query('userId') userId: string,
  ): ControllerResponse<DealModel> {
    console.log('userId =', userId);
    return await this.getDealsService.getDeals(userId);
  }

  @Get(':dealId')
  async getDeal(
    @Param('dealId') dealId: string,
  ): ControllerResponse<DealModel> {
    return await this.getDealsService.getDeal(dealId);
  }
}
