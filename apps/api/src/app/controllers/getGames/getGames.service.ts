import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse, ErrorMessage } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetGamesService {

  constructor(
    @InjectModel('Game') private gamesModel: Model<GameModel>,
  ) {}

  async getGames(userId: string, lastGamesToGet: string): ControllerResponse<GameModel> {
    try {
      if (lastGamesToGet) {
        return await this.gamesModel.find({players: userId}).sort({completionDate: -1}).limit(+lastGamesToGet).exec();
      }
      return await this.gamesModel.find({players: userId}).exec();
    } catch (err) {
      return this.getErrorResponse();
    }
  }

  async getGame(gameId: string): ControllerResponse<GameModel> {
    try {
      return await this.gamesModel.findOne({_id: gameId}).exec();
    } catch (err) {
      console.log('err =', err);
      return new Promise((res, rej) => {
        res({message: "Error in getGame", status: 400});
      }) 
    }
  }

  private getErrorResponse(): Promise<ErrorMessage> {
    return new Promise((res, rej) => {
      res({message: "Error in getGames", status: 400});
    });
  }

}
