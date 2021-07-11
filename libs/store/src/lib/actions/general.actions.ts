import { Action } from '@ngrx/store';
export const SET_IS_LOADING = '[General] SET_IS_LOADING';
export const SET_SORTING_PREFERENCE = '[General] SET_SORTING_PREFERENCE';
export const SET_LOADING_ERROR = '[General] SET_LOADING_ERROR';
export const SET_RESULTS_PER_PAGE_PREFERENCE = '[General] SET_RESULTS_PER_PAGE_PREFERENCE';
export const SET_BATCH_NUMBER = '[General] SET_BATCH_NUMBER';

export class SetLoadingError implements Action {
  readonly type = SET_LOADING_ERROR;
  constructor(public payload: string) {}
}

export class SetIsLoading implements Action {
  readonly type = SET_IS_LOADING;
  constructor(public payload: boolean) {}
}

export class SetSortingPreference implements Action {
  readonly type = SET_SORTING_PREFERENCE;
  constructor(public payload: string) {}
}

export class SetResultsPerPagePreference implements Action {
  readonly type = SET_RESULTS_PER_PAGE_PREFERENCE;
  constructor(public payload: string) {}
}

export class SetBatchNumber implements Action {
  readonly type = SET_BATCH_NUMBER;
  constructor(public payload: number) {}
}

export type GeneralActions =
  | SetIsLoading
  | SetLoadingError
  | SetSortingPreference
  | SetResultsPerPagePreference
  | SetBatchNumber;
