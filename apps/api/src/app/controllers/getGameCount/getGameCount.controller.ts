import { Query, Get } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GET_GAME_COUNT_CONTROLLER_STRING } from '@nx-bridge/constants';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetGameCountService } from './getGameCount.service';

@Controller(GET_GAME_COUNT_CONTROLLER_STRING)
export class GetGameCountController {
  constructor(private readonly getGameCountService: GetGameCountService) {}

  @Get()
  async getGameCount(
    @Query('userId') userId: string,
  ): ControllerResponse<number> {
    return await this.getGameCountService.getGameCount(userId);
  }

}
