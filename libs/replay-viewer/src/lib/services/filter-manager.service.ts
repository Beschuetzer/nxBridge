import { ElementRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CanSkipFilters,
  DateObj,
  DateType,
  DealRelevant,
  FetchedDeals,
  FilterItem,
  FilterItemDeletion,
  FilterItems,
  Filters,
  GameRelevant,
  PlayerHasCard,
  PlayerInGame,
  ReducerNames,
  UserIds,
  WonBy,
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
  SetWonByFilter,
  SetGameNameFilter,
  SetDealResultFilter,
} from '@nx-bridge/store';
import { switchMap, take } from 'rxjs/operators';
import {
  FILTER_MANAGER_CLASSNAME,
  flatten,
  getHtmlEntitySpan,
  NOT_AVAILABLE_STRING,
  resetMatchedDeals,
} from '@nx-bridge/constants';
import { ReplayViewerDealService } from './replay-viewer.deal.service';

@Injectable({
  providedIn: 'root',
})
export class FiltermanagerService {
  //#region NOTE: new filters need to be added inside this region
  public filters = {
    afterDate: {
      string: 'afterDate',
      errorKey: 'afterDate-error',
    },
    beforeDate: {
      string: 'beforeDate',
      errorKey: 'beforeDate-error',
    },
    contract: {
      string: 'contract',
      errorKey: 'contract-error',
    },
    dealResult: {
      string: 'dealResult',
      errorKey: 'dealResult-error',
    },
    dealsThatMatchFilters: {
      string: 'dealsThatMatchFilters',
    },
    declarer: {
      string: 'declarer',
      errorKey: 'declarer-error',
    },
    double: {
      string: 'double',
      errorKey: 'double-error',
    },
    gameName: {
      string: 'gameName',
      errorKey: 'gameName-error',
    },
    openingBid: {
      string: 'openingBid',
      errorKey: 'openingBid-error',
    },
    playerHasCard: {
      string: 'playerHasCard',
      errorKey: 'playerHasCardError',
    },
    playerInGame: {
      string: 'playerInGame',
      errorKey: 'playerInGame-error',
    },
    wonBy: {
      string: 'wonBy',
      errorKey: 'wonBy-error',
    },
  };
  public filtersInitial: Filters = {
    [this.filters.afterDate.string]: 0,
    [this.filters.beforeDate.string]: 0,
    [this.filters.contract.string]: `${reducerDefaultValue}`,
    [this.filters.dealResult.string]: `${reducerDefaultValue}`,
    [this.filters.dealsThatMatchFilters.string]: [`${reducerDefaultValue}`],
    [this.filters.declarer.string]: `${reducerDefaultValue}`,
    [this.filters.double.string]: reducerDefaultValue,
    [this.filters.gameName.string]: `${reducerDefaultValue}`,
    [this.filters.openingBid.string]: `${reducerDefaultValue}`,
    [this.filters.playerHasCard.string]: { initial: [reducerDefaultValue] },
    [this.filters.playerInGame.string]: [`${reducerDefaultValue}`],
    [this.filters.wonBy.string]: reducerDefaultValue,
  };
  public filterResetActions = {
    [this.filters.afterDate.string]: new SetAfterDate(
      this.filtersInitial?.afterDate
    ),
    [this.filters.beforeDate.string]: new SetBeforeDate(
      this.filtersInitial?.beforeDate
    ),
    [this.filters.contract.string]: new SetContractFilter(
      this.filtersInitial?.contract
    ),
    [this.filters.dealResult.string]: new SetDealResultFilter(
      this.filtersInitial?.dealResult
    ),
    [this.filters.dealsThatMatchFilters.string]: new SetDealsThatMatchFilters(
      this.filtersInitial?.dealsThatMatchFilters
    ),
    [this.filters.declarer.string]: new SetDeclarerFilter(
      this.filtersInitial?.declarer
    ),
    [this.filters.double.string]: new SetDoubleFilter(
      this.filtersInitial?.double
    ),
    [this.filters.gameName.string]: new SetGameNameFilter(
      this.filtersInitial?.gameName
    ),
    [this.filters.openingBid.string]: new SetOpeningBidFilter(
      this.filtersInitial?.openingBid
    ),
    [this.filters.playerHasCard.string]: new SetPlayerHasCard(
      this.filtersInitial?.playerHasCard
    ),
    [this.filters.playerInGame.string]: new SetPlayerInGameFilter(
      this.filtersInitial?.playerInGame
    ),
    [this.filters.wonBy.string]: new SetWonByFilter(this.filtersInitial?.wonBy),
  };
  public filterMsgs: { [key: string]: any } = {
    contract: {
      valid: 'Contract was',
    },
    dealResult: {
      valid: 'Deal result',
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
    declarer: {
      valid: 'Declarer was',
    },
    double: {
      valid: 'Deal was doubled',
    },
    gameName: {
      valid: 'Game was named',
    },
    none: 'No Filters applied',
    openingBid: {
      valid: 'Opening bid was',
    },
    playerHasCard: {
      valid: '',
      invalid: 'already set to',
    },
    playerInGame: {
      valid: 'was in the game',
      invalid: {
        tooMany: 'Only allowed to have four players in game',
        alreadyPresent: 'is already present',
      },
    },
    wonBy: {
      valid: {
        pre: 'Game won by',
        post: 'points.',
      },
    },
  };
  //#endregion

  public inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];
  public dealsThatMatch: string[] = [];
  public users: UserIds | null = null;

  constructor(
    private store: Store<AppState>,
    private replayViewerDealService: ReplayViewerDealService
  ) {
    this.store.select(ReducerNames.users).subscribe((userState) => {
      this.users = userState.userIds;
    });
  }

  //#region Public Methods
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

  filterGames(games: GameRelevant[]) {
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

  getUniqueGameNames(games: GameRelevant[]) {
    if (!games) return;

    const uniqueNames: string[] = [];

    for (let i = 0; i < games.length; i++) {
      const gameName = games[i].room.name;
      if (!uniqueNames.includes(gameName)) uniqueNames.push(gameName);
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
  //#endregion

  private applyFilters(games: GameRelevant[], filters: Filters) {
    this.dealsThatMatch = [];

    //note: add skipping logic in here
    const canSkip = this.getCanSkipFilters(filters);

    if (canSkip.all) return games;

    resetMatchedDeals();

    let fetchedDeals = [] as any;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        fetchedDeals = dealState.fetchedDeals;
      });

    //note: need to add deal-level filter canSkip logic below
    const canSkipDealIteration = this.getCanSkipDealIteration(canSkip);

    const toReturn = [];

    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      //note: add game level filters here following this pattern
      const hasPassedGameFilters = this.getPassesGameFilters(
        game,
        filters,
        canSkip
      );
      let gameAddedAlready = false;

      if (hasPassedGameFilters && canSkipDealIteration) {
        toReturn.push(game);
        gameAddedAlready = true;
      }
      if (canSkipDealIteration) continue;

      let shouldAddGame = false;
      for (let j = 0; j < game.deals.length; j++) {
        const dealId = game.deals[j];
        const deal = fetchedDeals[dealId];

        //note: add deal level filters here following pattern inside
        const canAddDeal = this.getCanAddDeal(deal, filters, canSkip);

        if (canAddDeal) {
          if (!shouldAddGame && !gameAddedAlready && hasPassedGameFilters) {
            shouldAddGame = true;
            toReturn.push(game);
          }
          if (hasPassedGameFilters)
            this.dealsThatMatch = [...this.dealsThatMatch, dealId];
        }
      }
    }

    if (this.dealsThatMatch.length > 0)
      this.store.dispatch(new SetDealsThatMatchFilters(this.dealsThatMatch));

    return toReturn;
  }

  //#region ApplyFilters Helpers
  private getCanSkipFilters(filters: Filters): CanSkipFilters {
    const canSkipAfterDate = this.getCanSkipAfterDate(filters.afterDate);
    const canSkipBeforeDate = this.getCanSkipBeforeDate(filters.beforeDate);
    const canSkipContract = this.getCanSkipContract(filters.contract);
    const canSkipDeclarer = this.getCanSkipDeclarer(filters.declarer);
    const canSkipDouble = this.getCanSkipDouble(filters.double);
    const canSkipGameName = this.getCanSkipGameName(filters.gameName);
    const canSkipOpeningBid = this.getCanSkipOpeningBid(filters.openingBid);
    const canSkipPlayerHasCard = this.getCanSkipPlayerHasCard(
      filters.playerHasCard
    );
    const canSkipPlayerInGame = this.getCanSkipPlayerInGame(
      filters.playerInGame
    );
    const canSkipWonBy = this.getCanSkipWonBy(filters.wonBy);

    return {
      all:
        canSkipAfterDate &&
        canSkipBeforeDate &&
        canSkipContract &&
        canSkipDeclarer &&
        canSkipDouble &&
        canSkipGameName &&
        canSkipOpeningBid &&
        canSkipPlayerHasCard &&
        canSkipPlayerInGame &&
        canSkipWonBy,
      afterDate: canSkipAfterDate,
      beforeDate: canSkipBeforeDate,
      contract: canSkipContract,
      declarer: canSkipDeclarer,
      double: canSkipDouble,
      gameName: canSkipGameName,
      openingBid: canSkipOpeningBid,
      playerHasCard: canSkipPlayerHasCard,
      playerInGame: canSkipPlayerInGame,
      wonBy: canSkipWonBy,
    };
  }

  private getCanAddDeal(
    deal: DealRelevant,
    filters: Filters,
    canSkip: CanSkipFilters
  ) {
    let shouldAddDeal = true;

    if (!canSkip.contract && shouldAddDeal)
      shouldAddDeal = this.getPassesContractFilter(filters.contract, deal);

    if (!canSkip.declarer && shouldAddDeal)
      shouldAddDeal = this.getPassesDeclarerFilter(filters.declarer, deal);

    if (!canSkip.openingBid && shouldAddDeal)
      shouldAddDeal = this.getPassesOpeningBidFilter(filters.openingBid, deal);

    if (!canSkip.double && shouldAddDeal)
      shouldAddDeal = this.getPassesDoubleFilter(filters.double, deal);

    if (!canSkip.playerHasCard && shouldAddDeal)
      shouldAddDeal = this.getPassesPlayerHasCardFilter(
        filters.playerHasCard,
        deal
      );

    return shouldAddDeal;
  }

  private getPassesGameFilters(
    game: GameRelevant,
    filters: Filters,
    canSkip: CanSkipFilters
  ) {
    let shouldAddGame = true;

    if (!canSkip.afterDate && shouldAddGame)
      shouldAddGame = this.getPassesAfterDate(filters.afterDate, game);

    if (!canSkip.beforeDate && shouldAddGame)
      shouldAddGame = this.getPassesBeforeDate(filters.beforeDate, game);

    if (!canSkip.gameName && shouldAddGame)
      shouldAddGame = this.getPassesGameName(filters.gameName, game);

    if (!canSkip.wonBy && shouldAddGame)
      shouldAddGame = this.getPassesWonBy(filters.wonBy, game);

    if (!canSkip.playerInGame && shouldAddGame)
      shouldAddGame = this.getPassesPlayerInGame(filters.playerInGame, game);

    return shouldAddGame;
  }

  private getCanSkipDealIteration(canSkip: CanSkipFilters) {
    //note: prevents unnecessary deal iterations when all deal level filters will be skipped anyway
    return (
      canSkip.contract &&
      canSkip.declarer &&
      canSkip.openingBid &&
      canSkip.double &&
      canSkip.playerHasCard
    );
  }
  //#endregion

  //#region getCanSkip functions
  private getCanSkipAfterDate(afterDate: number) {
    if (!afterDate) return true;
    return false;
  }

  private getCanSkipBeforeDate(beforeDate: number) {
    if (!beforeDate) return true;
    return false;
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

  private getCanSkipGameName(gameName: string) {
    return gameName === `${reducerDefaultValue}` || !gameName;
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

  private getCanSkipPlayerInGame(playersInGame: PlayerInGame) {
    if (playersInGame.includes(`${reducerDefaultValue}`) || !playersInGame)
      return true;
    return false;
  }

  private getCanSkipWonBy(wonBy: WonBy) {
    if (
      !wonBy ||
      !wonBy.type ||
      (wonBy.type !== 'less' && wonBy.type !== 'more') ||
      wonBy.amount === undefined ||
      wonBy.amount === null ||
      wonBy.amount === reducerDefaultValue
    )
      return true;
    return false;
  }
  //#endregion

  //#region getPasses functions
  private getPassesAfterDate(afterDate: number, game: GameRelevant) {
    if (game.completionDate >= afterDate) return true;
    return false;
  }

  private getPassesBeforeDate(beforeDate: number, game: GameRelevant) {
    if (game.completionDate <= beforeDate) return true;
    return false;
  }

  private getPassesContractFilter(contractToMatch: string, deal: DealRelevant) {
    if (deal.contract === contractToMatch) return true;
    return false;
  }

  private getPassesDeclarerFilter(declarer: string, deal: DealRelevant) {
    const declarerFromDeal = this.users ? this.users[deal.declarer] : null;
    return declarer === declarerFromDeal;
  }

  private getPassesDoubleFilter(multiplier: number, deal: DealRelevant) {
    const doubleValue = deal?.doubleValue;
    if (!doubleValue) return false;
    return deal.doubleValue === multiplier;
  }

  private getPassesGameName(gameName: string, game: GameRelevant) {
    return game.room.name === gameName; 
  }

  private getPassesOpeningBidFilter(bid: string, deal: DealRelevant) {
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
    deal: DealRelevant
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

  private getPassesPlayerInGame(
    playersInGame: PlayerInGame,
    game: GameRelevant
  ) {
    const seating = game.room.seating;
    if (!seating) return true;

    for (let i = 0; i < playersInGame.length; i++) {
      const userOfPlayerWhoMustBeInGame = playersInGame[i];
      const usersNamesInGame = Object.values(seating);
      if (!usersNamesInGame.includes(userOfPlayerWhoMustBeInGame)) return false;
    }
    return true;
  }

  private getPassesWonBy(wonBy: WonBy, game: GameRelevant) {
    const lastDeal = game.deals[game.deals.length - 1];
    const deal = this.replayViewerDealService.getDealFromStore(lastDeal);
    if (!deal.northSouth || !deal.eastWest) return true;
    const nsTotal =
      deal.northSouth.aboveTheLine + deal.northSouth.totalBelowTheLineScore;
    const ewTotal =
      deal.eastWest.aboveTheLine + deal.eastWest.totalBelowTheLineScore;
    const gameWonByAmount = Math.abs(nsTotal - ewTotal);

    if (wonBy.type === 'less' && gameWonByAmount <= wonBy.amount) {
      return true;
    } else if (wonBy.type === 'more' && gameWonByAmount >= wonBy.amount)
      return true;

    return false;
  }
  //#endregion
}
