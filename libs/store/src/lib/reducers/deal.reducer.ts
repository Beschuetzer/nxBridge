import { Deal } from '@nx-bridge/interfaces-and-types';
import * as fromDealActions from '../actions/deal.actions';

export interface DealState {
  dealsAsStrings: string[];
  fetchedDeals: Deal[];
}

const INITIAL_STATE: DealState = {
  dealsAsStrings: [],
  fetchedDeals: [],
};

export function dealReducer(
  state = INITIAL_STATE,
  action: fromDealActions.DealActions,
) {
  switch (action.type) {
    case fromDealActions.SET_DEALS_AS_STRING:
      return {
        ...state,
        dealsAsStrings: action.payload,
      };
    case fromDealActions.ADD_FETCHED_DEALS:
      return {
        ...state,
        fetchedDeals: [...state.fetchedDeals, ...action.payload],
      };
   
    default:
      return state;
  }
}


// 