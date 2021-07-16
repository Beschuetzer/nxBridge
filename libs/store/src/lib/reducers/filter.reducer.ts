/* eslint-disable no-case-declarations */
import { PlayerHasCard } from '@nx-bridge/interfaces-and-types';
import * as fromFilterActions from '../actions/filter.actions';

export const reducerDefaultValue = -1;

export interface FilterState {
  [key: string]: any,
  beforeDate: number;
  afterDate: number;
  isFilterSame: boolean;
  playerHasCard: PlayerHasCard;
  contract: string;
  declarer: string;
  openingBid: string;
  dealsThatMatchFilters: string[];
}

const INITIAL_STATE: FilterState = {
  beforeDate: 0,
  afterDate: 0,
  isFilterSame: false,
  playerHasCard: {initial: []},
  contract: `${reducerDefaultValue}`,
  declarer: `${reducerDefaultValue}`,
  openingBid: `${reducerDefaultValue}`,
  dealsThatMatchFilters: [`${reducerDefaultValue}`],
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
    case fromFilterActions.SET_DEALS_THAT_MATCH_FILTERS:
      return {
        ...state,
        dealsThatMatchFilters: action.payload,
      };
    case fromFilterActions.SET_CONTRACT_FILTER:
      return {
        ...state,
        contract: action.payload,
      };
    case fromFilterActions.SET_DECLARER_FILTER:
      return {
        ...state,
        declarer: action.payload,
      };
    case fromFilterActions.SET_OPENING_BID_FILTER:
      return {
        ...state,
        openingBid: action.payload,
      };
    case fromFilterActions.ADD_PLAYER_HAS_CARD:
      const newPlayerHasCard = {...action.payload};
      const usernameKey: string = Object.keys(newPlayerHasCard)[0];
      const usernameValues = state.playerHasCard[usernameKey];
      
      if (usernameValues) {
        const usernameValuesCopy = [...usernameValues];
        const valueToAdd = newPlayerHasCard[usernameKey];
        usernameValuesCopy.push(...valueToAdd);
        newPlayerHasCard[usernameKey] = [...usernameValuesCopy];
      }

      return {
        ...state,
        playerHasCard: {...state.playerHasCard, ...newPlayerHasCard},
      };
      case fromFilterActions.REMOVE_PLAYER_HAS_CARD:
        const {username, card} = action.payload;
        const values = state.playerHasCard[username];
        const index = values.findIndex(c => c === card);
        const newPlayerHasCardFilter = {[username]: [...values]};
        newPlayerHasCardFilter[username].splice(index, 1);

        if (newPlayerHasCardFilter[username].length === 0) {
          const newState = {...state.playerHasCard};
          delete newState[username];
          return {
            ...state,
            playerHasCard: newState
          }
        }
  
        return {
          ...state,
          playerHasCard: {...state.playerHasCard, ...newPlayerHasCardFilter},
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
