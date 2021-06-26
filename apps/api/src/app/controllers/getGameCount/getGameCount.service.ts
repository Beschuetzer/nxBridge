import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetGameCountService {
  constructor(
    @InjectModel('Game') private gamesModel: Model<GameModel>,
  ) {}

  async getGameCount(userId: string): ControllerResponse<number> {
    if (!userId) {
      return new Promise((res, rej) => {
        res({message: "No userId given", status: 400});
      })
    } else {
      return await this.gamesModel.countDocuments({players: userId});
      // return await this.gamesModel.find({players: userId});
    }
  }
}
