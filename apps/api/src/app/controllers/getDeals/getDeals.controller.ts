import { Query, Get, Param, Post, Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { DealModel } from '@nx-bridge/api-mongoose-models';
import { GET_DEALS_CONTROLLER_STRING, USER_ID_STRING, DEALS_STRING } from '@nx-bridge/constants';
import { ControllerResponse, DealCore } from '@nx-bridge/interfaces-and-types';
import { GetDealsService } from './getDeals.service';

@Controller(GET_DEALS_CONTROLLER_STRING)
export class GetDealsController {
  constructor(private readonly getDealsService: GetDealsService) {}

  @Get()
  async getDeals(
    @Query(USER_ID_STRING) userId: string
  ): ControllerResponse<DealCore> {
    return await this.getDealsService.getDeals(userId);
  }

  @Get(':dealId')
  async getDeal(
    @Param('dealId') dealId: string
  ): ControllerResponse<DealCore> {
    return await this.getDealsService.getDeal(dealId);
  }

  @Post()
  async getDealsInfo(
    @Body(DEALS_STRING) deals: string[]
  ): ControllerResponse<DealCore> {
    console.log('deals------------------------------------------------');
    return await this.getDealsService.getDealsInfo(deals);
  }
}
