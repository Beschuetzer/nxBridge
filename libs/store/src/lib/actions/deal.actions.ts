import { Action as fromFilterActions } from '@ngrx/store';
import { Contract, Deal, FetchedDeals } from '@nx-bridge/interfaces-and-types';

export const SET_DEALS_AS_STRING = '[Deals] SET_DEALS_AS_STRINGS';
export const SET_FETCHED_DEALS = '[Deals] SET_FETCHED_DEALS';
export const SET_CURRENTLY_VIEWING_DEAL = '[Deals] SET_CURRENTLY_VIEWING_DEAL';
export const SET_CURRENTLY_VIEWING_DEAL_CONTRACT = '[Deals] SET_CURRENTLY_VIEWING_DEAL_CONTRACT';

export interface CurrentlyViewingDeal extends Deal {
  dealNumber: number | string;
  declarer: string;
  biddingTable: string;
  summaryPre: string;
  summaryNumber: string;
  summaryPost: string;
}

export class SetDealsAsStrings implements fromFilterActions {
  readonly type = SET_DEALS_AS_STRING;
  constructor(public payload: string[]) {}
}

export class SetFetchedDeals implements fromFilterActions {
  readonly type = SET_FETCHED_DEALS;
  constructor(public payload: FetchedDeals) {}
}

export class SetCurrentlyViewingDeal implements fromFilterActions {
  readonly type = SET_CURRENTLY_VIEWING_DEAL;
  constructor(public payload: CurrentlyViewingDeal) {}
}

export class SetCurrentlyViewingDealContract implements fromFilterActions {
  readonly type = SET_CURRENTLY_VIEWING_DEAL_CONTRACT;
  constructor(public payload: Contract) {}
}

export type DealActions =
  | SetDealsAsStrings
  | SetFetchedDeals
  | SetCurrentlyViewingDeal
  | SetCurrentlyViewingDealContract;
