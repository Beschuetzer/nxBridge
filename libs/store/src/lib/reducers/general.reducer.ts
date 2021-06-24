import * as fromGeneralActions from '../actions/general.actions';

export interface GeneralState {
  isLoading: boolean,
  loadingError: string,
}

const INITIAL_STATE: GeneralState = {
  isLoading: false,
  loadingError: "",
};

export function generalReducer(
  state = INITIAL_STATE,
  action: fromGeneralActions.GeneralActions,
) {
  switch (action.type) {
    case fromGeneralActions.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case fromGeneralActions.SET_LOADING_ERROR:
      return {
        ...state,
        loadingError: action.payload,
      };
   
    default:
      return state;
  }
}
