import { GameRelevant } from '@nx-bridge/interfaces-and-types';
import * as fromGameActions from '../actions/game.actions';

export interface GameState {
  games: GameRelevant[];
  currentlyDisplayingGames: GameRelevant[];
  filteredGames: GameRelevant[];
  currentlyViewingGame: fromGameActions.CurrentlyViewingGame;
  isViewingGame: boolean;
}

const INITIAL_STATE: GameState = {
  games: [],
  currentlyDisplayingGames: [] as GameRelevant[],
  filteredGames: [] as GameRelevant[],
  currentlyViewingGame: {} as fromGameActions.CurrentlyViewingGame,
  isViewingGame: false,
};

export function gameReducer(
  state = INITIAL_STATE,
  action: fromGameActions.GameActions
) {
  switch (action.type) {
    case fromGameActions.SET_GAMES:
      return {
        ...state,
        games: action.payload,
      };
    case fromGameActions.SET_CURRENTLY_VIEWING_GAME:
      return {
        ...state,
        currentlyViewingGame: action.payload,
      };
    case fromGameActions.SET_CURRENTLY_DISPLAYING_GAMES:
      return {
        ...state,
        currentlyDisplayingGames: action.payload,
      };
    case fromGameActions.SET_FILTERED_GAMES:
      return {
        ...state,
        filteredGames: action.payload,
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
