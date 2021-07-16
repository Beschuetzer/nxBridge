import { Action } from '@ngrx/store';
import { PlayerHasCard } from '@nx-bridge/interfaces-and-types';

export const SET_BEFORE_DATE = '[Filter] SET_BEFORE_DATE';
export const SET_AFTER_DATE = '[Filter] SET_AFTER_DATE';
export const SET_PLAYER_HAS_CARD = '[Filter] SET_PLAYER_HAS_CARD';
export const ADD_PLAYER_HAS_CARD = '[Filter] ADD_PLAYER_HAS_CARD';
export const REMOVE_PLAYER_HAS_CARD = '[Filter] REMOVE_PLAYER_HAS_CARD';
export const SET_CONTRACT_FILTER = '[Filter] SET_CONTRACT_FILTER';
export const SET_DECLARER_FILTER = '[Filter] SET_DECLARER_FILTER';
export const SET_OPENING_BID_FILTER = '[Filter] SET_OPENING_BID_FILTER';
export const SET_DOUBLE_FILTER = '[Filter] SET_DOUBLE_FILTER';
export const SET_IS_FILTER_SAME = '[Filter] SET_IS_FILTER_SAME';
export const SET_DEALS_THAT_MATCH_FILTERS =
  '[Filter] SET_DEALS_THAT_MATCH_FILTERS';
export class SetDealsThatMatchFilters implements Action {
  readonly type = SET_DEALS_THAT_MATCH_FILTERS;
  constructor(public payload: string[]) {}
}

export class SetBeforeDate implements Action {
  readonly type = SET_BEFORE_DATE;
  constructor(public payload: number) {}
}

export class SetAfterDate implements Action {
  readonly type = SET_AFTER_DATE;
  constructor(public payload: number) {}
}

export class SetPlayerHasCard implements Action {
  readonly type = SET_PLAYER_HAS_CARD;
  constructor(public payload: PlayerHasCard) {}
}

export class AddPlayerHasCard implements Action {
  readonly type = ADD_PLAYER_HAS_CARD;
  constructor(public payload: PlayerHasCard) {}
}

export class RemovePlayerHasCard implements Action {
  readonly type = REMOVE_PLAYER_HAS_CARD;
  constructor(public payload: { username: string; card: number }) {}
}

export class SetContractFilter implements Action {
  readonly type = SET_CONTRACT_FILTER;
  constructor(public payload: string) {}
}

export class SetDeclarerFilter implements Action {
  readonly type = SET_DECLARER_FILTER;
  constructor(public payload: string) {}
}

export class SetOpeningBidFilter implements Action {
  readonly type = SET_OPENING_BID_FILTER;
  constructor(public payload: string) {}
}

export class SetDoubleFilter implements Action {
  readonly type = SET_DOUBLE_FILTER;
  constructor(public payload: number) {}
}

export class SetIsFilterSame implements Action {
  readonly type = SET_IS_FILTER_SAME;
  constructor(public payload: boolean) {}
}

export type FilterActions =
  | SetBeforeDate
  | SetAfterDate
  | SetIsFilterSame
  | SetPlayerHasCard
  | AddPlayerHasCard
  | RemovePlayerHasCard
  | SetContractFilter
  | SetDeclarerFilter
  | SetOpeningBidFilter
  | SetDoubleFilter
  | SetDealsThatMatchFilters;
