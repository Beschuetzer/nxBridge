import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FILTER_MANAGER_CLASSNAME, getDateAndTimeString, maxCardValue, minCardValue } from '@nx-bridge/constants';
import {
  AppState, SetAfterDate, SetBeforeDate, SetIsFilterSame, SetPlayerHasCard,
} from '@nx-bridge/store';
import { ReducerManager, Store } from '@ngrx/store';
import { DateObj, DateType, ReducerNames, UserIds } from '@nx-bridge/interfaces-and-types';
import { SearchService } from '../../services/search.service';
import { FiltermanagerService } from '../../services/filtermanager.service';
import { lstat } from 'node:fs';

@Component({
  selector: 'nx-bridge-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
export class FilterManagerComponent implements OnInit {
  //NOTE: new checkboxes need to be added to resetFilterCheckboxes() in reset()
  @ViewChild('game') gameCheckbox: ElementRef | null = null;
  @ViewChild('date') dateCheckbox: ElementRef | null = null;
  @ViewChild('player') playerCheckbox: ElementRef | null = null;

  //NOTE: new filters need to be added to filterManagerService's filter objects and search service's applyFilters();  remember: to call store action 'SetIsFilterSame' with false to tell searchService.setCurrentlyDisplayingGames() to run through the filters
  @ViewChild('beforeDate') beforeDateFilterElement: ElementRef | null = null;
  @ViewChild('afterDate') afterDateFilterElement: ElementRef | null = null;
  @ViewChild('players') playersFilterElement: ElementRef | null = null;
  @ViewChild('cards') cardsFilterElement: ElementRef | null = null;
  
  @HostBinding('class.filter-manager') get classname() {
    return true;
  }

  private errorClassnames = ['color-red-light'];
  private inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];

  private beforeDateElement: HTMLElement = this.getNewElement('div');
  private afterDateElement: HTMLElement = this.getNewElement('div');
  private filtersMsgs: {[key: string]: any} = {
    none: 'No Filters applied',
    game: {
      player: '',
    },
    date: {
      before: {
        valid: 'Before: &nbsp;',
        invalid: {
          single: 'Invalid before date.',
          multiple: 'Before date <= after date.',
        },
      },
      after: {
        valid: 'After: &nbsp;',
        invalid: {
          single: 'Invalid after date.',
          multiple: 'After date >= before date.',
          afterNow: 'After date is after now.'
        },
      },
    },
    playerHasCard: {
      valid: '',
      invalid: ''
    }
  };

  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };
  public FILTER_MANANGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;
  public playerNames = ['Pick a username'];
  public cardsAsNumbers = ['Pick a Card', ...Array(52).keys()];

  get joinedInputErrorClassnames () {
    return this.inputErrorClassnames.join(' ');
  }

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private searchService: SearchService,
    private filterManagerService: FiltermanagerService,
  ) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
    this.store.select(ReducerNames.users).subscribe(userState => {
      if (userState.userIds && this.playerNames.length === 1) this.populatePlayerNames(userState.userIds);
    })
  }

  handleDateChange(e: Event, dateType: DateType) {
    let shouldDispatchChange = false;
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const { isDateInValid, dateObj, isSingle, filterMsgError } = this.validateDate(
      input.value,
      dateType,
      this.beforeDate,
      this.afterDate
    );

    const {
      filterMsg,
      filterName,
      filterNameElement,
    } = this.getCorrectFilter(dateType);

    let shouldRemoveInputErrorClassnames = false;
    if (isDateInValid) {
      filterName.date = null;
      filterNameElement.innerHTML = filterMsgError;
      this.changeErrorClasses(filterNameElement, false);
    } else {
      this.changeErrorClasses(filterNameElement, true);
      filterName.date = dateObj;
      filterNameElement.innerHTML = getDateAndTimeString(
        filterName,
        filterMsg
      );
      shouldRemoveInputErrorClassnames = true;
      shouldDispatchChange = true;
    }

    this.setInputErrorClassnames(input, shouldRemoveInputErrorClassnames);

    return shouldDispatchChange;
  }

  //NOTE: need this to trigger *ngIf properly
  onDateClick(e: Event) {return}

  onDateBeforeChange(e: Event) {
    const shouldDispatchChange = this.handleDateChange(e, DateType.before);
    this.dispatchChanges(
      this.beforeDate,
      shouldDispatchChange,
      DateType.before
    );
  }

  onDateAfterChange(e: Event) {
    const shouldDispatchChange = this.handleDateChange(e, DateType.after);
    this.dispatchChanges(this.afterDate, shouldDispatchChange, DateType.after);
  }

  //NOTE: need this to trigger *ngIf properly
  onGameClick(e: Event) {return}

  onPlayerHasCardClick(e: Event) {
    const cardSelectElement = this.cardsFilterElement?.nativeElement as HTMLSelectElement;
    const usernameSelectElement = this.playersFilterElement?.nativeElement as HTMLSelectElement;

    const selectedCard = +cardSelectElement?.value;
    const selectedUsername = usernameSelectElement?.value;

    let shouldRemoveCardErrors = false;
    let shouldRemoveUsernameErrors = false;
    if (selectedCard >= minCardValue && selectedCard <= maxCardValue) shouldRemoveCardErrors = true;
    if (!selectedUsername.match(this.playerNames[0])) shouldRemoveUsernameErrors = true;

    this.setInputErrorClassnames(cardSelectElement, shouldRemoveCardErrors);
    this.setInputErrorClassnames(usernameSelectElement, shouldRemoveUsernameErrors);

    if (shouldRemoveCardErrors && shouldRemoveUsernameErrors) {
      //inputs are valid
      //note: if using more than one playerHasCard filter, will need to refine the dispatch
      this.store.dispatch(new SetIsFilterSame(false));
      this.store.dispatch(new SetPlayerHasCard([{[selectedUsername]: selectedCard}]));
      this.searchService.setCurrentlyDisplayingGames();
    }
  }

  //NOTE: need this to trigger *ngIf properly
  onPlayerClick(e: Event) {return}

  onReset() {
    const filterCheckboxElements = [this.gameCheckbox, this.dateCheckbox, this.playerCheckbox];
    const filterElements = [this.beforeDateFilterElement, this.afterDateFilterElement];

    this.beforeDate.date = null;
    this.afterDate.date = null;

    this.filterManagerService.resetElements(filterCheckboxElements as ElementRef[], 'checked', false)
    this.filterManagerService.resetElements(filterElements as ElementRef[], 'value', '')
    this.filterManagerService.reset();

    const filterManagerApplied = document.querySelector(`.${FILTER_MANAGER_CLASSNAME}__applied`);
    const children = filterManagerApplied?.children;

    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        child.innerHTML = '';
      }
    }

    //NOTE: this could be any filter as long as it gets called (in order to show all un-filtered games)
    this.dispatchChanges(this.afterDate, true, DateType.after);
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

  private changeErrorClasses(element: HTMLElement, shouldRemove = false) {
    if (!element) return;

    this.errorClassnames.forEach((classname) => {
      if (shouldRemove) this.renderer.removeClass(element, classname);
      else this.renderer.addClass(element, classname);
    });
  }

  private dispatchChanges(
    filterName: DateObj,
    shouldDispatchChange: boolean,
    dateType: DateType,
  ) {
    let dateToDispatch = filterName.date?.getTime();

    if (!shouldDispatchChange) {
      dateToDispatch = 0;
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
    let filterMsg = this.filtersMsgs.date.before.valid;
    
    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterNameElement = this.afterDateElement;
      filterMsg = this.filtersMsgs.date.after.valid;
    }

    return { filterMsg, filterName, filterNameElement };
  }

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  private populatePlayerNames(userIds: UserIds) {
    if (!userIds) return;
    const usernames = Object.values(userIds);
    if (usernames.length <= 0) return;
    this.playerNames.push(...usernames);
  }

  private setInputErrorClassnames(
    input: HTMLElement,
    shouldRemoveInputErrorClassnames: boolean
  ) {
    this.inputErrorClassnames.forEach((classname) => {
      if (shouldRemoveInputErrorClassnames) input.classList.remove(classname);
      else input.classList.add(classname);
    });
  }

  private validateDate(
    date: string,
    dateType: DateType,
    beforeDate: DateObj,
    afterDate: DateObj
  ) {

    let isDateInValid = false;
    let isSingle = true;

    const dateObj = new Date(date);
    const proposedTime =  dateObj.getTime();
    const currentTime = Date.now() - 60001;

    const beforeOrAfterString = dateType === DateType.before ? 'before' : 'after';
    let exactErrorString = isSingle ? 'single' : 'multiple';

    if (proposedTime >= currentTime && dateType === DateType.after) {
      exactErrorString = 'afterNow';
      isDateInValid = true;
      if (beforeDate?.date) isSingle = false;
    }
    else if (beforeDate?.date && dateType === DateType.after) {
      isDateInValid = beforeDate.date.getTime() <= proposedTime;
      isSingle = false;
    } else if (afterDate?.date && dateType === DateType.before) {
      isDateInValid = afterDate.date.getTime() >= proposedTime;
      isSingle = false;
    } else isDateInValid = !date;


    const filterMsgError = (this.filtersMsgs.date[beforeOrAfterString as any] as any).invalid[exactErrorString];

    return { isDateInValid, dateObj, isSingle, filterMsgError };
  }
}
