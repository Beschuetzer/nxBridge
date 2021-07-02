import { Game, Seating } from '@nx-bridge/interfaces-and-types';
import * as fromGameActions from '../actions/game.actions';

export interface GameState {
  games: Game[];
  currentlyViewingGameSeating: Seating,
  isViewingGame: boolean,
}

const INITIAL_STATE: GameState = {
  games: [],
  currentlyViewingGameSeating: {} as Seating,
  isViewingGame: false,
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
    case fromGameActions.SET_CURRENTLY_VIEWING_GAME_SEATING:
      return {
        ...state,
        currentlyViewingGameSeating: action.payload,
      };
    case fromGameActions.SET_IS_VIEWING_GAME:
      return {
        ...state,
        isViewingGame: action.payload,
      };
    default:
      return state;
  }
}
