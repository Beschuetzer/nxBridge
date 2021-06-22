import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetGamesService {
  constructor(
    @InjectModel('Game') private gamesModel: Model<GameModel>,
  ) {}

  async getGames(userId: string) {
    return await this.gamesModel.find({players: userId});
  }

  async getGame(gameId: string) {
    return await this.gamesModel.findOne({_id: gameId});
  }
}
