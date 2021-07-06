import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetGamesService {
  constructor(
    @InjectModel('Game') private gamesModel: Model<GameModel>,
  ) {}

  async getGames(userId: string, lastGamesToGet: string): ControllerResponse<GameModel> {
    console.log('lastGamesToGet =', lastGamesToGet);
    if (!userId) {
      return new Promise((res, rej) => {
        res({message: "No userId given", status: 400});
      })
    } else {
      if (lastGamesToGet) {
        return await this.gamesModel.find({players: userId}).sort({completionDate: -1}).limit(+lastGamesToGet).exec();
      }
      return await this.gamesModel.find({players: userId}).exec();
    }
  }

  async getGame(gameId: string): ControllerResponse<GameModel> {
    if (!gameId) {
      return new Promise((res, rej) => {
        res({message: "No gameId given", status: 400});
      }) 
    } else {
      return await this.gamesModel.findOne({_id: gameId}).exec();
    }
  }

}
