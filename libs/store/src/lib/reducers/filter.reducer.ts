import { PlayerHasCard } from '@nx-bridge/interfaces-and-types';
import * as fromFilterActions from '../actions/filter.actions';

export interface FilterState {
  [key: string]: any,
  beforeDate: number;
  afterDate: number;
  isFilterSame: boolean;
  playerHasCard: PlayerHasCard[];
}

const INITIAL_STATE: FilterState = {
  beforeDate: 0,
  afterDate: 0,
  isFilterSame: false,
  playerHasCard: [],
};

export function filterReducer(
  state = INITIAL_STATE,
  action: fromFilterActions.FilterActions
) {
  switch (action.type) {
    case fromFilterActions.SET_AFTER_DATE:
      return {
        ...state,
        afterDate: action.payload,
      };
    case fromFilterActions.SET_BEFORE_DATE:
      return {
        ...state,
        beforeDate: action.payload,
      };
    case fromFilterActions.SET_PLAYER_HAS_CARD:
      return {
        ...state,
        playerHasCard: action.payload,
      };
    case fromFilterActions.SET_IS_FILTER_SAME:
      return {
        ...state,
        isFilterSame: action.payload,
      };

    default:
      return state;
  }
}

//
