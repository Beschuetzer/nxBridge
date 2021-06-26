import {
  GameSchema,
  DealSchema,
  UserSchema,
} from '@nx-bridge/api-mongoose-models';

import { Module } from '@nestjs/common';
import { GetUserController } from './getUser/getUser.controller';
import { GetUsersController } from './getUsers/getUsers.controller';
import { GetGamesController } from './getGames/getGames.controller';
import { GetGameCountController } from './getGameCount/getGameCount.controller';
import { GetUserService } from './getUser/getUser.service';
import { GetUsersService } from './getUsers/getUsers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GetGamesService } from './getGames/getGames.service';
import { GetDealsController } from './getDeals/getDeals.controller';
import { GetDealsService } from './getDeals/getDeals.service';
import { GetGameCountService } from './getGameCount/getGameCount.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Game', schema: GameSchema },
      { name: 'Deal', schema: DealSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [
    GetUserController,
    GetUsersController,
    GetGamesController,
    GetDealsController,
    GetGameCountController,
  ],
  providers: [
    GetUserService,
    GetUsersService,
    GetGamesService,
    GetDealsService,
    GetGameCountService,
  ],
})
export class ControllersModule {}
