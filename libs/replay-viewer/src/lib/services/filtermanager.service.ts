import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Filters } from '@nx-bridge/interfaces-and-types';
import { AppState, SetBeforeDate, SetAfterDate } from '@nx-bridge/store';

@Injectable({
  providedIn: 'root'
})
export class FiltermanagerService {
  public filters = {
    beforeDate: {
      string: 'beforeDate',
    },
    afterDate: {
      string: 'afterDate',
    },
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
  };
  public filterResetActions = {
    [this.filters.beforeDate.string]: new SetBeforeDate(this.filtersInitial?.beforeDate),
    [this.filters.afterDate.string]: new SetAfterDate(this.filtersInitial?.afterDate)
  }
  

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private store: Store<AppState>,
  ) { }
 
  reset() {
    for (const filter in this.filterResetActions) {
      if (Object.prototype.hasOwnProperty.call(this.filterResetActions, filter)) {
        const filterResetAction = this.filterResetActions[filter];
        this.store.dispatch(filterResetAction);
      }
    }
  }
}
