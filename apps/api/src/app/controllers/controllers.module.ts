import { HttpClient } from '@angular/common/http';
import { Module } from '@nestjs/common';
import { GetIdController } from './getId/getId.controller';
import { GetIdService } from './getId/getId.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSchema, DealSchema } from '@nx-bridge/api-mongoose-models';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: 'Game', schema: GameSchema },
        { name: 'Deal', schema: DealSchema },
      ]
    ),
  ],
  controllers: [GetIdController],
  providers: [GetIdService, HttpClient],
})
export class ControllersModule {

}
