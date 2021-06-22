import { Query, Get } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetGamesService } from './getGames.service';

@Controller('getGames')
export class GetGamesController {
  constructor(private readonly getGamesService: GetGamesService) {}

  @Get()
  getData(
    @Query('id') name: string,
  ): ControllerResponse {
    return {message: "Error", status: 404};
  }
}
