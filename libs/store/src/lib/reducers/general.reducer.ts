import * as fromGeneralActions from '../actions/general.actions';

export interface GeneralState {
  isLoading: boolean,
  loadingError: string,
  sortingPreference: string,
  resultsPerPagePreference: string,
}

const INITIAL_STATE: GeneralState = {
  isLoading: false,
  loadingError: '',
  sortingPreference: '',
  resultsPerPagePreference: '',
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
    case fromGeneralActions.SET_SORTING_PREFERENCE:
      return {
        ...state,
        sortingPreference: action.payload,
      };
    case fromGeneralActions.SET_RESULTS_PER_PAGE_PREFERENCE:
      return {
        ...state,
        resultsPerPagePreference: action.payload,
      };
    default:
      return state;
  }
}
