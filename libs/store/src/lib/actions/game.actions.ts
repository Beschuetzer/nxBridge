import { Action as fromGeneralActions } from '@ngrx/store';
import { Game, Seating } from '@nx-bridge/interfaces-and-types';

export const SET_GAMES = '[Games] SET_GAMES';
export const SET_CURRENTLY_VIEWING_GAME_SEATING = '[Games] SET_CURRENTLY_VIEWING_GAME_SEATING';
export const SET_IS_VIEWING_GAME = '[Games] SET_IS_VIEWING_GAME';


export class SetCurrentlyViewingGameSeating implements fromGeneralActions {
  readonly type = SET_CURRENTLY_VIEWING_GAME_SEATING;
  constructor(
    public payload: Seating,
  ) {}
}
export class SetGames implements fromGeneralActions {
  readonly type = SET_GAMES;
  constructor(
    public payload: Game[],
  ) {}
}

export class SetIsViewingGame implements fromGeneralActions {
  readonly type = SET_IS_VIEWING_GAME;
  constructor(
    public payload: boolean,
  ) {}
}

export type GameActions = SetGames | SetCurrentlyViewingGameSeating | SetIsViewingGame;
