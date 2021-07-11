import * as fromDeal from './deal.reducer';
import * as fromGame from './game.reducer';
import * as fromUser from './user.reducer';
import * as fromFilter from './filter.reducer';
import * as fromGeneral from './general.reducer';
import { ActionReducerMap } from "@ngrx/store";
import { ReducerNames } from '@nx-bridge/interfaces-and-types';

export interface AppState {
  [ReducerNames.deals]: fromDeal.DealState,
  [ReducerNames.games]: fromGame.GameState,
  [ReducerNames.users]: fromUser.UserState,
  [ReducerNames.filters]: fromFilter.FilterState,
  [ReducerNames.general]: fromGeneral.GeneralState,
}

export const appReducer: ActionReducerMap<AppState> = {
  [ReducerNames.deals]: fromDeal.dealReducer as any,
  [ReducerNames.games]: fromGame.gameReducer as any,
  [ReducerNames.users]: fromUser.userReducer as any,
  [ReducerNames.filters]: fromFilter.filterReducer as any,
  [ReducerNames.general]: fromGeneral.generalReducer as any,
};