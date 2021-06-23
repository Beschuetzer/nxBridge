import { Deal } from '@nx-bridge/interfaces-and-types';
import * as fromGameActions from '../actions/game.actions';

export interface State {
  games: Deal[];
}

const INITIAL_STATE: State = {
  games: [],
};

export function gameReducer(
  state = INITIAL_STATE,
  action: fromGameActions.Actions,
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
