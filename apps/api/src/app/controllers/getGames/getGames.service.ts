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

  async getGames(userId: string): ControllerResponse<GameModel> {
    if (!userId) {
      return new Promise((res, rej) => {
        return setTimeout(() => {
          res({message: "No userId given", status: 400});
        }, 1)
      })
    } else {
      return await this.gamesModel.find({players: userId});
    }
  }

  async getGame(gameId: string): ControllerResponse<GameModel> {
    if (!gameId) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          res({message: "No gameId given", status: 400});
        }, 1)
      }) 
    } else {
      return await this.gamesModel.findOne({_id: gameId});
    }
  }

}
