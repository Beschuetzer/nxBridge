import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FILTER_MANAGER_CLASSNAME } from '@nx-bridge/constants';

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
  private beforeDateElement: HTMLElement = this.getNewElement('div');
  private afterDateElement: HTMLElement = this.getNewElement('div');
  private filtersMsgs = {
    none: 'No Filters applied',
    game: {
      player: '',
    },
    date: {
      before: {
        valid: 'Before: ',
        invalid: 'Invalid before date.',
      },
      after: {
        valid: 'After: ',
        invalid: 'Invalid after date.',
      },
      // between: {
      //   valid: {
      //     pre: "Between ",
      //     post: " and ",
      //   },
      //   invalid: "Invalid between date.",
      // },
    },
  };
  public beforeDate: Date | null = null;
  public afterDate: Date | null = null;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {}

  ngOnInit(): void {
    this.appendFiltersToAppliedDiv();
  }

  handleDateChange(e: Event, dateType: DateType) {
    const input = (e.currentTarget || e.target) as HTMLInputElement;
    const isInputInValid = this.validateDate(input.value, dateType);

    let filterName = this.beforeDate;
    let filterNameElement = this.beforeDateElement;
    let filterMsg = this.filtersMsgs.date.before.valid;
    let filterMsgError = this.filtersMsgs.date.before.invalid;
    if (dateType === DateType.after) {
      filterName = this.afterDate;
      filterNameElement = this.afterDateElement;
      filterMsg = this.filtersMsgs.date.after.valid;
      filterMsgError = this.filtersMsgs.date.after.invalid;
    }

    if (isInputInValid) {
      filterName = null;
      filterNameElement.innerHTML = filterMsgError;
      this.changeErrorClasses(filterNameElement, false);
    } else {
      this.changeErrorClasses(filterNameElement, true);
      filterName = new Date(input.value as string);
      filterNameElement.innerHTML = `${filterMsg}${filterName.toDateString()}`;
    }
  }

  onDateClick(e: Event) {}

  onDateBeforeChange(e: Event) {
    this.handleDateChange(e, DateType.before);
  }

  onDateAfterChange(e: Event) {
    this.handleDateChange(e, DateType.after);
  }

  onGameClick(e: Event) {}

  private changeErrorClasses(element: HTMLElement, shouldRemove = false) {
    if (!element) return;

    this.errorClassnames.forEach((classname) => {
      if (shouldRemove) this.renderer.removeClass(element, classname);
      else this.renderer.addClass(element, classname);
    });
  }

  private appendFiltersToAppliedDiv() {
    const filterManager = this.elRef.nativeElement as HTMLElement;
    const appliedDiv = filterManager.querySelector(
      `.${FILTER_MANAGER_CLASSNAME}__applied`
    );
    if (!appliedDiv) return;

    this.renderer.appendChild(appliedDiv, this.beforeDateElement);
    this.renderer.appendChild(appliedDiv, this.afterDateElement);
  }

  private getNewElement(elementType: string) {
    return this.renderer.createElement(elementType);
  }

  private validateDate(date: string, dateType: DateType) {
    //todo: -need a validation function that checks whether the date given is valid in relation to the other date given (if it is given)
    return !date;
  }
}
