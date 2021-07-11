import * as fromFilterActions from '../actions/filter.actions';

export interface FilterState {
  beforeDate: number,
  afterDate: number
}

const INITIAL_STATE: FilterState = {
  beforeDate: 0,
  afterDate: 0,
};

export function filterReducer(
  state = INITIAL_STATE,
  action: fromFilterActions.FilterActions,
) {
  switch (action.type) {
    case fromFilterActions.SET_AFTER_DATE:
      return {
        ...state,
        afterDate: action.payload,
      };

    case fromFilterActions.SET_BEFORE_DATE:
    return {
      ...state,
      beforeDate: action.payload,
    };

    default:
    return state;
  }
}


// 