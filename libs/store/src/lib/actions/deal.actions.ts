import { Action } from '@ngrx/store';
import { Deal } from '@nx-bridge/interfaces-and-types';

export const SET_DEALS_AS_STRING = '[Deals] SET_DEALS_AS_STRINGS';
export const ADD_FETCHED_DEALS = '[Deals] ADD_FETCHED_DEALS';

export class SetDealsAsStrings implements Action {
  readonly type = SET_DEALS_AS_STRING;
  constructor(
    public payload: string[], 
  ) {}
}

export class AddFetchedDeals implements Action {
  readonly type = ADD_FETCHED_DEALS;
  constructor(
    public payload: Deal[], 
  ) {}
}

export type DealActions = SetDealsAsStrings | AddFetchedDeals;
