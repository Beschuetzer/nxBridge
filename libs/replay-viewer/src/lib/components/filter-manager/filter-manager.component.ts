import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FILTER_MANAGER_CLASSNAME,
  getDateAndTimeString,
  getHtmlEntitySpan,
  maxCardValue,
  minCardValue,
  NOT_AVAILABLE_STRING,
  resetMatchedDeals,
  filterManagerContracts,
  filterManagerCardsAsNumbers,
  filterManagerPlayerNames,
  contracts,
  getContractAsHtmlEntityString,
  filterManagerBids,
  filterManagerDoubleOptions,
  rootRoute,
} from '@nx-bridge/constants';
import {
  AddPlayerHasCard,
  AddPlayerInGameFilter,
  AppState,
  reducerDefaultValue,
  RemovePlayerHasCard,
  RemovePlayerInGameFilter,
  SetAfterDate,
  SetBeforeDate,
  SetContractFilter,
  SetDeclarerFilter,
  SetDoubleFilter,
  SetIsFilterSame,
  SetOpeningBidFilter,
  SetPlayerHasCard,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  DateType,
  FilterItem,
  PlayerHasCard,
  ReducerNames,
  FetchedDeals,
  DateObj,
  FilterItems,
  FilterItemDeletion,
  PlayerInGame,
} from '@nx-bridge/interfaces-and-types';
import { SearchService } from '../../services/search.service';
import { FiltermanagerService } from '../../services/filter-manager.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'nx-bridge-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
export class FilterManagerComponent implements OnInit {
  //NOTE: new checkboxes need to be added to resetFilterCheckboxes() in reset()
  @ViewChild('game') gameCheckbox: ElementRef | null = null;
  @ViewChild('playerInGame') playerInGameCheckbox: ElementRef | null = null;

  @ViewChild('date') dateCheckbox: ElementRef | null = null;

  @ViewChild('deal') dealCheckbox: ElementRef | null = null;
  @ViewChild('playerHasCard') playerHasCardCheckbox: ElementRef | null = null;
  @ViewChild('contract') contractCheckbox: ElementRef | null = null;
  @ViewChild('declarer') declarerCheckbox: ElementRef | null = null;
  @ViewChild('openingBid') openingBidCheckbox: ElementRef | null = null;
  @ViewChild('double') doubleCheckbox: ElementRef | null = null;

  //NOTE: new filters need to be added to filterManagerService's filter objects and applyFilters();  remember: to set store action 'SetIsFilterSame' to false before calling searchService.setCurrentlyDisplayingGames() to make sure filters are checked; also need to make sure that key returned in FilterManagerItem's getKeyToUse is correct; add another deleteError call in private deleteErrors() if filter has an error state; make sure that dispatchCorrectResetAction() dispatches correct action for item deletion;  if filter does not work on the deal level (e.g. contract was...) then add key name in canResetDealsThatMatchFilters();
  @ViewChild('beforeDate') beforeDateFilterElement: ElementRef | null = null;
  @ViewChild('afterDate') afterDateFilterElement: ElementRef | null = null;
  @ViewChild('players') playersFilterElement: ElementRef | null = null;
  @ViewChild('cards') cardsFilterElement: ElementRef | null = null;
  @ViewChild('contractsSelect')
  contractsFilterElement: ElementRef | null = null;
  @ViewChild('declarerSelect') declarerFilterElement: ElementRef | null = null;
  @ViewChild('openingBidSelect')
  openingBidFilterElement: ElementRef | null = null;
  @ViewChild('doubleSelect') doubleFilterElement: ElementRef | null = null;
  @ViewChild('playerInGameSelect')
  playerInGameFilterElement: ElementRef | null = null;

  @HostBinding('class.filter-manager') get classname() {
    return true;
  }
  @HostBinding('class.hidden') get toggleHidden() {
    return this.getAreDealsLoaded();
  }
  @HostBinding('class.d-none') get toggleDisplayNone() {
    return this.router.url === `/${rootRoute}`;
  }
  @HostBinding('class.announce-self') get toggleAnnounceSelf() {
    return !this.getAreDealsLoaded();
  }

  private lastButtonPressed: EventTarget | null = null;
  private hasPlayerHasCardChanged = false;
  private beforeDateElement: HTMLElement = this.getNewElement('div');
  private afterDateElement: HTMLElement = this.getNewElement('div');

  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };
  public FILTER_MANANGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;
  public filterItems: FilterItems = {};
  public contracts = [...filterManagerContracts, ...contracts];
  public bids = [...filterManagerBids, ...contracts];
  public cardsAsNumbers = filterManagerCardsAsNumbers;
  public playerNames = filterManagerPlayerNames;
  public doubleOptions = filterManagerDoubleOptions;

  get joinedInputErrorClassnames() {
    return this.filterManagerService.inputErrorClassnames.join(' ');
  }

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private searchService: SearchService,
    private filterManagerService: FiltermanagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      if (dealState.fetchedDeals)
        this.populatePlayerNames(dealState.fetchedDeals);
    });
  }

  onAddContract(e: Event) {
    const eventTarget = e.currentTarget || e.target;
    if (!this.getCanAdd(e, eventTarget as EventTarget)) return;

    const contractsSelectElement = this.contractsFilterElement
      ?.nativeElement as HTMLSelectElement;
    const selectedContract = contracts[+contractsSelectElement.value];
    if (!selectedContract) return;

    this.lastButtonPressed = eventTarget;

    this.store.dispatch(new SetContractFilter(selectedContract));
    this.store.dispatch(new SetIsFilterSame(false));
    this.searchService.setCurrentlyDisplayingGames();

    this.filterManagerService.setInputErrorClassnames(
      contractsSelectElement,
      true
    );

    const filterItem: FilterItem = {
      message: `${
        this.filterManagerService.filterMsgs.contract.valid
      } ${getContractAsHtmlEntityString(selectedContract)}.`,
      error: '',
      elementsToReset: [contractsSelectElement],
    };

    this.filterItems[
      this.filterManagerService.filters.contract.string
    ] = filterItem;
  }

  onAddDeclarer(e: Event) {
    const eventTarget = e.currentTarget || e.target;
    if (!this.getCanAdd(e, eventTarget as EventTarget)) return;

    const declarerSelectElement = this.declarerFilterElement
      ?.nativeElement as HTMLSelectElement;
    const selectedDeclarer = declarerSelectElement.value;
    if (selectedDeclarer === this.playerNames[0]) return;
    this.lastButtonPressed = eventTarget;

    this.store.dispatch(new SetDeclarerFilter(selectedDeclarer));
    this.store.dispatch(new SetIsFilterSame(false));
    this.searchService.setCurrentlyDisplayingGames();

    const filterItem: FilterItem = {
      message: `${this.filterManagerService.filterMsgs.declarer.valid} ${selectedDeclarer}.`,
      error: '',
      elementsToReset: [declarerSelectElement],
    };

    this.filterItems[
      this.filterManagerService.filters.declarer.string
    ] = filterItem;
  }

  onAddDouble(e: Event) {
    const eventTarget = e.currentTarget || e.target;
    if (!this.getCanAdd(e, eventTarget as EventTarget)) return;

    const doubleSelectOption = this.doubleFilterElement
      ?.nativeElement as HTMLSelectElement;
    const selectedMultiplier = +doubleSelectOption.value;

    if (!selectedMultiplier || isNaN(selectedMultiplier)) return;
    this.lastButtonPressed = eventTarget;

    this.store.dispatch(new SetIsFilterSame(false));
    this.store.dispatch(new SetDoubleFilter(selectedMultiplier));
    this.searchService.setCurrentlyDisplayingGames();

    const filterItem: FilterItem = {
      message: `${this.filterManagerService.filterMsgs.double.valid} ${
        selectedMultiplier === 2 ? 'Once' : 'Twice'
      }`,
      error: '',
      elementsToReset: [doubleSelectOption],
    };

    this.filterItems[
      this.filterManagerService.filters.double.string
    ] = filterItem;
  }

  onAddOpeningBid(e: Event) {
    const eventTarget = e.currentTarget || e.target;
    if (!this.getCanAdd(e, eventTarget as EventTarget)) return;

    const openingBidSelect = this.openingBidFilterElement
      ?.nativeElement as HTMLSelectElement;
    const selectedBid = contracts[+openingBidSelect.value];

    if (!selectedBid) return;

    this.lastButtonPressed = eventTarget;
    this.store.dispatch(new SetOpeningBidFilter(selectedBid));
    this.store.dispatch(new SetIsFilterSame(false));
    this.searchService.setCurrentlyDisplayingGames();

    const filterItem: FilterItem = {
      message: `${
        this.filterManagerService.filterMsgs.openingBid.valid
      } ${getContractAsHtmlEntityString(selectedBid)}`,
      error: '',
      elementsToReset: [openingBidSelect],
    };

    this.filterItems[
      this.filterManagerService.filters.openingBid.string
    ] = filterItem;
  }

  onAddPlayerHasCard(e: Event) {
    const eventTarget = e.currentTarget || e.target;

    const cardSelectElement = this.cardsFilterElement
      ?.nativeElement as HTMLSelectElement;
    const usernameSelectElement = this.playersFilterElement
      ?.nativeElement as HTMLSelectElement;

    const selectedCard = +cardSelectElement?.value;
    const selectedUsername = usernameSelectElement?.value;

    const isSelectedCardUsedAlready = this.getIsSelectedCardUsedAlready(
      selectedCard
    );
    if (isSelectedCardUsedAlready) {
      if (this.hasPlayerHasCardChanged)
        this.getPlayerHasCardErrorMessage(
          isSelectedCardUsedAlready as any,
          selectedCard
        );
      return;
    }

    this.lastButtonPressed = eventTarget;
    delete this.filterItems[
      this.filterManagerService.filters.playerHasCard.errorKey
    ];

    let shouldRemoveCardErrors = false;
    let shouldRemoveUsernameErrors = false;
    if (selectedCard >= minCardValue && selectedCard <= maxCardValue)
      shouldRemoveCardErrors = true;
    if (!selectedUsername.match(this.playerNames[0]))
      shouldRemoveUsernameErrors = true;

    this.filterManagerService.setInputErrorClassnames(
      cardSelectElement,
      shouldRemoveCardErrors
    );
    this.filterManagerService.setInputErrorClassnames(
      usernameSelectElement,
      shouldRemoveUsernameErrors
    );

    if (shouldRemoveCardErrors && shouldRemoveUsernameErrors) {
      let playerHasCard: PlayerHasCard = {};
      this.store
        .select(ReducerNames.filters)
        .pipe(take(1))
        .subscribe((filterState) => {
          playerHasCard = filterState.playerHasCard;
          const currentUsernameCards = playerHasCard[selectedUsername];
          const isInitialPresent = playerHasCard['initial'];
          if (!isInitialPresent && currentUsernameCards?.includes(selectedCard))
            return;

          if (isInitialPresent)
            this.store.dispatch(
              new SetPlayerHasCard({ [selectedUsername]: [selectedCard] })
            );
          else
            this.store.dispatch(
              new AddPlayerHasCard({ [selectedUsername]: [selectedCard] })
            );
          this.store.dispatch(new SetIsFilterSame(false));
          this.searchService.setCurrentlyDisplayingGames();
          this.addPlayerHasCardToFilterItems(
            cardSelectElement,
            usernameSelectElement,
            selectedCard,
            selectedUsername
          );

          this.hasPlayerHasCardChanged = false;
        });
    }
  }

  onAddPlayerInGame(e: Event) {
    const eventTarget = e.currentTarget || e.target;

    const playerInGameSelect = this.playerInGameFilterElement
      ?.nativeElement as HTMLSelectElement;
    const selectedPlayerInGame = playerInGameSelect.value;

    let currentPlayerInGame: PlayerInGame = [];
    this.store
      .select(ReducerNames.filters)
      .pipe(take(1))
      .subscribe((filterState) => {
        currentPlayerInGame = filterState.playerInGame;
      });

    if (selectedPlayerInGame === filterManagerPlayerNames[0]) return;
    this.lastButtonPressed = eventTarget;

    const isTooMany = currentPlayerInGame.length >= 4;
    const isAlreadyPresent = currentPlayerInGame.includes(selectedPlayerInGame);
    const error = isAlreadyPresent
      ? `${selectedPlayerInGame} ${this.filterManagerService.filterMsgs.playerInGame.invalid.alreadyPresent}`
      : isTooMany
      ? this.filterManagerService.filterMsgs.playerInGame.invalid.tooMany
      : '';

    const filterItem: FilterItem = {
      message: `'${selectedPlayerInGame}' ${this.filterManagerService.filterMsgs.playerInGame.valid}`,
      error,
      elementsToReset: [playerInGameSelect],
      username: selectedPlayerInGame,
    };

    if (isTooMany || isAlreadyPresent)
      this.filterItems[
        `${this.filterManagerService.filters.playerInGame.string}-error`
      ] = filterItem;
    else {
      this.store.dispatch(new AddPlayerInGameFilter(selectedPlayerInGame));
      this.store.dispatch(new SetIsFilterSame(false));
      this.searchService.setCurrentlyDisplayingGames();

      const indexToUse = currentPlayerInGame.includes(`${reducerDefaultValue}`)
        ? '0'
        : currentPlayerInGame.length;
      this.filterItems[
        `${this.filterManagerService.filters.playerInGame.string}-${indexToUse}`
      ] = filterItem;
      delete this.filterItems[
        `${this.filterManagerService.filters.playerInGame.string}-error`
      ];
    }
  }

  onContractChange() {this.lastButtonPressed = null}
  onContractClick() {}

  //NOTE: need this to trigger *ngIf properly
  onDateClick(e: Event) {
    return;
  }

  onDateBeforeChange(e: Event) {
    this.lastButtonPressed = null;
    const shouldDispatchChange = this.handleDateChange(e, DateType.before);
    this.dispatchChanges(
      this.beforeDate,
      shouldDispatchChange,
      DateType.before
    );
  }

  onDeclarerChange() {this.lastButtonPressed = null}

  onDateAfterChange(e: Event) {
    this.lastButtonPressed = null
    const shouldDispatchChange = this.handleDateChange(e, DateType.after);
    this.dispatchChanges(this.afterDate, shouldDispatchChange, DateType.after);
  }

  onDeclarerClick() {}

  onDoubleClick() {}
  onDoubleChange() {this.lastButtonPressed = null}

  onFilterItemDeletion(toDelete: FilterItemDeletion) {
    if (!toDelete.key) throw new Error('No toDelete.key...');
    delete this.filterItems[toDelete.key];

    const shouldResetStore = this.getShouldResetStoreOnDeletion(toDelete);
    if (shouldResetStore) {
      //note: need to verify correct action is being dispatched when adding new filter
      this.dispatchCorrectResetAction(toDelete);
      this.store.dispatch(new SetIsFilterSame(false));
      this.searchService.setCurrentlyDisplayingGames();
      this.removeBothDatesIfOneHasError(toDelete);
    }

    //note: this is here to remove errors when valid filter is deleted
    //add another deleteError call inside deleteErrors when adding a new filter
    this.deleteErrors(toDelete);

    if (this.canResetDealsThatMatchFilters()) {
      this.store.dispatch(
        this.filterManagerService.filterResetActions.dealsThatMatchFilters
      );
    }
  }

  //NOTE: need this to trigger *ngIf properly
  onGameClick(e: Event) {
    return;
  }

  onPlayerInGameChange() {this.lastButtonPressed = null}
  onPlayerInGameClick() {}

  onPlayerHasCardChange() {
    this.lastButtonPressed = null
    this.hasPlayerHasCardChanged = true;
  }

  onPlayerHasCardClick() {}

  //NOTE: need this to trigger *ngIf properly
  onDealClick(e: Event) {
    return;
  }

  onOpeningBidChange() {this.lastButtonPressed = null}

  onOpeningBidClick() {}

  onReset() {
    const filterCheckboxElements = [
      this.gameCheckbox,
      this.dateCheckbox,
      this.dealCheckbox,
    ];
    const filterElements = [
      this.beforeDateFilterElement,
      this.afterDateFilterElement,
    ];

    this.beforeDate.date = null;
    this.afterDate.date = null;
    this.filterItems = {};

    this.filterManagerService.resetElements(
      filterCheckboxElements as ElementRef[],
      'checked',
      false
    );
    this.filterManagerService.resetElements(
      filterElements as ElementRef[],
      'value',
      ''
    );
    this.filterManagerService.reset();

    //NOTE: this could be any filter as long as it gets called (in order to show all un-filtered games)
    this.dispatchChanges(this.afterDate, true, DateType.after);
    resetMatchedDeals();
  }

  private addPlayerHasCardToFilterItems(
    cardSelectElement: HTMLSelectElement,
    usernameSelectElement: HTMLSelectElement,
    selectedCard: number,
    selectedUsername: string
  ) {
    const htmlEntitySpan = getHtmlEntitySpan(selectedCard);
    const filterItem: FilterItem = {
      elementsToReset: [cardSelectElement, usernameSelectElement],
      message: `'${selectedUsername}' had the ${htmlEntitySpan}`,
      error: '',
      username: selectedUsername,
      card: selectedCard,
    };

    const uniqueNumber = Math.round(Math.random() * Math.random() * 1000000000);
    const uniqueKey = `${this.filterManagerService.filters.playerHasCard.string}${uniqueNumber}`;

    this.filterItems[uniqueKey] = filterItem;
  }

  private appendFiltersToAppliedDiv() {
    const filterManager = this.elRef.nativeElement as HTMLElement;
    const appliedDiv = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__applied`
    );
    if (!appliedDiv) return;

    this.renderer.appendChild(appliedDiv, this.afterDateElement);
    this.renderer.appendChild(appliedDiv, this.beforeDateElement);
  }

  private getCanAdd(e: Event, eventTarget: EventTarget) {
    return this.lastButtonPressed !== eventTarget;
  }

  private deleteError(toDelete: FilterItemDeletion, key: string, errorKey: string) {
    const shouldDelete = toDelete.key.match(key);
    if (shouldDelete) {
      delete this.filterItems[errorKey];
    }
  }

  private deleteErrors(toDelete: FilterItemDeletion) {
    //note: this assumes error keys and valid keys start with the same string (e.g. 'playerInGame-1' and 'playerInGame-error');
    this.deleteError(toDelete, this.filterManagerService.filters.playerHasCard.string, this.filterManagerService.filters.playerHasCard.errorKey);
    this.deleteError(toDelete, this.filterManagerService.filters.playerInGame.string, this.filterManagerService.filters.playerInGame.errorKey);
  }

  private dispatchChanges(
    filterName: DateObj,
    shouldDispatchChange: boolean,
    dateType: DateType
  ) {
    let dateToDispatch = filterName.date?.getTime();

    if (!shouldDispatchChange) {
      dateToDispatch = -1;
    } else {
      this.store.dispatch(new SetIsFilterSame(false));
    }

    if (dateType === DateType.before)
      this.store.dispatch(new SetBeforeDate(dateToDispatch as number));
    else this.store.dispatch(new SetAfterDate(dateToDispatch as number));

    this.searchService.setCurrentlyDisplayingGames();
  }

  private dispatchCorrectResetAction(toDelete: FilterItemDeletion) {
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

  private getCorrectFilter(dateType: DateType) {
    let filterName = this.beforeDate;
    let filterNameElement = this.beforeDateElement;
    let filterMsg = this.filterManagerService.filterMsgs.date.before.valid;

    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterNameElement = this.afterDateElement;
      filterMsg = this.filterManagerService.filterMsgs.date.after.valid;
    }

    return { filterMsg, filterName, filterNameElement };
  }

  private canResetDealsThatMatchFilters() {
    if (!this.filterItems) return true;
    
    //note: add keys of filters that DO NOT work on the deal level below
    const keysToCheckAgainst = [
      this.filterManagerService.filters.afterDate.string,
      this.filterManagerService.filters.beforeDate.string,
      `${this.filterManagerService.filters.playerInGame.string}-0`,
      `${this.filterManagerService.filters.playerInGame.string}-1`,
      `${this.filterManagerService.filters.playerInGame.string}-2`,
      `${this.filterManagerService.filters.playerInGame.string}-3`,
    ]
    
    const filterKeys = Object.keys(this.filterItems);
    for (let i = 0; i < filterKeys.length; i++) {
      const filterKey = filterKeys[i];
      if (!keysToCheckAgainst.includes(filterKey)) return false;
    }

    return true;
  }

  private getPlayerHasCardErrorMessage(
    usernameWhoHasCard: string,
    selectedCard: number
  ) {
    const htmlEntitySpan = getHtmlEntitySpan(selectedCard);
    const toAdd: FilterItem = {
      message: NOT_AVAILABLE_STRING,
      error: `${htmlEntitySpan} ${this.filterManagerService.filterMsgs.playerHasCard.invalid} '${usernameWhoHasCard}'`,
      elementsToReset: [],
    };

    this.filterItems[
      this.filterManagerService.filters.playerHasCard.errorKey
    ] = toAdd;
  }

  private getAreDealsLoaded() {
    let areLoaded = false;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        areLoaded = Object.keys(dealState.fetchedDeals).length > 0;
      });
    return !areLoaded;
  }

  private getIsSelectedCardUsedAlready(selectedCard: number) {
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

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  private getShouldResetStoreOnDeletion(toDelete: FilterItemDeletion) {
    const isPlayerHasCardError = toDelete.key.match(
      this.filterManagerService.filters.playerHasCard.errorKey
    );

    const isPlayerInGameError = toDelete.key.match(
      this.filterManagerService.filters.playerInGame.errorKey
    );

    return !isPlayerHasCardError && !isPlayerInGameError;
  }

  private handleDateChange(e: Event, dateType: DateType) {
    let shouldDispatchChange = false;
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const { isDateInvalid, dateObj, filterMsgError } = this.validateDate(
      input.value,
      dateType,
      this.beforeDate,
      this.afterDate
    );

    const { filterMsg, filterName } = this.getCorrectFilter(dateType);

    filterName.date = isDateInvalid ? null : dateObj;
    const message = getDateAndTimeString(filterName, filterMsg);
    const filterToSend: FilterItem = {
      message,
      error: message !== NOT_AVAILABLE_STRING ? '' : filterMsgError,
      date: dateObj,
      isDateInvalid,
      elementsToReset: [
        dateType === DateType.before
          ? this.beforeDateFilterElement
          : this.afterDateFilterElement,
      ],
    };

    if (dateType === DateType.before)
      this.filterItems[
        this.filterManagerService.filters.beforeDate.string
      ] = filterToSend;
    else
      this.filterItems[
        this.filterManagerService.filters.afterDate.string
      ] = filterToSend;

    let shouldRemoveInputErrorClassnames = false;
    if (!isDateInvalid) {
      shouldRemoveInputErrorClassnames = true;
      shouldDispatchChange = true;
    }

    this.filterManagerService.setInputErrorClassnames(
      input,
      shouldRemoveInputErrorClassnames
    );

    return shouldDispatchChange;
  }

  private removeBothDatesIfOneHasError(toDelete: FilterItemDeletion) {
    if (!toDelete) return;
    const {
      beforeDate,
      afterDate,
    } = this.filterManagerService.getBeforeAndAfterDateInfo();
    if (
      (toDelete.key === this.filterManagerService.filters.afterDate.string &&
        beforeDate === -1) ||
      (toDelete.key === this.filterManagerService.filters.beforeDate.string &&
        afterDate === -1)
    ) {
      delete this.filterItems[
        this.filterManagerService.filters.beforeDate.string
      ];
      delete this.filterItems[
        this.filterManagerService.filters.afterDate.string
      ];
    }
  }

  private populatePlayerNames(deals: FetchedDeals) {
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

    this.playerNames.push(...uniqueNames);
  }

  private validateDate(
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

    const filterMsgError = (this.filterManagerService.filterMsgs.date[
      beforeOrAfterString as any
    ] as any).invalid[exactErrorString];

    return { isDateInvalid, dateObj, filterMsgError };
  }
}
