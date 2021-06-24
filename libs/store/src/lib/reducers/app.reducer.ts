// import * as fromShoppingList from "../shopping-list/store/shopping-list.reducer";
// import * as fromAuth from '../auth/store/auth.reducer';
import * as fromDeal from './deal.reducer';
import * as fromGame from './game.reducer';
import { ActionReducerMap } from "@ngrx/store";

export interface AppState {
  // shoppingList: fromShoppingList.State,
  // auth: fromAuth.State,
  deals: fromDeal.DealState,
  games: fromGame.GameState,
}

export const appReducer: ActionReducerMap<AppState> = {
  deals: fromDeal.dealReducer as any,
  games: fromGame.gameReducer as any,
  // shoppingList: fromShoppingList.shoppingListReducer,
  // shoppingList: fromShoppingList.shoppingListReducer,
  // auth: fromAuth.authReducer,
};