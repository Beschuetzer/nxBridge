import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FILTER_MANAGER_CLASSNAME } from '@nx-bridge/constants';
import {
  AppState,
  SetAfterDate,
  SetBeforeDate,
  SetIsFilterSame,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { DateObj } from '@nx-bridge/interfaces-and-types';
import { SearchService } from '../../services/search.service';
import { FiltermanagerService } from '../../services/filtermanager.service';

enum DateType {
  before,
  after,
}

@Component({
  selector: 'nx-bridge-filter-manager',
  templateUrl: './filter-manager.component.html',
  styleUrls: ['./filter-manager.component.scss'],
})
export class FilterManagerComponent implements OnInit {
  //NOTE: new checkboxes need to be added to resetFilterCheckboxes()
  @ViewChild('game') gameCheckbox: ElementRef | null = null;
  @ViewChild('date') dateCheckbox: ElementRef | null = null;
  @ViewChild('player') playerCheckbox: ElementRef | null = null;

  //NOTE: new filters need to be added to resetFilterValues() and to filterManagerService's filters object
  @ViewChild('beforeDate') beforeDateFilterElement: ElementRef | null = null;
  @ViewChild('afterDate') afterDateFilterElement: ElementRef | null = null;
  
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
  };

  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };
  public FILTER_MANANGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private searchService: SearchService,
    private filterManagerService: FiltermanagerService,
  ) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
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
      filterNameElement.innerHTML = this.getDateAndTimeString(
        filterName,
        filterMsg
      );
      shouldRemoveInputErrorClassnames = true;
      shouldDispatchChange = true;
    }

    this.setInputErrorClassnames(input, shouldRemoveInputErrorClassnames);

    return shouldDispatchChange;
  }

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

  onGameClick(e: Event) {return}
  onPlayerClick(e: Event) {return}

  onReset() {
    this.resetFilterCheckboxes();
    this.resetFilterValues();
    this.filterManagerService.reset();
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
    dateType: DateType
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

  private getDateAndTimeString(filterName: DateObj, filterMsg: string) {
    if (!filterName?.date) return 'N/A';
    const date = filterName.date.toLocaleDateString();
    const shortDate =
      date.substr(0, date.length - 4) +
      date.substr(date.length - 2, date.length);
    const time = filterName.date.toLocaleTimeString();
    const shortTime = time.replace(/(:\d{2}) .*$/i, '');
    const amOrPm = time.substr(-2, 2);
    return `${filterMsg}${shortTime}${amOrPm} on ${shortDate}`;
  }

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  private resetFilterCheckboxes() {
    const filterCheckboxElements = [this.gameCheckbox, this.dateCheckbox, this.playerCheckbox];
    for (let i = 0; i < filterCheckboxElements.length; i++) {
      const filterElement = filterCheckboxElements[i]?.nativeElement;
      if (filterElement) filterElement.checked = false;
      
    }
  }

  private resetFilterValues() {
    const filterElements = [this.beforeDateFilterElement, this.afterDateFilterElement];
    for (let i = 0; i < filterElements.length; i++) {
      const filterElement = filterElements[i]?.nativeElement;
      if (filterElement) filterElement.value = '';
      
    }
  }

  private setInputErrorClassnames(
    input: HTMLInputElement,
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
    console.log('currentTime-proposedTime =', currentTime-proposedTime);

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
