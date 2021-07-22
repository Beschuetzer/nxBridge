import * as fromGeneralActions from '../actions/general.actions';

export interface GeneralState {
  batchNumber: number;
  isLoading: boolean;
  loadingError: string;
  resultsPerPagePreference: string;
  sortingPreference: string;
}

const INITIAL_STATE: GeneralState = {
  batchNumber: 0,
  isLoading: false,
  loadingError: '',
  resultsPerPagePreference: '',
  sortingPreference: '',
};

export function generalReducer(
  state = INITIAL_STATE,
  action: fromGeneralActions.GeneralActions
) {
  switch (action.type) {
    case fromGeneralActions.SET_BATCH_NUMBER:
      if (isNaN(action.payload)) return state;
      return {
        ...state,
        batchNumber: action.payload,
      };
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
    case fromGeneralActions.SET_RESULTS_PER_PAGE_PREFERENCE:
      return {
        ...state,
        resultsPerPagePreference: action.payload,
      };
    case fromGeneralActions.SET_SORTING_PREFERENCE:
      return {
        ...state,
        sortingPreference: action.payload,
      };
    default:
      return state;
  }
}
