import { Action } from '@ngrx/store';
import { PlayerHasCard } from '@nx-bridge/interfaces-and-types';

export const SET_BEFORE_DATE = '[Filter] SET_BEFORE_DATE';
export const SET_AFTER_DATE = '[Filter] SET_AFTER_DATE';
export const SET_PLAYER_HAS_CARD = '[Filter] SET_PLAYER_HAS_CARD';
export const SET_IS_FILTER_SAME = '[Filter] SET_IS_FILTER_SAME';

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
  constructor(public payload: PlayerHasCard[]) {}
}

export class SetIsFilterSame implements Action {
  readonly type = SET_IS_FILTER_SAME;
  constructor(public payload: boolean) {}
}

export type FilterActions =
  | SetBeforeDate
  | SetAfterDate
  | SetIsFilterSame
  | SetPlayerHasCard;
