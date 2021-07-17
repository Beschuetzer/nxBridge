import { Query, Get, Param, Post, Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GET_DEALS_CONTROLLER_STRING, USER_ID_STRING, DEALS_STRING } from '@nx-bridge/constants';
import { ControllerResponse, DealRelevant, DealRequest, FetchedDeals } from '@nx-bridge/interfaces-and-types';
import { GetDealsService } from './getDeals.service';

@Controller(GET_DEALS_CONTROLLER_STRING)
export class GetDealsController {
  constructor(private readonly getDealsService: GetDealsService) {}

  @Get()
  async getDeals(
    @Query(USER_ID_STRING) userId: string
  ): ControllerResponse<FetchedDeals> {
    return await this.getDealsService.getDeals(userId);
  }

  @Get(':dealId')
  async getDeal(
    @Param('dealId') dealId: string
  ): ControllerResponse<DealRelevant> {
    return await this.getDealsService.getDeal(dealId);
  }

  @Post()
  async getDealsInfo(
    @Body(DEALS_STRING) requestedDeals: DealRequest
  ): ControllerResponse<FetchedDeals> {
    console.log('deals------------------------------------------------');
    return await this.getDealsService.getDealsInfo(requestedDeals);
  }
}
