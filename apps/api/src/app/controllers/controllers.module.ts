import {
  GameSchema,
  DealSchema,
  UserSchema,
} from '@nx-bridge/api-mongoose-models';

import { Module } from '@nestjs/common';
import { GetUserController } from './getUser/getUser.controller';
import { GetGamesController } from './getGames/getGames.controller';
import { GetUserService } from './getUser/getUser.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GetGamesService } from './getGames/getGames.service';
import { GetDealsController } from './getDeals/getDeals.controller';
import { GetDealsService } from './getDeals/getDeals.service';

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
    GetGamesController,
    GetDealsController,
  ],
  providers: [
    GetUserService,
    GetGamesService,
    GetDealsService,
  ],
})
export class ControllersModule {}
