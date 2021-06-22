import { Deal } from '@nx-bridge/interfaces-and-types';
import * as fromDealActions from '../actions/deal.actions';

export interface State {
  deals: Deal[];
}

const INITIAL_STATE: State = {
  deals: [],
};

export function dealReducer(
  state = INITIAL_STATE,
  action: fromDealActions.Actions,
) {
  switch (action.type) {
    case fromDealActions.LOGIN:
      return {
        ...state,
      };
   
    default:
      return state;
  }
}
