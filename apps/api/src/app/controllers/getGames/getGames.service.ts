import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { GameModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse, ErrorMessage, Game, GameRelevant, RoomRelevant } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetGamesService {

  constructor(
    @InjectModel('Game') private gamesModel: Model<GameModel>,
  ) {}

  async getGames(userId: string, lastGamesToGet: string): ControllerResponse<GameRelevant> {
    try {
      if (lastGamesToGet) {
        const games = await this.gamesModel.find({players: userId}).sort({completionDate: -1}).limit(+lastGamesToGet).exec();
        return this.removeUnnecessaryDataFromGames(games);
      } else {
        const games = await this.gamesModel.find({players: userId}).exec();
        return this.removeUnnecessaryDataFromGames(games);
      }
    } catch (err) {
      return this.getErrorResponse();
    }
  }

  async getGame(gameId: string): ControllerResponse<GameRelevant> {
    try {
      const game = await this.gamesModel.findOne({_id: gameId}).exec();
      return this.getNewGame(game);
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

  private removeUnnecessaryDataFromGames(games: Game[]) {
    console.log('games =', games);
    const toReturn: GameRelevant[] = [];
    // -only send back relevant info on each game (deals,players, completionDate, room.name, room.seating, _id)

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      console.log('game =', game);
      const newGame = this.getNewGame(game);
      toReturn.push(newGame);
    }

    return toReturn;
    
  }

  private getNewGame(game: GameModel | Game) {
    const newRoom: RoomRelevant = {
      name: game.room.name,
      seating: game.room.seating,
    }

    const newGame: GameRelevant = {
      deals: game.deals,
      players: game.players,
      completionDate: game.completionDate,
      room: newRoom,
      _id: (game as any)._id,
    }

    return newGame;
  }

}
