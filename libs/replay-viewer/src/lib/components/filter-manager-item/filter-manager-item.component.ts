import { Component, Input, OnInit, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { dealsListDealsButtonChoices, FILTER_MANAGER_CLASSNAME } from '@nx-bridge/constants';
import { FilterItem, FilterItemDeletion } from '@nx-bridge/interfaces-and-types';
import { AppState, SetAfterDate, SetBeforeDate } from '@nx-bridge/store';
import { debug } from 'node:console';
import { FiltermanagerService } from '../../services/filter-manager.service';

@Component({
  selector: 'nx-bridge-filter-manager-item',
  templateUrl: './filter-manager-item.component.html',
  styleUrls: ['./filter-manager-item.component.scss']
})
export class FilterManagerItemComponent implements OnInit {
  @Input() filterItem: FilterItem | null = null;
  @Input() filterItemKey = '';
  @Input() indexOfItem = -1;
  @Output() deletion = new EventEmitter<FilterItemDeletion>();
  public FILTER_MANAGER_CLASSNAME = FILTER_MANAGER_CLASSNAME;
  public messageToShow = '';
  public closeButtonHtmlEntity = dealsListDealsButtonChoices[1];
  private errorClassnames = ['color-red-light'];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private filterManagerService: FiltermanagerService,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void 
  {
    const textElement = this.elRef.nativeElement?.querySelector(`.${FILTER_MANAGER_CLASSNAME}__text`);
    if (this.filterItem?.error) {
      this.changeErrorClasses(textElement, false);
      this.messageToShow = this.filterItem.error;
    }
    else {
      this.changeErrorClasses(textElement, true);
      this.messageToShow = this.filterItem?.message ? this.filterItem?.message : '';
    }
  }
  
  onDelete() {
    debugger;
    const storeActionKey = this.getStoreActionKey();
    const storeResetAction = this.filterManagerService.filterResetActions[storeActionKey];
    this.deletion.emit({key: this.filterItemKey, resetAction: storeResetAction, username: this.filterItem?.username, card: this.filterItem?.card});
    this.resetValueAndClasses(this.filterItem?.elementsToReset as any);
    this.resetBothDatesIfOneWithoutErrorBeingDeleted(this.filterItemKey);
  }

  private changeErrorClasses(element: HTMLElement, shouldRemove = false) {
    if (!element) return;

    this.errorClassnames.forEach((classname) => {
      if (shouldRemove) this.renderer.removeClass(element, classname);
      else this.renderer.addClass(element, classname);
    });
  }

  private getStoreActionKey() {
    //note: if the filter is a singleton don't have to do anything here, otherwise need to make sure that the correct value is returned here
    let key = this.filterItemKey;
    
    if (key.match(/playerHasCard/i)) key = this.filterManagerService.filters.playerHasCard.string;
    else if (key.match(/playerInGame/i) && !key.match(/error/i)) key = this.filterManagerService.filters.playerInGame.string;

    return key;
  }

  private resetValueAndClasses(elementsToReset: HTMLElement[] | ElementRef<any>[]) {
    if (!elementsToReset) return;

    for (let i = 0; i < elementsToReset.length; i++) {
      const elementToReset = elementsToReset[i];

      let htmlElement = elementToReset as HTMLInputElement;
      if ((elementToReset as any).nativeElement) htmlElement = (elementToReset as any).nativeElement as HTMLInputElement;

      //note: two options so far (input and option/select)
      if (htmlElement.localName !== 'select') htmlElement.value = '';
      this.filterManagerService.setInputErrorClassnames(htmlElement, true);
    }
  }

  private resetBothDatesIfOneWithoutErrorBeingDeleted(key: string) {
    const {beforeDate, beforeDateElement, afterDate, afterDateElement} = this.filterManagerService.getBeforeAndAfterDateInfo();

    if (key === this.filterManagerService.filters.afterDate.string && beforeDate === -1 || key ===this.filterManagerService.filters.beforeDate.string && afterDate === -1) {
      beforeDateElement.value = '';
      afterDateElement.value = '';

      this.store.dispatch(new SetBeforeDate(this.filterManagerService.filtersInitial.beforeDate));
      this.store.dispatch(new SetAfterDate(this.filterManagerService.filtersInitial.afterDate));
      
      this.filterManagerService.setInputErrorClassnames(beforeDateElement, true);
      this.filterManagerService.setInputErrorClassnames(afterDateElement, true);
    }
  }
}
