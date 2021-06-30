import { Deal } from '@nx-bridge/interfaces-and-types';
import * as fromDealActions from '../actions/deal.actions';

export interface DealState {
  dealsAsStrings: string[];
  fetchedDeals: Deal[];
  currentlyViewingDeal: Deal;
}

const INITIAL_STATE: DealState = {
  dealsAsStrings: [],
  fetchedDeals: [],
  currentlyViewingDeal: {} as Deal,
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
    case fromDealActions.SET_CURRENTLY_VIEWING_DEAL:
      return {
        ...state,
        currentlyViewingDeal: action.payload,
      };
    default:
      return state;
  }
}


// 