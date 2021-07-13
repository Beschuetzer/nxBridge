import { Component, Input, OnInit, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { dealsListDealsButtonChoices, FILTER_MANAGER_CLASSNAME } from '@nx-bridge/constants';
import { FilterItem, FilterItemDeletion, FilterItems } from '@nx-bridge/interfaces-and-types';
import { debug } from 'node:console';
import { FiltermanagerService } from '../../services/filtermanager.service';

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
    const key = this.getKeyToUse();
    const resetAction = this.filterManagerService.filterResetActions[key];
    this.deletion.emit({key, resetAction});
    this.resetElement(this.filterItem?.elementToReset);
  }

  //todo: apply error classes
  // this.changeErrorClasses(filterNameElement, true);
  private changeErrorClasses(element: HTMLElement, shouldRemove = false) {
    if (!element) return;

    this.errorClassnames.forEach((classname) => {
      if (shouldRemove) this.renderer.removeClass(element, classname);
      else this.renderer.addClass(element, classname);
    });
  }

  private getKeyToUse() {
    //note: if the filter is a singleton don't have to do anything here, otherwise need to make sure that the correct value is returned here
    let key = this.filterItemKey;
    
    if (key.match(/playerHasCard/i)) key = this.filterManagerService.filters.playerHasCard.string;

    return key;
  }

  private resetElement(elementToReset: HTMLElement | ElementRef<any>) {
    if (!elementToReset) return;
    //note: elToReset could b

    //todo: need to reset the element in this.filterItem?.elementToReset
    let htmlElement = elementToReset
    if ((elementToReset as any).nativeElement) htmlElement = (elementToReset as any).nativeElement as HTMLElement;

    //todo: two options so far (input and option/select)
    
    debugger;
    
  }
}
