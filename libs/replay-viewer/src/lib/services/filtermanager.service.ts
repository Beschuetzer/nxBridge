import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Filters } from '@nx-bridge/interfaces-and-types';
import { AppState, SetBeforeDate } from '@nx-bridge/store';

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
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    reset: new SetBeforeDate(this.filtersInitial?.beforeDate)

  }
  

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private store: Store<AppState>,
  ) { }
 
  reset() {
    this.store.dispatch()
  }
  
}
