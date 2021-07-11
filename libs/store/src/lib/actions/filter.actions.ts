import { Action } from '@ngrx/store';

export const SET_BEFORE_DATE = '[Filter] SET_BEFORE_DATE';
export const SET_AFTER_DATE = '[Filter] SET_AFTER_DATE';
export const SET_IS_FILTER_SAME = '[Filter] SET_IS_FILTER_SAME';

export class SetBeforeDate implements Action {
  readonly type = SET_BEFORE_DATE;
  constructor(public payload: number) {}
}

export class SetAfterDate implements Action {
  readonly type = SET_AFTER_DATE;
  constructor(public payload: number) {}
}

export class SetIsFilterSame implements Action {
  readonly type = SET_IS_FILTER_SAME;
  constructor(public payload: boolean) {}
}

export type FilterActions =
  | SetBeforeDate
  | SetAfterDate
  | SetIsFilterSame;