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
} from '@nx-bridge/store';
import { switchMap, take } from 'rxjs/operators';
import { flatten } from '@nx-bridge/constants';

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
    },
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    [this.filters.playerHasCard.string]: {initial: [1]},
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private store: Store<AppState>) {}

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
    if (!playerHasCards || playerHasCards['initial']) return games;

    let fetchedDeals = [] as any;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        fetchedDeals = dealState.fetchedDeals;
      });

    debugger;
    const toReturn = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      let canSkipToNextGame = false;
      for (let j = 0; j < game.deals.length; j++) {
        const dealId = game.deals[j];
        const deal = fetchedDeals[dealId];
        for (const username in playerHasCards) {
          if (Object.prototype.hasOwnProperty.call(playerHasCards, username)) {
            const cardToCheckFor = playerHasCards[username];
            const handToCheck = deal.hands[username];
            if (!handToCheck || handToCheck.length <= 0 ) break;
            const flatHand = flatten(handToCheck);
            if (flatHand.includes(cardToCheckFor)) {
              canSkipToNextGame = true;
              toReturn.push(game);
              break;
            }
          }
        }
        if (canSkipToNextGame) break;
      }
    }

    return toReturn;
  }
}
