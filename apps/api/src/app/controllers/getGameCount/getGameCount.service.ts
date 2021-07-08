import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import {
  ControllerResponse,
  ErrorMessage,
} from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root' })
export class GetGameCountService {
  constructor(@InjectModel('Game') private gamesModel: Model<GameModel>) {}

  async getGameCount(userId: string): ControllerResponse<number> {
    try {
      if (userId === undefined || userId === null)
        return this.getErrorResponse();
      return await this.gamesModel.countDocuments({ players: userId });
    } catch (err) {
      console.log('err =', err);
      return this.getErrorResponse();
    }
  }

  private getErrorResponse(): Promise<ErrorMessage> {
    return new Promise((res, rej) => {
      res({ message: 'No userId given', status: 400 });
    });
  }
}
