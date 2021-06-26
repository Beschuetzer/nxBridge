import * as fromDeal from './deal.reducer';
import * as fromGame from './game.reducer';
import * as fromUser from './user.reducer';
import * as fromGeneral from './general.reducer';
import { ActionReducerMap } from "@ngrx/store";

export interface AppState {
  deals: fromDeal.DealState,
  games: fromGame.GameState,
  users: fromUser.UserState
  general: fromGeneral.GeneralState,
}

export const appReducer: ActionReducerMap<AppState> = {
  deals: fromDeal.dealReducer as any,
  games: fromGame.gameReducer as any,
  users: fromUser.userReducer as any,
  general: fromGeneral.generalReducer as any,
};