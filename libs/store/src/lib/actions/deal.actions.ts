import { Action } from '@ngrx/store';
import { Deal } from '@nx-bridge/interfaces-and-types';

export const SET_DEALS = '[Auth] SET_DEALS';

export class SetDeals implements Action {
  readonly type = SET_DEALS;
  constructor(
    public payload: string[], 
  ) {}
}

export type DealActions = SetDeals;
