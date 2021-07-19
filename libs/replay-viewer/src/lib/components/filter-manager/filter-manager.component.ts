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
  DISPLAY_NONE_CLASSNAME,
  MOBILE_START_WIDTH,
} from '@nx-bridge/constants';
import {
  AddPlayerHasCard,
  AddPlayerInGameFilter,
  AppState,
  reducerDefaultValue,
  SetAfterDate,
  SetBeforeDate,
  SetContractFilter,
  SetDeclarerFilter,
  SetDoubleFilter,
  SetIsFilterSame,
  SetOpeningBidFilter,
  SetPlayerHasCard,
  SetWonByFilter,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  DateType,
  FilterItem,
  PlayerHasCard,
  ReducerNames,
  DateObj,
  FilterItems,
  FilterItemDeletion,
  PlayerInGame,
  WonByType,
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
  @ViewChild('wonBy') wonByCheckbox: ElementRef | null = null;

  @ViewChild('date') dateCheckbox: ElementRef | null = null;

  @ViewChild('deal') dealCheckbox: ElementRef | null = null;
  @ViewChild('playerHasCard') playerHasCardCheckbox: ElementRef | null = null;
  @ViewChild('contract') contractCheckbox: ElementRef | null = null;
  @ViewChild('declarer') declarerCheckbox: ElementRef | null = null;
  @ViewChild('openingBid') openingBidCheckbox: ElementRef | null = null;
  @ViewChild('double') doubleCheckbox: ElementRef | null = null;

  //NOTE: new filters need to be added to filterManagerService's filter objects and applyFilters();  remember: to set store action 'SetIsFilterSame' to false before calling searchService.setCurrentlyDisplayingGames() to make sure filters are checked; also need to make sure that key returned in FilterManagerItem's getKeyToUse is correct; add another deleteError call in private deleteErrors() if filter has an error state; make sure that dispatchCorrectResetAction() in filtermanager.service dispatches correct action for item deletion;  if filter does not work on the deal level (e.g. contract was...) then add key name in canResetDealsThatMatchFilters() in service;
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
  @ViewChild('wonByInput') wonByAmountFilterElement: ElementRef | null = null;
  @ViewChild('wonByType') wonByTypeFilterElement: ElementRef | null = null;

  @HostBinding('class.filter-manager') get classname() {
    return true;
  }
  @HostBinding('class.hidden') get toggleHidden() {
    return !this.searchService.getAreDealsLoaded();
  }
  @HostBinding('class.d-none') get toggleDisplayNone() {
    // return ;
    return (
      (!this.searchService.getAreDealsLoaded() &&
        window.innerWidth <= MOBILE_START_WIDTH) ||
      this.router.url === `/${rootRoute}`
    );
  }
  @HostBinding('class.announce-self') get toggleAnnounceSelf() {
    return this.searchService.getAreDealsLoaded();
  }

  private lastButtonPressed: EventTarget | null = null;
  private hasPlayerHasCardChanged = false;

  public FILTER_MANANGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;
  public DISPLAY_NONE_CLASSNAME = DISPLAY_NONE_CLASSNAME;
  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };
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
    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      if (dealState.fetchedDeals) {
        const uniquePlayerNames = this.filterManagerService.getUniquePlayerNames(
          dealState.fetchedDeals
        );
        if (uniquePlayerNames) {
          this.playerNames = [
            ...filterManagerPlayerNames,
            ...uniquePlayerNames,
          ];
        }
      }
    });
  }

  //#region Public Methods
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
        selectedMultiplier === 2 ? 'once' : 'twice'
      }.`,
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

    const isSelectedCardUsedAlready = this.filterManagerService.getIsSelectedCardUsedAlready(
      selectedCard
    );
    if (isSelectedCardUsedAlready) {
      if (this.hasPlayerHasCardChanged)
        this.filterItems[
          this.filterManagerService.filters.playerHasCard.errorKey
        ] = this.filterManagerService.getPlayerHasCardErrorMessage(
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

          const [
            key,
            value,
          ] = this.filterManagerService.getPlayerHasCardFilterItem(
            cardSelectElement,
            usernameSelectElement,
            selectedCard,
            selectedUsername
          );
          this.filterItems[key] = value;

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

  onAddWonBy(e: Event) {
    const eventTarget = e.currentTarget || e.target;
    if (!this.getCanAdd(e, eventTarget as EventTarget)) return;

    const wonByAmountElement = this.wonByAmountFilterElement
      ?.nativeElement as HTMLInputElement;
    const wonByTypeElement = this.wonByTypeFilterElement?.nativeElement as HTMLSelectElement
    const selectedAmount = +wonByAmountElement.value;
    const selectedType = wonByTypeElement.value as WonByType;

    if (selectedAmount < 0 || selectedAmount === undefined || isNaN(selectedAmount) || !selectedType) return;
    this.lastButtonPressed = eventTarget;

    this.store.dispatch(new SetWonByFilter({amount: +selectedAmount, type: selectedType as WonByType}));
    this.store.dispatch(new SetIsFilterSame(false));
    this.searchService.setCurrentlyDisplayingGames();

    let message = `${this.filterManagerService.filterMsgs.wonBy.valid.pre} ${selectedType} than <b>${selectedAmount}</b> ${this.filterManagerService.filterMsgs.wonBy.valid.post}`
    if (selectedAmount === 0 && selectedType === 'less') message = "Game was a tie."

    const filterItem: FilterItem = {
      message,
      error: '',
      elementsToReset: [wonByAmountElement],
    }
    this.filterItems[this.filterManagerService.filters.wonBy.string] = filterItem;
  }

  onContractChange() {
    this.lastButtonPressed = null;
  }
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

  onDeclarerChange() {
    this.lastButtonPressed = null;
  }

  onDateAfterChange(e: Event) {
    this.lastButtonPressed = null;
    const shouldDispatchChange = this.handleDateChange(e, DateType.after);
    this.dispatchChanges(this.afterDate, shouldDispatchChange, DateType.after);
  }

  onDeclarerClick() {}

  onDoubleClick() {}
  onDoubleChange() {
    this.lastButtonPressed = null;
  }

  onFilterItemDeletion(toDelete: FilterItemDeletion) {
    if (!toDelete.key) throw new Error('No toDelete.key...');
    delete this.filterItems[toDelete.key];

    const shouldResetStore = this.filterManagerService.getShouldResetStoreOnDeletion(
      toDelete
    );
    if (shouldResetStore) {
      //note: need to verify correct action is being dispatched when adding new filter
      this.filterManagerService.dispatchCorrectResetAction(toDelete);
      this.store.dispatch(new SetIsFilterSame(false));
      this.searchService.setCurrentlyDisplayingGames();
      this.removeBothDatesIfOneHasError(toDelete);
    }

    //note: this is here to remove errors when valid filter is deleted
    //add another deleteError call inside deleteErrors when adding a new filter
    this.deleteErrors(toDelete);

    if (
      this.filterItems &&
      this.filterManagerService.canResetDealsThatMatchFilters(this.filterItems)
    ) {
      this.store.dispatch(
        this.filterManagerService.filterResetActions.dealsThatMatchFilters
      );
    }
  }

  //NOTE: need this to trigger *ngIf properly
  onGameClick(e: Event) {
    return;
  }

  onHide() {
    const filterManager = this.elRef.nativeElement as HTMLElement;
    const applied = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__applied`
    ) as HTMLElement;
    const options = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__options`
    ) as HTMLElement;
    const details = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__details`
    ) as HTMLElement;
    const button = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__hide`
    ) as HTMLElement;

    if (applied.classList.contains(DISPLAY_NONE_CLASSNAME)) {
      this.renderer.removeClass(applied, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(options, DISPLAY_NONE_CLASSNAME);
      this.renderer.removeClass(details, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = 'Hide';
    } else {
      this.renderer.addClass(applied, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(options, DISPLAY_NONE_CLASSNAME);
      this.renderer.addClass(details, DISPLAY_NONE_CLASSNAME);
      button.innerHTML = 'Show';
    }
  }

  onPlayerInGameChange() {
    this.lastButtonPressed = null;
  }
  onPlayerInGameClick() {}

  onPlayerHasCardChange() {
    this.lastButtonPressed = null;
    this.hasPlayerHasCardChanged = true;
  }

  onPlayerHasCardClick() {}

  //NOTE: need this to trigger *ngIf properly
  onDealClick(e: Event) {
    return;
  }

  onOpeningBidChange() {
    this.lastButtonPressed = null;
  }

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

  onWonByChange() {this.lastButtonPressed = null}

  onWonByClick() {}
  //#endregion

  //#region Private Methods
  private getCanAdd(e: Event, eventTarget: EventTarget) {
    return this.lastButtonPressed !== eventTarget;
  }

  private deleteError(
    toDelete: FilterItemDeletion,
    key: string,
    errorKey: string
  ) {
    const shouldDelete = toDelete.key.match(key);
    if (shouldDelete) {
      delete this.filterItems[errorKey];
    }
  }

  private deleteErrors(toDelete: FilterItemDeletion) {
    //note: this assumes error keys and valid keys start with the same string (e.g. 'playerInGame-1' and 'playerInGame-error');
    this.deleteError(
      toDelete,
      this.filterManagerService.filters.playerHasCard.string,
      this.filterManagerService.filters.playerHasCard.errorKey
    );
    this.deleteError(
      toDelete,
      this.filterManagerService.filters.playerInGame.string,
      this.filterManagerService.filters.playerInGame.errorKey
    );
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

  private getCorrectFilter(dateType: DateType) {
    let filterName = this.beforeDate;
    let filterMsg = this.filterManagerService.filterMsgs.date.before.valid;

    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterMsg = this.filterManagerService.filterMsgs.date.after.valid;
    }

    return { filterMsg, filterName };
  }

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  private handleDateChange(e: Event, dateType: DateType) {
    let shouldDispatchChange = false;
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const {
      isDateInvalid,
      dateObj,
      filterMsgError,
    } = this.filterManagerService.validateDate(
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
  //#endregion
}
