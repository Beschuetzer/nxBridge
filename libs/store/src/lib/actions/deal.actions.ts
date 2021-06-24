import { Action } from '@ngrx/store';

export const SET_DEALS = '[Deals] SET_DEALS';

export class SetDeals implements Action {
  readonly type = SET_DEALS;
  constructor(
    public payload: string[], 
  ) {}
}

export type DealActions = SetDeals;
