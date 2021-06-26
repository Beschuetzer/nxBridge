import { Query, Get, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { GET_GAMES_CONTROLLER_STRING } from '@nx-bridge/constants';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetGamesService } from './getGames.service';

@Controller(GET_GAMES_CONTROLLER_STRING)
export class GetGamesController {
  constructor(private readonly getGamesService: GetGamesService) {}

  @Get()
  async getGames(
    @Query('userId') userId: string,
  ): ControllerResponse<GameModel> {
    return await this.getGamesService.getGames(userId);
  }

  @Get(":gameId")
  async getGame(
    @Param('gameId') gameId: string,
  ): ControllerResponse<GameModel> {
    return await this.getGamesService.getGame(gameId);
  }
}
