
import { Action } from '@ngrx/store';

export const SET_IS_LOADING = '[General] SET_IS_LOADING';
export const SET_SORTING_PREFERENCE = '[General] SET_SORTING_PREFERENCE';
export const SET_LOADING_ERROR = '[General] SET_LOADING_ERROR';

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

export type GeneralActions = SetIsLoading | SetLoadingError | SetSortingPreference;
