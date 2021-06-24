import { Action as fromGeneralActions } from '@ngrx/store';
import { Game } from '@nx-bridge/interfaces-and-types';

export const SET_GAMES = '[Games] SET_GAMES';

export class SetGames implements fromGeneralActions {
  readonly type = SET_GAMES;
  constructor(
    public payload: Game[],
  ) {}
}

export type GameActions = SetGames;
