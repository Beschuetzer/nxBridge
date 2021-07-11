import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
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
import { filter, take } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';

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
  @HostBinding('class.filter-manager') get classname() {
    return true;
  }
  private errorClassnames = ['color-red-light'];
  private inputErrorClassnames = ['ng-touched', 'ng-dirty', 'ng-invalid'];
  private beforeDateElement: HTMLElement = this.getNewElement('div');
  private afterDateElement: HTMLElement = this.getNewElement('div');
  private filtersMsgs = {
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
        },
      },
    },
  };
  public beforeDate: DateObj = { date: null };
  public afterDate: DateObj = { date: null };

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private store: Store<AppState>,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
  }

  handleDateChange(e: Event, dateType: DateType) {
    let shouldDispatchChange = false;
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const { isDateInValid, dateObj, isSingle } = this.validateDate(
      input.value,
      dateType,
      this.beforeDate,
      this.afterDate
    );

    const {
      filterMsg,
      filterMsgError,
      filterName,
      filterNameElement,
    } = this.getCorrectFilter(dateType, isSingle);

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

  onDateClick(e: Event) {}

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

  onGameClick(e: Event) {}

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

  private getCorrectFilter(dateType: DateType, isSingle: boolean) {
    let filterName = this.beforeDate;
    let filterNameElement = this.beforeDateElement;
    let filterMsg = this.filtersMsgs.date.before.valid;
    let filterMsgError = isSingle
      ? this.filtersMsgs.date.before.invalid.single
      : this.filtersMsgs.date.before.invalid.multiple;
    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterNameElement = this.afterDateElement;
      filterMsg = this.filtersMsgs.date.after.valid;
      filterMsgError = isSingle
        ? this.filtersMsgs.date.after.invalid.single
        : this.filtersMsgs.date.after.invalid.multiple;
    }

    return { filterMsg, filterMsgError, filterName, filterNameElement };
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
    if (beforeDate?.date && dateType === DateType.after) {
      isDateInValid = beforeDate.date.getTime() <= dateObj.getTime();
      isSingle = false;
    } else if (afterDate?.date && dateType === DateType.before) {
      isDateInValid = afterDate.date.getTime() >= dateObj.getTime();
      isSingle = false;
    } else isDateInValid = !date;
    return { isDateInValid, dateObj, isSingle };
  }
}
