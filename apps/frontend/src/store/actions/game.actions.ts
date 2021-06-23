import { Action } from '@ngrx/store';
import { Game } from '@nx-bridge/interfaces-and-types';

export const SET_GAMES = '[Auth] SET_GAMES';

export class SetGames implements Action {
  readonly type = SET_GAMES;
  constructor(
    public payload: Game[],
  ) {}
}

export type Actions = SetGames;
