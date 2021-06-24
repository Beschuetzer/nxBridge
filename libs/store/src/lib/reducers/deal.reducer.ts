import { Deal } from '@nx-bridge/interfaces-and-types';
import * as fromDealActions from '../actions/deal.actions';

export interface DealState {
  deals: Deal[];
}

const INITIAL_STATE: DealState = {
  deals: [],
};

export function dealReducer(
  state = INITIAL_STATE,
  action: fromDealActions.DealActions,
) {
  switch (action.type) {
    case fromDealActions.SET_DEALS:
      return {
        ...state,
        deals: action.payload,
      };
   
    default:
      return state;
  }
}
