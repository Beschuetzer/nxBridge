import { Component, Input, OnInit, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { dealsListDealsButtonChoices } from '@nx-bridge/constants';
import { FilterItem, FilterItems } from '@nx-bridge/interfaces-and-types';
import { debug } from 'node:console';

@Component({
  selector: 'nx-bridge-filter-manager-item',
  templateUrl: './filter-manager-item.component.html',
  styleUrls: ['./filter-manager-item.component.scss']
})
export class FilterManagerItemComponent implements OnInit {
  @Input() filterItem: FilterItem | null = null;
  @Input() filterItemName = '';
  @Input() indexOfItem = -1;
  @Output() deletion = new EventEmitter<number>();
  public messageToShow = '';
  public closeButtonHtmlEntity = dealsListDealsButtonChoices[1];
  private errorClassnames = ['color-red-light'];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void 
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  {
    debugger;

    console.log('filterItem =', this.filterItem);
    if (this.filterItem?.error) {
      console.log('error------------------------------------------------');
      this.changeErrorClasses(this.elRef.nativeElement, false);
      this.messageToShow = this.filterItem.error;
    }
    else {
      console.log('no error------------------------------------------------');
      this.changeErrorClasses(this.elRef.nativeElement, false);
      this.messageToShow = this.filterItem?.message ? this.filterItem?.message : '';
    }
  }

  
  onDelete() {
    this.deletion.emit(this.indexOfItem);
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
}
