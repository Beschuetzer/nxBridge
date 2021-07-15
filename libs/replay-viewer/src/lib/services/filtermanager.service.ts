import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
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
  RemovePlayerHasCard,
} from '@nx-bridge/store';
import { switchMap, take } from 'rxjs/operators';
import { flatten, resetPlayerHasCardDeals } from '@nx-bridge/constants';

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
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    [this.filters.playerHasCard.string]: { initial: [-1] },
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
      invalid: 'already has the',
    },
  };
  public inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private store: Store<AppState>) {}

  getBeforeAndAfterDateInfo() { 
    let beforeDate = -2;
    let afterDate = -2;
    const beforeDateElement = document.querySelector(`#${this.filters.beforeDate.string}`) as HTMLInputElement;
    const afterDateElement = document.querySelector(`#${this.filters.afterDate.string}`) as HTMLInputElement;

    this.store.select(ReducerNames.filters).pipe(take(1)).subscribe(filterState => {
      beforeDate = filterState.beforeDate;
      afterDate = filterState.afterDate;
    })

    return {beforeDate, afterDate, beforeDateElement, afterDateElement}
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

    //NOTE: add new filtering function here; arrange in order of least to most cpu intensive to minimize cpu load
    filteredGames = this.getBeforeDate(filteredGames, filters.beforeDate);
    filteredGames = this.getAfterDate(filteredGames, filters.afterDate);
    filteredGames = this.getPlayerHasCard(filteredGames, filters.playerHasCard);

    return filteredGames;
  }

  private getAfterDate(games: Game[], afterDate: number) {
    if (!afterDate) return games;

    const toReturn: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (game.completionDate >= afterDate) toReturn.push(game);
    }

    return toReturn;
  }

  private getBeforeDate(games: Game[], beforeDate: number) {
    if (!beforeDate) return games;

    const toReturn: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (game.completionDate <= beforeDate) toReturn.push(game);
    }

    return toReturn;
  }

  private getPlayerHasCard(games: Game[], playerHasCards: PlayerHasCard) {
    if (!playerHasCards || playerHasCards['initial'] || Object.keys(playerHasCards).length === 0) return games;
    resetPlayerHasCardDeals();

    let fetchedDeals = [] as any;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        fetchedDeals = dealState.fetchedDeals;
      });

    const toReturn = [];
    const dealsThatMatch: string[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      
      let hasGameBeenAdded = false;
      for (let j = 0; j < game.deals.length; j++) {
        const dealId = game.deals[j];
        const deal = fetchedDeals[dealId];

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
        
        if (shouldAddDeal) {
          if (!hasGameBeenAdded) {
            hasGameBeenAdded = true;
            toReturn.push(game);
          }
          dealsThatMatch.push(dealId);
        }
      }
    }

    this.store.dispatch(new SetDealsThatMatchPlayerHasCardFilters(dealsThatMatch));

    return toReturn;
  }
}
