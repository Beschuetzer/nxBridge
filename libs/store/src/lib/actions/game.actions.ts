import { Action as fromGeneralActions } from '@ngrx/store';
import { GameRelevant, Seating } from '@nx-bridge/interfaces-and-types';

export const SET_GAMES = '[Games] SET_GAMES';
export const SET_CURRENTLY_VIEWING_GAME = '[Games] SET_CURRENTLY_VIEWING_GAME';
export const SET_FILTERED_GAMES = '[Games] SET_FILTERED_GAMES';
export const SET_CURRENTLY_DISPLAYING_GAMES = '[Games] SET_CURRENTLY_DISPLAYING_GAMES';
export const SET_IS_VIEWING_GAME = '[Games] SET_IS_VIEWING_GAME';
SET_FILTERED_GAMES;
export interface CurrentlyViewingGame {
  seating: Seating;
  date: string | number;
  name: string;
  deals: string[];
}

export class SetCurrentlyViewingGame implements fromGeneralActions {
  readonly type = SET_CURRENTLY_VIEWING_GAME;
  constructor(public payload: CurrentlyViewingGame) {}
}
export class SetGames implements fromGeneralActions {
  readonly type = SET_GAMES;
  constructor(public payload: GameRelevant[]) {}
}

export class SetCurrentlyDisplayingGames implements fromGeneralActions {
  readonly type = SET_CURRENTLY_DISPLAYING_GAMES;
  constructor(public payload: GameRelevant[]) {}
}

export class SetFilteredGames implements fromGeneralActions {
  readonly type = SET_FILTERED_GAMES;
  constructor(public payload: GameRelevant[]) {}
}

export class SetIsViewingGame implements fromGeneralActions {
  readonly type = SET_IS_VIEWING_GAME;
  constructor(public payload: boolean) {}
}

export type GameActions =
  | SetGames
  | SetCurrentlyViewingGame
  | SetIsViewingGame
  | SetCurrentlyDisplayingGames
  | SetFilteredGames;
