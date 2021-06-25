import { Game } from '@nx-bridge/interfaces-and-types';
import * as fromGameActions from '../actions/game.actions';

export interface GameState {
  games: Game[];
}

const INITIAL_STATE: GameState = {
  games: [],
};

export function gameReducer(
  state = INITIAL_STATE,
  action: fromGameActions.GameActions,
) {
  switch (action.type) {
    case fromGameActions.SET_GAMES:
      return {
        ...state,
        games: action.payload,
      };
   
    default:
      return state;
  }
}
