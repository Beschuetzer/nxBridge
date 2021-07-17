import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  DateObj,
  DateType,
  Deal,
  FetchedDeals,
  FilterItem,
  FilterItemDeletion,
  FilterItems,
  Filters,
  Game,
  PlayerHasCard,
  PlayerInGame,
  ReducerNames,
  UserIds,
} from '@nx-bridge/interfaces-and-types';
import {
  AppState,
  SetBeforeDate,
  SetAfterDate,
  SetPlayerHasCard,
  SetFilteredGames,
  SetIsFilterSame,
  SetDealsThatMatchFilters,
  SetContractFilter,
  reducerDefaultValue,
  SetDeclarerFilter,
  SetOpeningBidFilter,
  SetDoubleFilter,
  SetPlayerInGameFilter,
  RemovePlayerHasCard,
  RemovePlayerInGameFilter,
} from '@nx-bridge/store';
import { switchMap, take } from 'rxjs/operators';
import {
  FILTER_MANAGER_CLASSNAME,
  flatten,
  getHtmlEntitySpan,
  NOT_AVAILABLE_STRING,
  resetMatchedDeals,
} from '@nx-bridge/constants';

@Injectable({
  providedIn: 'root',
})
export class FiltermanagerService {
  //#region NOTE: new filters need to be added inside this region
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
    dealsThatMatchFilters: {
      string: 'dealsThatMatchFilters',
    },
    contract: {
      string: 'contract',
    },
    declarer: {
      string: 'declarer',
    },
    openingBid: {
      string: 'openingBid',
    },
    double: {
      string: 'double',
    },
    playerInGame: {
      string: 'playerInGame',
      errorKey: 'playerInGame-error',
    },
  };
  public filtersInitial: Filters = {
    [this.filters.beforeDate.string]: 0,
    [this.filters.afterDate.string]: 0,
    [this.filters.playerHasCard.string]: { initial: [reducerDefaultValue] },
    [this.filters.dealsThatMatchFilters.string]: [`${reducerDefaultValue}`],
    [this.filters.contract.string]: `${reducerDefaultValue}`,
    [this.filters.declarer.string]: `${reducerDefaultValue}`,
    [this.filters.openingBid.string]: `${reducerDefaultValue}`,
    [this.filters.double.string]: reducerDefaultValue,
    [this.filters.playerInGame.string]: [`${reducerDefaultValue}`],
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
    [this.filters.dealsThatMatchFilters.string]: new SetDealsThatMatchFilters(
      this.filtersInitial?.dealsThatMatchFilters
    ),
    [this.filters.contract.string]: new SetContractFilter(
      this.filtersInitial?.contract
    ),
    [this.filters.declarer.string]: new SetDeclarerFilter(
      this.filtersInitial?.declarer
    ),
    [this.filters.openingBid.string]: new SetOpeningBidFilter(
      this.filtersInitial?.openingBid
    ),
    [this.filters.double.string]: new SetDoubleFilter(
      this.filtersInitial?.double
    ),
    [this.filters.playerInGame.string]: new SetPlayerInGameFilter(
      this.filtersInitial?.playerInGame
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
    contract: {
      valid: 'Contract was',
    },
    declarer: {
      valid: 'Declarer was',
    },
    openingBid: {
      valid: 'Opening bid was',
    },
    double: {
      valid: 'Deal was doubled',
    },
    playerInGame: {
      valid: 'was in the game',
      invalid: {
        tooMany: 'Only allowed to have four players in game',
        alreadyPresent: 'is already present',
      },
    },
  };
  //#endregion

  public inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];
  public dealsThatMatch: string[] = [];
  public users: UserIds | null = null;

  constructor(private store: Store<AppState>) {
    this.store.select(ReducerNames.users).subscribe((userState) => {
      this.users = userState.userIds;
    });
  }

  canResetDealsThatMatchFilters(filterItems: FilterItems) {
    //note: add keys of filters that DO NOT work on the deal level below
    const keysToCheckAgainst = [
      this.filters.afterDate.string,
      this.filters.beforeDate.string,
      `${this.filters.playerInGame.string}-0`,
      `${this.filters.playerInGame.string}-1`,
      `${this.filters.playerInGame.string}-2`,
      `${this.filters.playerInGame.string}-3`,
    ];

    const filterKeys = Object.keys(filterItems);
    for (let i = 0; i < filterKeys.length; i++) {
      const filterKey = filterKeys[i];
      if (!keysToCheckAgainst.includes(filterKey)) return false;
    }

    return true;
  }

  dispatchCorrectResetAction(toDelete: FilterItemDeletion) {
    if (toDelete.key.match(/playerHasCard\d+/i))
      return this.store.dispatch(
        new RemovePlayerHasCard({
          username: toDelete.username ? toDelete.username : '',
          card: toDelete.card !== undefined ? toDelete.card : -2,
        })
      );
    else if (toDelete.key.match(/playerInGame-\d+/i))
      return this.store.dispatch(
        new RemovePlayerInGameFilter(toDelete.username ? toDelete.username : '')
      );

    return this.store.dispatch(toDelete.resetAction);
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

  getAreDealsLoaded() {
    let areLoaded = false;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        areLoaded = Object.keys(dealState.fetchedDeals).length > 0;
      });
    return !areLoaded;
  }

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

  getIsSelectedCardUsedAlready(selectedCard: number) {
    if (selectedCard === -1) return false;
    let toReturn: string | boolean = false;
    this.store
      .select(ReducerNames.filters)
      .pipe(take(1))
      .subscribe((filterState) => {
        const playerHasCardFilters = filterState.playerHasCard;
        for (const username in playerHasCardFilters) {
          if (
            Object.prototype.hasOwnProperty.call(playerHasCardFilters, username)
          ) {
            const playerHasCardFilter = playerHasCardFilters[username];
            if (playerHasCardFilter.includes(selectedCard)) {
              toReturn = username;
              break;
            }
          }
        }
      });
    return toReturn;
  }

  getPlayerHasCardFilterItem(
    cardSelectElement: HTMLSelectElement,
    usernameSelectElement: HTMLSelectElement,
    selectedCard: number,
    selectedUsername: string
  ): [string, FilterItem] {
    const htmlEntitySpan = getHtmlEntitySpan(selectedCard);
    const filterItem: FilterItem = {
      elementsToReset: [cardSelectElement, usernameSelectElement],
      message: `'${selectedUsername}' had the ${htmlEntitySpan}`,
      error: '',
      username: selectedUsername,
      card: selectedCard,
    };

    const uniqueNumber = Math.round(Math.random() * Math.random() * 1000000000);
    const uniqueKey = `${this.filters.playerHasCard.string}${uniqueNumber}`;

    return [uniqueKey, filterItem];
  }

  getPlayerHasCardErrorMessage(
    usernameWhoHasCard: string,
    selectedCard: number
  ) {
    const htmlEntitySpan = getHtmlEntitySpan(selectedCard);
    const toAdd: FilterItem = {
      message: NOT_AVAILABLE_STRING,
      error: `${htmlEntitySpan} ${this.filterMsgs.playerHasCard.invalid} '${usernameWhoHasCard}'`,
      elementsToReset: [],
    };

    return toAdd;
  }

  getShouldResetStoreOnDeletion(toDelete: FilterItemDeletion) {
    const isPlayerHasCardError = toDelete.key.match(
      this.filters.playerHasCard.errorKey
    );

    const isPlayerInGameError = toDelete.key.match(
      this.filters.playerInGame.errorKey
    );

    return !isPlayerHasCardError && !isPlayerInGameError;
  }

  getUniquePlayerNames(deals: FetchedDeals) {
    if (!deals) return;

    const uniqueNames: string[] = [];

    for (const dealId in deals) {
      if (Object.prototype.hasOwnProperty.call(deals, dealId)) {
        const deal = deals[dealId];
        const usernames = Object.keys(deal.hands);
        for (let j = 0; j < usernames.length; j++) {
          const username = usernames[j];
          const index = uniqueNames.findIndex((name) => name === username);
          if (index === -1) uniqueNames.push(username);
        }
      }
    }

    return uniqueNames;
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

    const filterManagerApplied = document.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__applied`
    );
    const children = filterManagerApplied?.children;

    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        child.innerHTML = '';
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

  validateDate(
    date: string,
    dateType: DateType,
    beforeDate: DateObj,
    afterDate: DateObj
  ) {
    let isDateInvalid = false;
    let isSingle = true;

    const dateObj = new Date(date);
    const proposedTime = dateObj.getTime();
    const currentTime = Date.now() - 60001;

    const beforeOrAfterString =
      dateType === DateType.before ? 'before' : 'after';
    let exactErrorString = '';

    if (proposedTime >= currentTime && dateType === DateType.after) {
      exactErrorString = 'afterNow';
      isDateInvalid = true;
      if (beforeDate?.date) isSingle = false;
    } else if (beforeDate?.date && dateType === DateType.after) {
      isDateInvalid = beforeDate.date.getTime() <= proposedTime;
      isSingle = false;
    } else if (afterDate?.date && dateType === DateType.before) {
      isDateInvalid = afterDate.date.getTime() >= proposedTime;
      isSingle = false;
    } else isDateInvalid = !date;

    if (!exactErrorString) exactErrorString = isSingle ? 'single' : 'multiple';

    const filterMsgError = (this.filterMsgs.date[
      beforeOrAfterString as any
    ] as any).invalid[exactErrorString];

    return { isDateInvalid, dateObj, filterMsgError };
  }

  private applyFilters(games: Game[], filters: Filters) {
    let filteredGames: Game[] = games;

    //NOTE: add new filters here; arrange in order of least to most cpu intensive to minimize cpu load
    filteredGames = this.getBeforeDateMatches(
      filteredGames,
      filters.beforeDate
    );
    filteredGames = this.getAfterDateMatches(filteredGames, filters.afterDate);
    filteredGames = this.getPlayerInGameMatches(
      filteredGames,
      filters.playerInGame
    );
    filteredGames = this.runFiltersThatModifyDealsThatMatch(
      filteredGames,
      filters
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

  private getCanSkipContract(contract: string) {
    return contract === this.filtersInitial.contract;
  }

  private getCanSkipDeclarer(declarer: string) {
    return declarer === this.filtersInitial.declarer;
  }

  private getCanSkipDouble(multiplier: number) {
    return multiplier === this.filtersInitial.double;
  }

  private getCanSkipOpeningBid(bid: string) {
    return bid === this.filtersInitial.openingBid;
  }

  private getCanSkipPlayerHasCard(playerHasCards: PlayerHasCard) {
    if (
      !playerHasCards ||
      playerHasCards['initial'] ||
      Object.keys(playerHasCards).length === 0
    )
      return true;
    return false;
  }

  private getPassesContractFilter(contractToMatch: string, deal: Deal) {
    if (deal.contract === contractToMatch) return true;
    return false;
  }

  private getPassesDeclarerFilter(declarer: string, deal: Deal) {
    const declarerFromDeal = this.users ? this.users[deal.declarer] : null;
    return declarer === declarerFromDeal;
  }

  private getPassesDoubleFilter(multiplier: number, deal: Deal) {
    const doubleValue = deal?.doubleValue;
    if (!doubleValue) return false;
    return deal.doubleValue === multiplier;
  }

  private getPassesOpeningBidFilter(bid: string, deal: Deal) {
    let openingBid = '';
    for (let i = 0; i < deal.bids.length; i++) {
      const bid = deal.bids[i][1];
      if (bid.match(/pass/i) || bid.match(/double/i)) continue;
      else {
        openingBid = bid;
        break;
      }
    }

    return !!openingBid.match(new RegExp(bid, 'i'));
  }

  private getPassesPlayerHasCardFilter(
    playerHasCards: PlayerHasCard,
    deal: Deal
  ) {
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

  private getPlayerInGameMatches(games: Game[], playersInGame: PlayerInGame) {
    if (playersInGame.includes(`${reducerDefaultValue}`) || !playersInGame)
      return games;

    const toReturn: Game[] = [];
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const seating = game.room.seating;

      let canAdd = true;
      for (let i = 0; i < playersInGame.length; i++) {
        const userOfPlayerWhoMustBeInGame = playersInGame[i];
        const usersNamesInGame = Object.values(seating);
        if (!usersNamesInGame.includes(userOfPlayerWhoMustBeInGame)) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) toReturn.push(game);
    }
    return toReturn;
  }

  private runFiltersThatModifyDealsThatMatch(games: Game[], filters: Filters) {
    this.dealsThatMatch = [];

    //note: add skipping logic in here
    const canSkipPlayerHasCardFilter = this.getCanSkipPlayerHasCard(
      filters.playerHasCard
    );
    const canSkipContractFilter = this.getCanSkipContract(filters.contract);
    const canSkipDeclarerFilter = this.getCanSkipDeclarer(filters.declarer);
    const canSkipDoubleFilter = this.getCanSkipDouble(filters.double);
    const canSkipOpeningBidFilter = this.getCanSkipOpeningBid(
      filters.openingBid
    );
    const canSkip =
      canSkipContractFilter &&
      canSkipPlayerHasCardFilter &&
      canSkipDeclarerFilter &&
      canSkipOpeningBidFilter &&
      canSkipDoubleFilter;
    if (canSkip) return games;

    resetMatchedDeals();

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

        //note: add filter logic here
        let shouldAddDeal = true;

        if (!canSkipContractFilter && shouldAddDeal)
          shouldAddDeal = this.getPassesContractFilter(filters.contract, deal);

        if (!canSkipDeclarerFilter && shouldAddDeal)
          shouldAddDeal = this.getPassesDeclarerFilter(filters.declarer, deal);

        if (!canSkipOpeningBidFilter && shouldAddDeal)
          shouldAddDeal = this.getPassesOpeningBidFilter(
            filters.openingBid,
            deal
          );

        if (!canSkipDoubleFilter && shouldAddDeal)
          shouldAddDeal = this.getPassesDoubleFilter(filters.double, deal);

        if (!canSkipPlayerHasCardFilter && shouldAddDeal)
          shouldAddDeal = this.getPassesPlayerHasCardFilter(
            filters.playerHasCard,
            deal
          );

        if (shouldAddDeal) {
          if (!hasGameBeenAdded) {
            hasGameBeenAdded = true;
            toReturn.push(game);
          }
          this.dealsThatMatch = [...this.dealsThatMatch, dealId];
        }
      }
    }

    this.store.dispatch(new SetDealsThatMatchFilters(this.dealsThatMatch));

    return toReturn;
  }
}
