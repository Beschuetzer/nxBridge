import { Module } from '@nestjs/common';
import { GetIdController } from './getId/getId.controller';
import { GetGamesController } from './getGames/getGames.controller';
import { GetIdService } from './getId/getId.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GetGamesService } from './getGames/getGames.service';

import {
  GameSchema,
  DealSchema,
  UserSchema,
} from '@nx-bridge/api-mongoose-models';




@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Game', schema: GameSchema },
      { name: 'Deal', schema: DealSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [
    GetIdController,
    GetGamesController,
  ],
  providers: [
    GetIdService,
    GetGamesService,
  ],
})
export class ControllersModule {}
