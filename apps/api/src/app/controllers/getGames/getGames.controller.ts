import { Query, Get, Param } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GET_GAMES_CONTROLLER_STRING, GET_GAMES_LAST_STRING } from '@nx-bridge/constants';
import { ControllerResponse, GameRelevant } from '@nx-bridge/interfaces-and-types';
import { GetGamesService } from './getGames.service';
import { USER_ID_STRING } from '@nx-bridge/constants';


@Controller(GET_GAMES_CONTROLLER_STRING)
export class GetGamesController {
  constructor(private readonly getGamesService: GetGamesService) {}

  @Get()
  async getGames(
    @Query(USER_ID_STRING) userId: string,
    @Query(GET_GAMES_LAST_STRING) lastGamesToGet: string,
  ): ControllerResponse<GameRelevant> {
    return await this.getGamesService.getGames(userId, lastGamesToGet);
  }

  @Get(':gameId')
  async getGame(
    @Param('gameId') gameId: string
  ): ControllerResponse<GameRelevant> {
    return await this.getGamesService.getGame(gameId);
  }
}
