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
  getContractAsHtmlEntityString
} from '@nx-bridge/constants';
import {
  AddPlayerHasCard,
  AppState,
  RemovePlayerHasCard,
  SetAfterDate,
  SetBeforeDate,
  SetContractFilter,
  SetIsFilterSame,
  SetPlayerHasCard,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  DateObj,
  DateType,
  FetchedDeals,
  FilterItem,
  FilterItemDeletion,
  FilterItems,
  PlayerHasCard,
  ReducerNames,
} from '@nx-bridge/interfaces-and-types';
import { SearchService } from '../../services/search.service';
import { FiltermanagerService } from '../../services/filtermanager.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'nx-bridge-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
export class FilterManagerComponent implements OnInit {
  //NOTE: new checkboxes need to be added to resetFilterCheckboxes() in reset()
  @ViewChild('game') gameCheckbox: ElementRef | null = null;
  @ViewChild('date') dateCheckbox: ElementRef | null = null;
  @ViewChild('deal') dealCheckbox: ElementRef | null = null;
  @ViewChild('playerHasCard') playerHasCardCheckbox: ElementRef | null = null;
  @ViewChild('contract') contractCheckbox: ElementRef | null = null;
  @ViewChild('declarer') declarerCheckbox: ElementRef | null = null;

  //NOTE: new filters need to be added to filterManagerService's filter objects and applyFilters();  remember: to set store action 'SetIsFilterSame' to false before calling searchService.setCurrentlyDisplayingGames() to make sure filters are checked; also need to make sure that key returned in FilterManagerItem's getKeyToUse is correct
  @ViewChild('beforeDate') beforeDateFilterElement: ElementRef | null = null;
  @ViewChild('afterDate') afterDateFilterElement: ElementRef | null = null;
  @ViewChild('players') playersFilterElement: ElementRef | null = null;
  @ViewChild('cards') cardsFilterElement: ElementRef | null = null;
  @ViewChild('contractsSelect') contractsFilterElement: ElementRef | null = null;

  @HostBinding('class.filter-manager') get classname() {
    return true;
  }

  private hasPlayerHasCardChanged = false;
  private beforeDateElement: HTMLElement = this.getNewElement('div');
  private afterDateElement: HTMLElement = this.getNewElement('div');

  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };
  public FILTER_MANANGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;
  public filterItems: FilterItems = {};
  public contracts =  [...filterManagerContracts, ...contracts];
  public cardsAsNumbers =  filterManagerCardsAsNumbers;
  public playerNames =  filterManagerPlayerNames;

  get joinedInputErrorClassnames() {
    return this.filterManagerService.inputErrorClassnames.join(' ');
  }

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private searchService: SearchService,
    private filterManagerService: FiltermanagerService
  ) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
    this.store.select(ReducerNames.deals).subscribe((dealState) => {
      if (dealState.fetchedDeals)
        this.populatePlayerNames(dealState.fetchedDeals);
    });
  }

  onAddContract() {
    const contractsSelectElement = this.contractsFilterElement?.nativeElement as HTMLSelectElement;
    const selectedContract = contracts[+contractsSelectElement.value];
    if (!selectedContract) return;

    this.store.dispatch(new SetContractFilter(selectedContract));
    this.store.dispatch(new SetIsFilterSame(false));
    this.searchService.setCurrentlyDisplayingGames();

    this.filterManagerService.setInputErrorClassnames(contractsSelectElement, true);
    
    const filterItem: FilterItem = {
      message: `${this.filterManagerService.filterMsgs.contract.valid} ${getContractAsHtmlEntityString(selectedContract)}.`,
      error: '',
      elementsToReset: [contractsSelectElement],
    }

    this.filterItems[this.filterManagerService.filters.contract.string] = filterItem;
  }

  onAddDeclarer(e: Event) {

  }

  onAddPlayerHasCard(e: Event) {
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

  onContractChange() {

  }

  //NOTE: need this to trigger *ngIf properly
  onDateClick(e: Event) {
    return;
  }

  onDateBeforeChange(e: Event) {
    const shouldDispatchChange = this.handleDateChange(e, DateType.before);
    this.dispatchChanges(
      this.beforeDate,
      shouldDispatchChange,
      DateType.before
    );
  }

  onDeclarerChange() {

  }

  onContractClick() {

  }

  onDateAfterChange(e: Event) {
    const shouldDispatchChange = this.handleDateChange(e, DateType.after);
    this.dispatchChanges(this.afterDate, shouldDispatchChange, DateType.after);
  }

  onDeclarerClick() {

  }

  onFilterItemDeletion(toDelete: FilterItemDeletion) {
    delete this.filterItems[toDelete.key];

    if (!toDelete.key) throw new Error('No toDelete.key...');

    const shouldResetStore = !toDelete.key.match(
      this.filterManagerService.filters.playerHasCard.errorKey
    );
    const shouldDeletePlayerHasCardError = toDelete.key.match(
      this.filterManagerService.filters.playerHasCard.string
    );

    if (shouldResetStore) {
      this.resetStore(toDelete);
      this.store.dispatch(new SetIsFilterSame(false));
      this.searchService.setCurrentlyDisplayingGames();
      this.removeBothDatesIfOneHasError(toDelete);
    }

    if (shouldDeletePlayerHasCardError) {
      delete this.filterItems[
        this.filterManagerService.filters.playerHasCard.errorKey
      ];
    }

    if (!this.getIsPlayerHasCardFilterStillPresent()) this.store.dispatch(this.filterManagerService.filterResetActions.dealsThatMatchPlayerHasCardFilters)
  }

  //NOTE: need this to trigger *ngIf properly
  onGameClick(e: Event) {
    return;
  }

  onPlayerHasCardChange() {
    this.hasPlayerHasCardChanged = true;
  }

  onPlayerHasCardClick() {

  }

  //NOTE: need this to trigger *ngIf properly
  onDealClick(e: Event) {

    return;
  }

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
    let filterNameElement = this.beforeDateElement;
    let filterMsg = this.filterManagerService.filterMsgs.date.before.valid;

    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterNameElement = this.afterDateElement;
      filterMsg = this.filterManagerService.filterMsgs.date.after.valid;
    }

    return { filterMsg, filterName, filterNameElement };
  }

  private getIsPlayerHasCardFilterStillPresent() {
    if (!this.filterItems) return false;
    for (const filterKey in this.filterItems) {
      if (Object.prototype.hasOwnProperty.call(this.filterItems, filterKey)) {
        if (filterKey.match(this.filterManagerService.filters.playerHasCard.string) && !filterKey.match(this.filterManagerService.filters.playerHasCard.errorKey)) return true;
      }
    }
    return false;
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

  private handleDateChange(e: Event, dateType: DateType) {
    let shouldDispatchChange = false;
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const { isDateInvalid, dateObj, filterMsgError } = this.validateDate(
      input.value,
      dateType,
      this.beforeDate,
      this.afterDate
    );

    const { filterMsg, filterName } = this.getCorrectFilter(
      dateType
    );

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

  private resetStore(toDelete: FilterItemDeletion) {
    if (toDelete.key.match(/playerHasCard\d+/i))
      return this.store.dispatch(
        new RemovePlayerHasCard({
          username: toDelete.username ? toDelete.username : '',
          card: toDelete.card !== undefined ? toDelete.card : -2,
        })
      );

    return this.store.dispatch(toDelete.resetAction);
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
