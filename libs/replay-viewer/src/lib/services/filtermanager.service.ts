import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Filters } from '@nx-bridge/interfaces-and-types';
import { } from '@nx-bridge/constants';
import { AppState, SetBeforeDate, SetAfterDate, SetPlayerHasCard } from '@nx-bridge/store';

@Injectable({
  providedIn: 'root'
})
export class FiltermanagerService {
  //NOTE: new filters need to be added to all three filter objects below
  public filters = {
    beforeDate: {
      string: 'beforeDate',
    },
    afterDate: {
      string: 'afterDate',
    },
    playerHasCard: {
      string: 'playerHasCard',
    }
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    [this.filters.playerHasCard.string]: [],
  };
  public filterResetActions = {
    [this.filters.beforeDate.string]: new SetBeforeDate(this.filtersInitial?.beforeDate),
    [this.filters.afterDate.string]: new SetAfterDate(this.filtersInitial?.afterDate),
    [this.filters.playerHasCard.string]: new SetPlayerHasCard(this.filtersInitial?.playerHasCard)
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

  resetElements(elements: ElementRef[], valueToReset: string, defaultValue: unknown) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]?.nativeElement;
      if (element) element[valueToReset] = defaultValue;
    }
  }
}
