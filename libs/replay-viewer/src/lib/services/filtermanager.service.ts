import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Deal,
  Filters,
  Game,
  PlayerHasCard,
  ReducerNames,
} from '@nx-bridge/interfaces-and-types';
import {
  AppState,
  SetBeforeDate,
  SetAfterDate,
  SetPlayerHasCard,
  SetFilteredGames,
  SetIsFilterSame,
  SetDealsThatMatchPlayerHasCardFilters,
  SetContractFilter,
} from '@nx-bridge/store';
import { switchMap, take } from 'rxjs/operators';
import { flatten, resetMatchedDeals } from '@nx-bridge/constants';

@Injectable({
  providedIn: 'root',
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
      errorKey: 'playerHasCardError',
    },
    dealsThatMatchPlayerHasCardFilters: {
      string: 'dealsThatMatchPlayerHasCardFilters',
    },
    contract: {
      string: 'contract',
    },
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    [this.filters.playerHasCard.string]: { initial: [-1] },
    [this.filters.dealsThatMatchPlayerHasCardFilters.string]: ['-1'],
    [this.filters.contract.string]: '',
  };
  public filterResetActions = {
    [this.filters.beforeDate.string]: new SetBeforeDate(
      this.filtersInitial?.beforeDate
    ),
    [this.filters.afterDate.string]: new SetAfterDate(
      this.filtersInitial?.afterDate
    ),
    [this.filters.playerHasCard.string]: new SetPlayerHasCard(
      this.filtersInitial?.playerHasCard
    ),
    [this.filters.dealsThatMatchPlayerHasCardFilters
      .string]: new SetDealsThatMatchPlayerHasCardFilters(
      this.filtersInitial?.dealsThatMatchPlayerHasCardFilters
    ),
    [this.filters.contract.string]: new SetContractFilter(
      this.filtersInitial?.contract
    ),
  };
  public filterMsgs: { [key: string]: any } = {
    none: 'No Filters applied',
    game: {
      player: '',
    },
    date: {
      before: {
        valid: 'Before: &nbsp;',
        invalid: {
          single: 'Invalid before date.',
          multiple: 'Before date &leq; after date.',
        },
      },
      after: {
        valid: 'After: &nbsp;',
        invalid: {
          single: 'Invalid after date.',
          multiple: 'After date &geq; before date.',
          afterNow: 'After date is after now.',
        },
      },
    },
    playerHasCard: {
      valid: '',
      invalid: 'already set to',
    },
  };
  public inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];
  public dealsThatMatch: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private store: Store<AppState>) {}

  getBeforeAndAfterDateInfo() {
    let beforeDate = -2;
    let afterDate = -2;
    const beforeDateElement = document.querySelector(
      `#${this.filters.beforeDate.string}`
    ) as HTMLInputElement;
    const afterDateElement = document.querySelector(
      `#${this.filters.afterDate.string}`
    ) as HTMLInputElement;

    this.store
      .select(ReducerNames.filters)
      .pipe(take(1))
      .subscribe((filterState) => {
        beforeDate = filterState.beforeDate;
        afterDate = filterState.afterDate;
      });

    return { beforeDate, afterDate, beforeDateElement, afterDateElement };
  }

  filterGames(games: Game[]) {
    if (!games) return games;
    let isFilterSame = true;
    let filteredGames = games;
    let filters: Filters = this.filtersInitial;

    this.store
      .select(ReducerNames.filters)
      .pipe(
        take(1),
        switchMap((filterState) => {
          isFilterSame = filterState.isFilterSame;
          filters = { ...filterState };
          return this.store.select(ReducerNames.games).pipe(take(1));
        })
      )
      .subscribe((gameState) => {
        if (isFilterSame && gameState.filteredGames?.length > 0)
          filteredGames = gameState.filteredGames;
      });

    if (isFilterSame) return filteredGames;

    filteredGames = this.applyFilters(games, filters);
    this.store.dispatch(new SetFilteredGames(filteredGames));
    this.store.dispatch(new SetIsFilterSame(true));
    return filteredGames;
  }

  reset() {
    for (const filter in this.filterResetActions) {
      if (
        Object.prototype.hasOwnProperty.call(this.filterResetActions, filter)
      ) {
        const filterResetAction = this.filterResetActions[filter];
        this.store.dispatch(filterResetAction);
      }
    }
  }

  resetElements(
    elements: ElementRef[],
    valueToReset: string,
    defaultValue: unknown
  ) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]?.nativeElement;
      if (element) element[valueToReset] = defaultValue;
    }
  }

  setInputErrorClassnames(
    input: HTMLElement,
    shouldRemoveInputErrorClassnames: boolean
  ) {
    this.inputErrorClassnames.forEach((classname) => {
      if (shouldRemoveInputErrorClassnames) input.classList.remove(classname);
      else input.classList.add(classname);
    });
  }

  private applyFilters(games: Game[], filters: Filters) {
    let filteredGames: Game[] = games;

    //NOTE: add new filters here; arrange in order of least to most cpu intensive to minimize cpu load
    filteredGames = this.getBeforeDateMatches(
      filteredGames,
      filters.beforeDate
    );
    filteredGames = this.getAfterDateMatches(filteredGames, filters.afterDate);
    filteredGames = this.runFiltersThatModifyDealsThatMatch(filteredGames, filters);

    return filteredGames;
  }

  private runFiltersThatModifyDealsThatMatch(games: Game[], filters: Filters) {
    //note: these filters modify dealsThatMatch and follow a different pattern
    this.dealsThatMatch = [];
    let filteredGames = games;

    //note: arrange in order of least cpu to most cpu intensive
    filteredGames = this.getContractMatches(filteredGames, filters.contract);
    filteredGames = this.getPlayerHasCardMatches(
      filteredGames,
      filters.playerHasCard
    );

    this.store.dispatch(
      new SetDealsThatMatchPlayerHasCardFilters(this.dealsThatMatch)
    );

    return filteredGames;
  }

  private getAfterDateMatches(games: Game[], afterDate: number) {
    if (!afterDate) return games;

    const toReturn: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (game.completionDate >= afterDate) toReturn.push(game);
    }

    return toReturn;
  }

  private getBeforeDateMatches(games: Game[], beforeDate: number) {
    if (!beforeDate) return games;

    const toReturn: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (game.completionDate <= beforeDate) toReturn.push(game);
    }

    return toReturn;
  }

  private getContractMatches(games: Game[], contractToMatch: string) {
    // debugger;
    if (!contractToMatch) return games;
    return games;
  }

  private getPlayerHasCardMatches(
    games: Game[],
    playerHasCards: PlayerHasCard
  ) {
    if (
      !playerHasCards ||
      playerHasCards['initial'] ||
      Object.keys(playerHasCards).length === 0
    )
      return games;

    function filterToRun(deal: Deal, dealId: string) {
      resetMatchedDeals();

      let canSkipToNextDeal = false;
      let shouldAddDeal = true;
      for (const username in playerHasCards) {
        if (Object.prototype.hasOwnProperty.call(playerHasCards, username)) {
          const cardsToCheckFor = playerHasCards[username];
          const handToCheck = deal.hands[username];
          if (!handToCheck || handToCheck.length <= 0) {
            shouldAddDeal = false;
            break;
          }

          const flatHand = flatten(handToCheck);
          for (let k = 0; k < cardsToCheckFor.length; k++) {
            const cardToCheckFor = cardsToCheckFor[k];
            if (!flatHand.includes(cardToCheckFor)) {
              shouldAddDeal = false;
              canSkipToNextDeal = true;
              break;
            }
          }
          if (canSkipToNextDeal) break;
        }
      }
      return shouldAddDeal;
    }

    const toReturn = this.getGamesToReturn(games, filterToRun);
    return toReturn;
  }

  private getGamesToReturn(
    games: Game[],
    filterToRun: (deal: Deal, dealId: string) => boolean
  ) {
    let fetchedDeals = [] as any;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        fetchedDeals = dealState.fetchedDeals;
      });

    const toReturn = [];

    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      let hasGameBeenAdded = false;
      for (let j = 0; j < game.deals.length; j++) {
        const dealId = game.deals[j];
        const deal = fetchedDeals[dealId];

        const shouldAddDeal = filterToRun(deal, dealId);

        if (shouldAddDeal) {
          if (!hasGameBeenAdded) {
            hasGameBeenAdded = true;
            toReturn.push(game);
          }
          this.dealsThatMatch = [...this.dealsThatMatch, dealId];
        }
      }
    }
    return toReturn;
  }
}
