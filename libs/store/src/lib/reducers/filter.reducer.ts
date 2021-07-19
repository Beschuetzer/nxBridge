/* eslint-disable no-case-declarations */
import { PlayerHasCard } from '@nx-bridge/interfaces-and-types';
import * as fromFilterActions from '../actions/filter.actions';

export const reducerDefaultValue = -1;

export interface FilterState {
  [key: string]: any;
  afterDate: number;
  beforeDate: number;
  contract: string;
  dealsThatMatchFilters: string[];
  declarer: string;
  double: number;
  gameName: string;
  isFilterSame: boolean;
  openingBid: string;
  playerHasCard: PlayerHasCard;
  playerInGame: string[];
  wonBy: number;
}

const INITIAL_STATE: FilterState = {
  afterDate: 0,
  beforeDate: 0,
  contract: `${reducerDefaultValue}`,
  dealsThatMatchFilters: [`${reducerDefaultValue}`],
  declarer: `${reducerDefaultValue}`,
  double: reducerDefaultValue,
  gameName: `${reducerDefaultValue}`,
  isFilterSame: false,
  openingBid: `${reducerDefaultValue}`,
  playerHasCard: { initial: [] },
  playerInGame: [`${reducerDefaultValue}`],
  wonBy: reducerDefaultValue,
};

export function filterReducer(
  state = INITIAL_STATE,
  action: fromFilterActions.FilterActions
) {
  switch (action.type) {
    case fromFilterActions.ADD_PLAYER_IN_GAME_FILTER:
      const toAdd = [...state.playerInGame];
      const indexToAdd = toAdd.findIndex(
        (current) => current === `${reducerDefaultValue}`
      );
      if (indexToAdd !== -1) toAdd.splice(indexToAdd, 1);

      return {
        ...state,
        playerInGame: [...toAdd, action.payload],
      };
    case fromFilterActions.ADD_PLAYER_HAS_CARD:
      const newPlayerHasCard = { ...action.payload };
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
        playerHasCard: { ...state.playerHasCard, ...newPlayerHasCard },
      };
    case fromFilterActions.REMOVE_PLAYER_HAS_CARD:
      const { username, card } = action.payload;
      const values = state.playerHasCard[username];
      const index = values.findIndex((c) => c === card);
      const newPlayerHasCardFilter = { [username]: [...values] };
      newPlayerHasCardFilter[username].splice(index, 1);

      if (newPlayerHasCardFilter[username].length === 0) {
        const newState = { ...state.playerHasCard };
        delete newState[username];
        return {
          ...state,
          playerHasCard: newState,
        };
      }

      return {
        ...state,
        playerHasCard: { ...state.playerHasCard, ...newPlayerHasCardFilter },
      };
    case fromFilterActions.REMOVE_PLAYER_IN_GAME_FILTER:
      const newPlayerInGame = [...state.playerInGame];
      const indexOfPlayerInGame = newPlayerInGame.findIndex(
        (current) => action.payload === current
      );
      if (indexOfPlayerInGame !== -1)
        newPlayerInGame.splice(indexOfPlayerInGame, 1);

      return {
        ...state,
        playerInGame: newPlayerInGame,
      };
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
    case fromFilterActions.SET_CONTRACT_FILTER:
      return {
        ...state,
        contract: action.payload,
      };
    case fromFilterActions.SET_DEALS_THAT_MATCH_FILTERS:
      return {
        ...state,
        dealsThatMatchFilters: action.payload,
      };
    case fromFilterActions.SET_DECLARER_FILTER:
      return {
        ...state,
        declarer: action.payload,
      };
    case fromFilterActions.SET_DOUBLE_FILTER:
      return {
        ...state,
        double: action.payload,
      };
    case fromFilterActions.SET_GAME_NAME_FILTER:
      return {
        ...state,
        gameName: action.payload,
      };
    case fromFilterActions.SET_IS_FILTER_SAME:
      return {
        ...state,
        isFilterSame: action.payload,
      };
    case fromFilterActions.SET_OPENING_BID_FILTER:
      return {
        ...state,
        openingBid: action.payload,
      };
    case fromFilterActions.SET_PLAYER_HAS_CARD:
      return {
        ...state,
        playerHasCard: action.payload,
      };
    case fromFilterActions.SET_PLAYER_IN_GAME_FILTER:
      return {
        ...state,
        playerInGame: action.payload,
      };
    case fromFilterActions.SET_WON_BY_FILTER:
      const newWonBy = action.payload;
      return {
        ...state,
        wonBy: isNaN(newWonBy.amount)
          ? { amount: reducerDefaultValue, type: 'less' }
          : newWonBy,
      };
    default:
      return state;
  }
}

//
